const crypto = require("crypto");
const conexion = require('../helpers/conexion');
const PaymentModel = require("../models/paymentModel");
const DonationModel = require("../models/donationModel");
const SponsorModel = require("../models/sponsorModel");
const INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;
const bcrypt = require('bcrypt');
const PasswordResetController = require('./passwordResetController');

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
        let connection;
        try {
            connection = (await conexion.getConexion()).connection;
            const paymentData = req.body;

            // 1. Primero crear el payment sin sponsor_id
            const payment = await PaymentModel.create({
                reference: paymentData.reference,
                amount: paymentData.amountInCents,
                currency: paymentData.currency,
                transaction_id: paymentData.transaction_id,
                payment_status: paymentData.status,
                payment_method: paymentData.paymentMethodType,
                sponsor_id: null,  // Inicialmente null
                user_id: null
            });

            // 2. Si el pago es aprobado, crear el sponsor
            if (paymentData.status === 'APPROVED') {
                const sponsor = await SponsorModel.createSponsorWithRelations({
                    ...paymentData.customerData,
                    plan_id: paymentData.plan_id
                });

                // 3. Actualizar el payment con el sponsor_id
                await PaymentModel.update(payment.id, { sponsor_id: sponsor.id });
            }

            // 4. Crear la donación
            const donation = await DonationModel.create({
                payment_id: payment.id,
                amount: paymentData.amountInCents,
                message: paymentData.customerData.message || ''
            });

            res.status(200).json({
                message: "Datos guardados correctamente",
                payment,
                donation
            });
        } catch (error) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error("Error en savePaymentInfo:", error);
            return res.status(500).json({ error: "Error interno del servidor." });
        }
    }
};

module.exports = WompiController;

// const crypto = require("crypto");
// const PaymentModel = require("../models/paymentModel");
// const DonationModel = require('../models/donationModel');
// const INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;
// // const WebhookLogModel = require('../models/webhooklogModel');

// const WompiController = {
//     generateSignature: async (req, res) => {
//         try {
//             const { reference, amountInCents, currency } = req.body;

//             if (!reference || !amountInCents || !currency) {
//                 return res.status(400).json({ error: "Faltan datos requeridos" });
//             }

//             if (!INTEGRITY_KEY) {
//                 return res.status(500).json({ error: "INTEGRITY_KEY no está configurada." });
//             }

//             // Asegurar que los valores sean exactamente como los necesitamos
//             const cleanReference = reference.toString();
//             const cleanAmount = amountInCents.toString();
//             const cleanCurrency = currency.toUpperCase();

//             // Construir el string sin espacios ni caracteres adicionales
//             const stringToSign = `${cleanReference}${cleanAmount}${cleanCurrency}${INTEGRITY_KEY}`;

//             // Generar la firma usando UTF-8
//             const signature = crypto
//                 .createHash("sha256")
//                 .update(stringToSign, 'utf8')
//                 .digest("hex");

//             console.log(signature)

//             return res.status(200).json({ signature });
//         } catch (error) {
//             console.error("Error generando la firma:", error);
//             return res.status(500).json({ error: "Error interno del servidor" });
//         }
//     },
//     /**
//      * Maneja el webhook recibido desde Wompi
//      */
//     handlePaymentWebhook: async (req, res) => {
//         const paymentData = req.body;

//         try {
//             // Verificar que los datos básicos y la firma existan
//             if (!paymentData || !paymentData.id || !paymentData.amountInCents || !paymentData.status || !paymentData.signature) {
//                 return res.status(400).json({ error: "Datos incompletos en el JSON recibido." });
//             }

//             //Verificar la firma
//             const { reference, amountInCents, currency, signature } = paymentData;
//             const cleanReference = reference.toString();
//             const cleanAmount = amountInCents.toString();
//             const cleanCurrency = currency.toUpperCase();
//             const stringToSign = `${cleanReference}${cleanAmount}${cleanCurrency}${INTEGRITY_KEY}`;
//             const generatedSignature = crypto
//                 .createHash("sha256")
//                 .update(stringToSign, 'utf8')
//                 .digest("hex");

//             if (generatedSignature !== signature) {
//                 return res.status(401).json({ error: "Firma inválida. Los datos no son confiables." });
//             }

//             // const generatedSignature = await WompiController.generateSignature(...paymentData);

//             // Extraer los datos relevantes
//             const transactionId = paymentData.id;
//             const amount = paymentData.amountInCents / 100;
//             const paymentStatus = paymentData.status.toLowerCase();
//             const paymentMethod = paymentData.paymentMethodType.toLowerCase();
//             const userId = paymentData.customerData?.id || null;
//             const message = `Donation via ${paymentMethod}`;

//             // Iniciar transacción
//             const connection = await conexion.getConnection();
//             await connection.beginTransaction();

//             try {
//                 // Insertar en la tabla PAYMENT
//                 const payment = await PaymentModel.create({
//                     sponsor_id: null,
//                     user_id: userId,
//                     amount: amount,
//                     currency: currency,
//                     transaction_id: transactionId,
//                     payment_status: paymentStatus,
//                     payment_method: paymentMethod,
//                 });

//                 // Insertar en la tabla DONATION
//                 const donation = await DonationModel.create({
//                     payment_id: payment.id,
//                     message: message,
//                     amount: amount,
//                     camper_id: null,
//                     user_id: userId,
//                 });

//                 // // Insertar en la tabla WEBHOOK_LOG
//                 // const webhookLog = await WebhookLogModel.create({
//                 //     payment_id: payment.id,
//                 //     event_type: 'payment_received',
//                 //     payload: JSON.stringify(paymentData),
//                 //     transaction_id: transactionId,
//                 //     status: paymentStatus.toUpperCase(),
//                 // });

//                 // Confirmar transacción
//                 await connection.commit();
//                 connection.release();

//                 return res.status(200).json({
//                     message: "Datos guardados correctamente.",
//                     payment,
//                     donation,
//                     // webhookLog,
//                 });
//             } catch (error) {
//                 // Revertir transacción si algo falla
//                 await connection.rollback();
//                 connection.release();
//                 console.error("Error procesando el webhook:", error);
//                 return res.status(500).json({ error: "Error interno del servidor." });
//             }
//         } catch (error) {
//             console.error("Error verificando la firma:", error);
//             return res.status(500).json({ error: "Error interno del servidor." });
//         }
//     },
// };

// module.exports = WompiController;