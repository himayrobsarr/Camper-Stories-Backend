const crypto = require("crypto");
const conexion = require('../helpers/conexion');
const PaymentModel = require("../models/paymentModel");
const DonationModel = require("../models/donationModel");
const SponsorModel = require("../models/sponsorModel");
const PlanModel = require("../models/planModel");
const WompiService = require("../services/wompiService");
const SubscriptionModel = require('../models/subscriptionModel');

class WompiController {
    constructor() {
        this.INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;
        this.validateEnvironmentVars();
    }

    validateEnvironmentVars() {
        const requiredEnvVars = [
            'WOMPI_INTEGRITY_KEY',
            'WOMPI_PUBLIC_KEY'
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

    static async initSubscription(req, res) {
        try {
            const { planId } = req.body;
            const userId = req.user.id; // Del middleware de autenticación

            // Validar que existe el plan
            const plan = await PlanModel.findById(planId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan no encontrado'
                });
            }

            // Verificar que el usuario es un sponsor
            const sponsor = await SponsorModel.findByUserId(userId);
            if (!sponsor) {
                return res.status(400).json({
                    success: false,
                    error: 'Usuario no es un sponsor'
                });
            }

            // Crear referencia única
            const reference = `SUB-${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

            // Guardar referencia temporal
            await SubscriptionModel.saveInitialReference({
                reference,
                planId,
                userId
            });

            // Retornar datos para el widget de Wompi
            return res.status(200).json({
                success: true,
                reference,
                publicKey: process.env.WOMPI_PUBLIC_KEY,
                redirectUrl: `${process.env.FRONTEND_URL}/subscription/callback`,
                amountInCents: Math.round(plan.main_price * 100),
                currency: 'COP'
            });

        } catch (error) {
            console.error('Error en initSubscription:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al iniciar la suscripción'
            });
        }
    }

    static async processSubscription(req, res) {
        try {
            const { id, status, reference } = req.body;

            const subscription = await SubscriptionModel.getByReference(reference);
            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    error: 'Suscripción no encontrada'
                });
            }

            // Actualizar estado de la suscripción
            await SubscriptionModel.updateStatus(reference, status);

            // Si la transacción fue exitosa, actualizar el plan del sponsor
            if (status === 'APPROVED') {
                await SponsorModel.updatePlan(
                    subscription.user_id, 
                    subscription.plan_id,
                    {
                        startDate: new Date(),
                        status: 'activo'
                    }
                );
            }

            return res.status(200).json({
                success: true,
                message: 'Suscripción procesada exitosamente',
                status: status.toLowerCase()
            });

        } catch (error) {
            console.error('Error en processSubscription:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al procesar la suscripción'
            });
        }
    }

    static async handleWebhook(req, res) {
        try {
            const event = req.body;
            
            // Aquí procesarías los eventos de Wompi
            console.log('Webhook recibido:', event);

            return res.status(200).json({ received: true });
        } catch (error) {
            console.error('Error en webhook:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

// Exportar la clase directamente
module.exports = WompiController;