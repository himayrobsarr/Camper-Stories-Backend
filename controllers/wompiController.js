const crypto = require("crypto");
const conexion = require('../helpers/conexion');
const PaymentModel = require("../models/paymentModel");
const DonationModel = require("../models/donationModel");
const SponsorModel = require("../models/sponsorModel");
const PlanModel = require("../models/planModel");
const WompiService = require("../services/wompiService");

class WompiController {
    constructor() {
        this.INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;
        this.validateEnvironmentVars();
    }

    validateEnvironmentVars() {
        const requiredEnvVars = [
            'WOMPI_INTEGRITY_KEY',
            'WOMPI_PUBLIC_KEY',
            'WOMPI_PLAN_ID'
        ];

        requiredEnvVars.forEach(varName => {
            if (!process.env[varName]) {
                throw new Error(`Missing required environment variable: ${varName}`);
            }
        });
    }

    generateSignatureHelper(reference, amountInCents, currency) {
        if (!this.INTEGRITY_KEY) {
            throw new Error("INTEGRITY_KEY no está configurada.");
        }

        // Normalizar los valores
        const cleanReference = reference.toString();
        const cleanAmount = amountInCents.toString();
        const cleanCurrency = currency.toUpperCase();

        // Crear el string a firmar
        const stringToSign = `${cleanReference}${cleanAmount}${cleanCurrency}${this.INTEGRITY_KEY}`;

        // Generar el hash SHA-256
        return crypto.createHash("sha256").update(stringToSign, 'utf8').digest("hex");
    }

    async generateSignature(req, res) {
        try {
            const { reference, amountInCents, currency } = req.body;
            
            if (!reference || !amountInCents || !currency) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            const signature = this.generateSignatureHelper(reference, amountInCents, currency);
            return res.status(200).json({ signature });
        } catch (error) {
            console.error("Error generando la firma:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async savePaymentInfo(req, res) {
        let connection;
        try {
            connection = (await conexion.getConexion()).connection;
            const paymentData = req.body;

            if (!paymentData || !paymentData.reference || !paymentData.amountInCents || !paymentData.currency) {
                return res.status(400).json({ error: "Datos incompletos en la solicitud." });
            }

            await connection.beginTransaction();

            // 1. Verificar si el sponsor ya existe por email
            let sponsorId = null;
            if (paymentData.customerData && paymentData.customerData.email) {
                const [existingSponsor] = await connection.query(
                    'SELECT u.id FROM USER u WHERE u.email = ? AND u.role_id = 2',
                    [paymentData.customerData.email]
                );

                if (existingSponsor.length > 0) {
                    sponsorId = existingSponsor[0].id;
                }
            }

            // 2. Si no existe el sponsor y el pago está aprobado, crearlo
            if (!sponsorId && paymentData.status === 'APPROVED' && paymentData.customerData) {
                const sponsor = await SponsorModel.createSponsorWithRelations({
                    ...paymentData.customerData,
                    plan_id: paymentData.plan_id
                });
                sponsorId = sponsor.id;
            }

            // 3. Crear el payment con el sponsor_id (si existe)
            const payment = await PaymentModel.create({
                reference: paymentData.reference,
                amount: paymentData.amountInCents,
                currency: paymentData.currency,
                transaction_id: paymentData.transaction_id,
                payment_status: paymentData.status,
                payment_method: paymentData.paymentMethodType,
                sponsor_id: sponsorId
            });

            // 4. Crear la donación
            const donation = await DonationModel.create({
                payment_id: payment.id,
                amount: paymentData.amountInCents,
                message: paymentData.customerData?.message || '',
                user_id: sponsorId
            });

            await connection.commit();

            return res.status(200).json({
                message: "Datos guardados correctamente.",
                payment,
                donation,
                sponsor_created: !sponsorId ? true : false,
                sponsor_existed: sponsorId ? true : false
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
    }

    async initSubscription(req, res) {
        try {
            const { planId, customerData } = req.body;

            if (!planId || !customerData) {
                return res.status(400).json({ error: 'Datos incompletos' });
            }

            const plan = await PlanModel.findById(planId);
            if (!plan) {
                return res.status(404).json({ error: 'Plan no encontrado' });
            }

            const reference = `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            return res.status(200).json({
                reference,
                amountInCents: plan.price * 100,
                publicKey: process.env.WOMPI_PUBLIC_KEY,
                installments: plan.installments || 12
            });
        } catch (error) {
            console.error('Error en initSubscription:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async processSubscription(req, res) {
        try {
            const { transactionId, payment_source_id, acceptance_token, status, reference } = req.body;

            if (!transactionId || !payment_source_id || !acceptance_token || !status || !reference) {
                return res.status(400).json({ error: 'Datos incompletos en la respuesta de Wompi' });
            }

            if (status !== 'APPROVED') {
                return res.status(400).json({ error: 'Pago no aprobado' });
            }

            const subscription = await WompiService.createRecurringPayment({
                payment_source_id,
                acceptance_token,
                plan_id: process.env.WOMPI_PLAN_ID,
                customer_data: req.body.customer_data || {}
            });

            if (!subscription || !subscription.id) {
                throw new Error('Error al crear la suscripción en Wompi');
            }

            await SponsorModel.createWithSubscription({
                subscription_id: subscription.id,
                transaction_id: transactionId,
                reference,
                status: subscription.status
            });

            return res.status(200).json({ subscription });
        } catch (error) {
            console.error('Error en processSubscription:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

// Exportar la clase directamente
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