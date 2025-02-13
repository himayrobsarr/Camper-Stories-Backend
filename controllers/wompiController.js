const crypto = require("crypto");
const conexion = require('../helpers/conexion');
const PaymentModel = require("../models/paymentModel");
const DonationModel = require("../models/donationModel");
const WebhookLogModel = require("../models/webhooklogModel");
const INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;

/**
 * Función para generar la firma
 */
function generateSignatureHelper(reference, amountInCents, currency) {
    if (!INTEGRITY_KEY) {
        throw new Error("INTEGRITY_KEY no está configurada.");
    }

    // Normalizar los valores
    const cleanReference = reference.toString();
    const cleanAmount = amountInCents.toString();
    const cleanCurrency = currency.toUpperCase();

    // Crear el string a firmar
    const stringToSign = `${cleanReference}${cleanAmount}${cleanCurrency}${INTEGRITY_KEY}`;

    // Generar el hash SHA-256
    return crypto.createHash("sha256").update(stringToSign, 'utf8').digest("hex");
}

const WompiController = {
    generateSignature: async (req, res) => {
        try {
            const { reference, amountInCents, currency } = req.body;
            if (!reference || !amountInCents || !currency) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            const signature = generateSignatureHelper(reference, amountInCents, currency);
            return res.status(200).json({ signature });
        } catch (error) {
            console.error("Error generando la firma:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },
    /**
     * Guarda la información del pago y genera la firma
     */
    savePaymentInfo: async (req, res) => {
        const { connection } = await conexion.getConexion();
        try {
            const paymentData = req.body;

            if (!paymentData || !paymentData.reference || !paymentData.amountInCents || !paymentData.currency) {
                return res.status(400).json({ error: "Datos incompletos en la solicitud." });
            }

            await connection.beginTransaction();

            const paymentMethodType = paymentData.paymentMethodType ? paymentData.paymentMethodType.toLowerCase() : 'unknown';

            const payment = await PaymentModel.create({
                reference: paymentData.reference,
                sponsor_id: null,
                user_id: Number(paymentData.customerData?.id) || null,
                amount: paymentData.amountInCents / 100,
                currency: paymentData.currency,
                transaction_id: paymentData.reference,
                payment_status: paymentData.status?.toLowerCase() || 'pending',
                payment_method: paymentMethodType,
            });

            const donation = await DonationModel.create({
                payment_id: paymentData.reference,
                message: `Donation via ${paymentMethodType}`,
                amount: paymentData.amountInCents / 100,
                camper_id: null,
                user_id: Number(paymentData.customerData?.id) || null,
            });

            await connection.commit();

            return res.status(200).json({
                message: "Datos guardados correctamente.",
                signature: generateSignatureHelper(paymentData.reference, paymentData.amountInCents, paymentData.currency),
                payment,
                donation,
            });
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error("Error en savePaymentInfo:", error);
            return res.status(500).json({ error: "Error interno del servidor." });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },
    /**
     * Maneja el webhook recibido desde Wompi
     */
    handlePaymentWebhook: async (req, res) => {
        let connection;
        try {
            const paymentData = req.body;

            if (!paymentData || !paymentData.id || !paymentData.amount_in_cents || !paymentData.status || !paymentData.reference) {
                return res.status(400).json({ error: "Datos incompletos en el webhook." });
            }

            const transactionId = paymentData.id;
            const amount = paymentData.amount_in_cents / 100;
            const paymentStatus = paymentData.status.toLowerCase();
            const paymentMethod = paymentData.payment_method_type ? paymentData.payment_method_type.toLowerCase() : "unknown";
            const reference = paymentData.reference;
            const userId = paymentData.customer_data?.id || null;

            const conexionResult = await conexion.getConexion();
            connection = conexionResult.connection;

            if (!connection) {
                return res.status(500).json({ error: "Error al conectar con la base de datos." });
            }

            await connection.beginTransaction();

            // 📌 **Verificar si el pago ya existe en `PAYMENT`**
            const existingPayment = await PaymentModel.findById(reference);

            if (!existingPayment) {
                console.log("Pago no encontrado, creando nuevo registro en PAYMENT.");

                await PaymentModel.create({
                    reference,
                    sponsor_id: null,
                    user_id: userId,
                    amount: amount,
                    currency: paymentData.currency,
                    transaction_id: transactionId,
                    payment_status: paymentStatus,
                    payment_method: paymentMethod,
                });

                console.log("Pago registrado correctamente en PAYMENT.");
            } else {
                console.log("El pago ya existe en PAYMENT, no es necesario crearlo.");
            }

            // 📌 **Insertar en `WEBHOOK_LOG`**
            const webhookLog = await WebhookLogModel.create({
                payment_id: reference,
                event_type: "payment_received",
                payload: JSON.stringify(paymentData),
                transaction_id: transactionId,
                status: paymentStatus.toUpperCase(),
            });

            await connection.commit();
            connection.release();

            console.log("Webhook procesado y datos guardados correctamente.");

            return res.status(200).json({
                message: "Webhook procesado correctamente.",
                webhookLog,
            });
        } catch (error) {
            console.error("Error procesando el webhook:", error);

            if (connection) {
                await connection.rollback();
            }

            return res.status(500).json({ error: "Error interno del servidor." });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
};

module.exports = WompiController;