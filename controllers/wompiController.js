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

    async initSubscription(req, res) {
        try {
            const { planId, customerData } = req.body;
            const userId = req.user.id;

            // Validar que existe el plan
            const plan = await PlanModel.findById(planId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan no encontrado'
                });
            }

            // Crear referencia única
            const reference = `SUB-${Date.now()}-${Math.random().toString(36).substring(7)}`;

            // Preparar datos iniciales de la suscripción
            const subscriptionData = {
                user_id: userId,
                plan_id: planId,
                sponsor_id: req.user.sponsor_id, // Agregamos sponsor_id
                reference: reference,
                status: 'pending',
                payment_source_id: null // Se actualizará después
            };

            // Guardar suscripción inicial
            await SubscriptionModel.create(subscriptionData);

            // Retornar datos para el widget
            res.json({
                success: true,
                data: {
                    reference: reference,
                    publicKey: process.env.WOMPI_PUBLIC_KEY,
                    redirectUrl: `${process.env.FRONTEND_URL}/subscription/callback`,
                    amountInCents: Math.round(plan.main_price * 100), // Usando main_price de tu tabla PLAN
                    currency: 'COP',
                    planDetails: {
                        id: plan.id,
                        name: plan.name || 'Plan Premium',
                        price: plan.main_price
                    }
                }
            });

        } catch (error) {
            console.error('Error en initSubscription:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al iniciar la suscripción'
            });
        }
    }

    async processSubscription(req, res) {
        try {
            const {
                payment_source_id,
                acceptance_token,
                status,
                reference
            } = req.body;

            // Buscar la suscripción por referencia
            const subscription = await SubscriptionModel.findByReference(reference);
            if (!subscription) {
                throw new Error('Suscripción no encontrada');
            }

            if (status === 'APPROVED') {
                // Crear suscripción recurrente en Wompi
                const recurringPayment = await WompiService.createRecurringPayment({
                    payment_source_id,
                    acceptance_token,
                    customer_data: {
                        email: subscription.email // Del JOIN con USER
                    }
                });

                // Actualizar la suscripción con los datos de Wompi
                await SubscriptionModel.updateStatus(subscription.id, {
                    status: 'active',
                    payment_source_id,
                    subscription_id: recurringPayment.id
                });

                res.json({
                    success: true,
                    message: 'Suscripción procesada exitosamente',
                    data: recurringPayment
                });
            } else {
                await SubscriptionModel.updateStatus(subscription.id, {
                    status: 'failed'
                });
                throw new Error('El pago no fue aprobado');
            }

        } catch (error) {
            console.error('Error en processSubscription:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al procesar la suscripción'
            });
        }
    }
}

// Exportar la clase directamente
module.exports = WompiController;