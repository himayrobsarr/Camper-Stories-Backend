const crypto = require("crypto");
const conexion = require('../helpers/conexion');
const PaymentModel = require("../models/paymentModel");
const DonationModel = require("../models/donationModel");
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
        try {
            const paymentData = req.body;

            // Verificar que se envían los datos requeridos
            if (!paymentData || !paymentData.reference || !paymentData.amountInCents || !paymentData.currency) {
                return res.status(400).json({ error: "Datos incompletos en la solicitud." });
            }

            // Generar la firma
            const signature = generateSignatureHelper(paymentData.reference, paymentData.amountInCents, paymentData.currency);

            const transactionId = paymentData.reference; // Ahora `reference` es el ID en `PAYMENT`
            const amount = paymentData.amountInCents / 100;
            const paymentStatus = paymentData.status ? paymentData.status.toLowerCase() : "pending";
            const paymentMethod = paymentData.paymentMethodType ? paymentData.paymentMethodType.toLowerCase() : "unknown";
            const userId = Number(paymentData.customerData?.id) || null;
            const message = `Donation via ${paymentMethod}`;

            // Iniciar transacción
            const { connection } = await conexion.getConexion();
            if (!connection) throw new Error("No se pudo obtener conexión a la base de datos.");

            try {
                await connection.beginTransaction();
                // Insertar en la tabla PAYMENT
                console.log('Intentando crear PAYMENT:', {
                    reference: transactionId,
                    sponsor_id: null,
                    user_id: userId,
                    amount: amount,
                    currency: paymentData.currency,
                    transaction_id: transactionId,
                    payment_status: paymentStatus,
                    payment_method: paymentMethod,
                });

                const payment = await PaymentModel.create({
                    reference: transactionId, // `reference` ahora es el ID
                    sponsor_id: null,
                    user_id: userId,
                    amount: amount,
                    currency: paymentData.currency,
                    transaction_id: transactionId,
                    payment_status: paymentStatus,
                    payment_method: paymentMethod,
                });
                console.log('PAYMENT creado:', payment);
                // Insertar en la tabla DONATION
                const donation = await DonationModel.create({
                    payment_id: transactionId, // Se relaciona con `reference`
                    message: message,
                    amount: amount,
                    camper_id: null,
                    user_id: userId,
                });

                // Confirmar transacción
                await connection.commit();
                connection.release();

                return res.status(200).json({
                    message: "Datos guardados correctamente.",
                    signature,
                    payment,
                    donation,
                });
            } catch (error) {
                await connection.rollback();
                connection.release();
                console.error("Error guardando la información del pago:", error);
                return res.status(500).json({ error: "Error interno del servidor." });
            }
        } catch (error) {
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