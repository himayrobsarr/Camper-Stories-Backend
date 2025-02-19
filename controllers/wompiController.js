const crypto = require("crypto");
const conexion = require('../helpers/conexion');
const PaymentModel = require("../models/paymentModel");
const DonationModel = require("../models/donationModel");
const SponsorModel = require("../models/sponsorModel");
const PlanModel = require("../models/planModel");
const WompiService = require("../services/wompiService");
const WebhookLogModel = require("../models/webhooklogModel");
const SubscriptionModel = require('../models/subscriptionModel');
const landingAIModel = require('../models/landingAIModel');
const { sendWelcomeEmail, sendNotificationEmail } = require('./emailSendindController');


class WompiController {
    constructor() {
        this.INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;
        this.validateEnvironmentVars();
    }

    validateEnvironmentVars() {
        const requiredEnvVars = [
            'WOMPI_INTEGRITY_KEY'
        ];

        requiredEnvVars.forEach(varName => {
            if (!process.env[varName]) {
                throw new Error(`Missing required environment variable: ${varName}`);
            }
        });
    }

    static generateSignatureHelper(reference, amountInCents, currency) {
        const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
        if (!integrityKey) {
            throw new Error("INTEGRITY_KEY no está configurada.");
        }

        // Normalizar los valores
        const cleanReference = reference.toString();
        const cleanAmount = amountInCents.toString();
        const cleanCurrency = currency.toUpperCase();

        // Crear el string a firmar
        const stringToSign = `${cleanReference}${cleanAmount}${cleanCurrency}${integrityKey}`;

        // Generar el hash SHA-256
        return crypto.createHash("sha256").update(stringToSign, 'utf8').digest("hex");
    }

    static async generateSignature(req, res) {
        try {
            const { reference, amountInCents, currency } = req.body;

            if (!reference || !amountInCents || !currency) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            const signature = WompiController.generateSignatureHelper(reference, amountInCents, currency);
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
            const { planId, customerData, amount, frequency } = req.body;
            
            // Verificar que tenemos todos los datos necesarios
            if (!planId) {
                return res.status(400).json({
                    success: false,
                    error: 'El planId es requerido'
                });
            }

            // Obtener el userId del token (asumiendo que está en req.user)
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
            }

            // Validar que el plan exista y sea válido
            const plan = await PlanModel.findById(planId);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    error: 'Plan no encontrado'
                });
            }

            // Validar que no sea el plan PIONEER
            if (plan.id === 4) {
                return res.status(400).json({
                    success: false,
                    error: 'No se puede suscribir al plan PIONEER'
                });
            }

            // Generar referencia única
            const reference = `sub_${Date.now()}_${userId}`;
            
            // Calcular monto en centavos
            const amountInCents = Math.round(plan.main_price * 100);

            // Guardar referencia inicial
            await SubscriptionModel.saveInitialReference({
                reference,
                planId,
                userId,
                amount: amountInCents,
                frequency
            });

            // Agregar logs para debugging
            console.log('Datos de suscripción:', {
                reference,
                planId,
                userId,
                amountInCents,
                publicKey: process.env.WOMPI_PUBLIC_KEY
            });

            return res.status(200).json({
                success: true,
                amountInCents,
                reference,
                publicKey: process.env.WOMPI_PUBLIC_KEY
            });

        } catch (error) {
            console.error('Error detallado en initSubscription:', {
                error: error.message,
                stack: error.stack,
                body: req.body,
                user: req.user
            });
            
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al iniciar la suscripción'
            });
        }
    }

    static async processSubscription(req, res) {
        try {
            const {
                id,
                payment_source_id,
                acceptance_token,
                status,
                reference,
                subscription_id
            } = req.body;

            // Validar que la suscripción exista
            const subscription = await SubscriptionModel.getByReference(reference);
            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    error: 'Suscripción no encontrada'
                });
            }

            // Actualizar estado de la suscripción
            await SubscriptionModel.updateStatus(reference, status);

            // Si el pago fue exitoso, actualizar el plan del sponsor
            if (status === 'APPROVED') {
                await SponsorModel.updatePlan(
                    subscription.user_id,
                    subscription.plan_id,
                    {
                        startDate: new Date(),
                        status: 'activo',
                        payment_source_id,
                        subscription_id
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

    static async cancelSubscription(req, res) {
        try {
            const { subscriptionId } = req.params;
            const userId = req.user.id;

            // Validar que la suscripción exista y pertenezca al usuario
            const subscription = await SubscriptionModel.findBySubscriptionId(subscriptionId);
            if (!subscription || subscription.user_id !== userId) {
                return res.status(404).json({
                    success: false,
                    error: 'Suscripción no encontrada'
                });
            }

            // Cancelar suscripción en Wompi
            // Aquí iría la lógica para cancelar en Wompi

            // Actualizar estado en nuestra base de datos
            await SubscriptionModel.updateStatus(subscription.reference, 'CANCELLED');
            
            // Volver al plan PIONEER
            await SponsorModel.updatePlan(userId, 4, {
                status: 'activo'
            });

            return res.status(200).json({
                success: true,
                message: 'Suscripción cancelada exitosamente'
            });

        } catch (error) {
            console.error('Error en cancelSubscription:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al cancelar la suscripción'
            });
        }
    }

    static async getUserSubscriptions(req, res) {
        try {
            const userId = req.user.id;
            const subscriptions = await SubscriptionModel.getUserSubscriptions(userId);

            return res.status(200).json({
                success: true,
                data: subscriptions
            });
        } catch (error) {
            console.error('Error en getUserSubscriptions:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al obtener las suscripciones'
            });
        }
    }

    static async getSubscription(req, res) {
        try {
            const { subscriptionId } = req.params;
            const userId = req.user.id;

            const subscription = await SubscriptionModel.findBySubscriptionId(subscriptionId);

            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    error: 'Suscripción no encontrada'
                });
            }

            // Verificar que la suscripción pertenece al usuario
            if (subscription.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'No autorizado'
                });
            }

            return res.status(200).json({
                success: true,
                data: subscription
            });
        } catch (error) {
            console.error('Error en getSubscription:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al obtener la suscripción'
            });
        }
    }

    static async updatePaymentMethod(req, res) {
        try {
            const { subscriptionId } = req.params;
            const { payment_source_id } = req.body;
            const userId = req.user.id;

            // Verificar que la suscripción existe y pertenece al usuario
            const subscription = await SubscriptionModel.findBySubscriptionId(subscriptionId);
            if (!subscription || subscription.user_id !== userId) {
                return res.status(404).json({
                    success: false,
                    error: 'Suscripción no encontrada'
                });
            }

            // Actualizar método de pago en Wompi
            const wompiResponse = await WompiService.updatePaymentSource(subscriptionId, payment_source_id);

            // Actualizar en nuestra base de datos
            await SubscriptionModel.updatePaymentMethod(subscriptionId, {
                payment_source_id
            });

            return res.status(200).json({
                success: true,
                message: 'Método de pago actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error en updatePaymentMethod:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al actualizar el método de pago'
            });
        }
    }

    static async getSubscriptionPayments(req, res) {
        try {
            const { subscriptionId } = req.params;
            const userId = req.user.id;

            // Verificar que la suscripción existe y pertenece al usuario
            const subscription = await SubscriptionModel.findBySubscriptionId(subscriptionId);
            if (!subscription || subscription.user_id !== userId) {
                return res.status(404).json({
                    success: false,
                    error: 'Suscripción no encontrada'
                });
            }

            const payments = await SubscriptionModel.getSubscriptionPayments(subscriptionId);

            return res.status(200).json({
                success: true,
                data: payments
            });
        } catch (error) {
            console.error('Error en getSubscriptionPayments:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al obtener los pagos'
            });
        }
    }

    static async receiveWebhook(req, res) {
        try {
            const event = req.body;
            console.log("Webhook recibido:", event);

            // 1. Validar firma del webhook
            const secret = process.env.WOMPI_EVENTS_SECRET;
            if (!event?.signature?.properties || !event?.timestamp || !event?.signature?.checksum) {
                return res.status(400).json({ error: "Faltan datos necesarios para la validación de la firma." });
            }

            const { properties, checksum: wompiChecksum } = event.signature;
            const timestamp = event.timestamp;
            let concatenated = "";

            for (const prop of properties) {
                const value = WompiController.getValueFromEventData(event.data, prop);
                if (value === undefined) {
                    return res.status(400).json({ error: `Falta el valor de ${prop} en los datos del evento.` });
                }
                concatenated += value;
            }
            concatenated += timestamp + secret;

            const localChecksum = crypto.createHash("sha256").update(concatenated, "utf8").digest("hex").toUpperCase();

            if (wompiChecksum.toUpperCase() !== localChecksum) {
                console.warn("Checksum inválido. Posible suplantación de evento.");
                return res.status(403).json({ error: "Checksum mismatch" });
            }

            // 2. Extraer información clave del webhook
            const eventType = event.event || null;
            const environment = event.environment || null;
            let transactionId = event.data?.transaction?.id || null;
            let reference = event.data?.transaction?.reference || null;
            let status = event.data?.transaction?.status || null;
            let amount = event.data?.transaction?.amount_in_cents / 100 || null;
            let customerEmail = event.data?.transaction?.customer_email || null;
            let paymentMethod = event.data?.transaction?.payment_method_type || null;
            let customerData = event.data?.transaction?.customer_data || {};
            let billingData = event.data?.transaction?.billing_data || {};
            let finalizedAt = event.data?.transaction?.finalized_at || null;

            if (!transactionId || !reference || !status) {
                return res.status(400).json({ error: "Datos de transacción incompletos." });
            }

            // 3. Verificar si el evento ya ha sido procesado (evitar duplicados)
            const existingEvent = await WebhookLogModel.findWebhookLog(transactionId, reference);
            if (existingEvent) {
                console.log("Evento duplicado encontrado. No se procesará.");
                return res.status(200).json({ received: false, message: "Evento duplicado." });
            }

            // 4. Guardar el webhook en la base de datos (webhook_logs)
            await WebhookLogModel.create(eventType, environment, transactionId, reference, status, event, wompiChecksum);

            // 6. Enviar correos solo si el pago fue aprobado
            if (status === "APPROVED" && reference.startsWith("ia_")) {
                console.log("Pago aprobado. Enviando correos y guardando informacion...");

                console.log("Pago aprobado. Actualizando estado de inscripción a 'EXITOSO'...");
                // Actualiza el estado de la inscripción usando la referencia de pago
                await landingAIModel.updateInscriptionStatus(reference, finalizedAt);
                console.log("Estado de inscripción actualizado. Enviando correos...");

                // Enviar correo de bienvenida al cliente
                await sendWelcomeEmail(customerEmail, customerData.full_name);

                // Enviar correo de notificación al equipo de Campuslands
                const notifData = {
                    email: customerEmail,
                    username: customerData.full_name,
                    phone: customerData.phone_number,
                    documentNumber: billingData?.legalId || "No Disponible, visita el excel",
                    documentType: billingData?.legalIdType || "",
                    paymentMethod,
                    amount,
                    contactEmail: "miguel@fundacioncampuslands.com"
                };

                await sendNotificationEmail(notifData);
            }

            return res.status(200).json({ received: true, message: "Webhook procesado exitosamente" });

        } catch (error) {
            console.error("Error en webhook:", error);

            // Dependiendo del tipo de error, respondemos con el código adecuado
            if (error.message.includes("Checksum mismatch")) {
                return res.status(403).json({ error: error.message });
            }
            // Para otros tipos de errores, puedes devolver un 500 general
            return res.status(500).json({ error: "Ocurrió un error interno en el servidor." });
        }
    }


    static getValueFromEventData(data, path) {
        const parts = path.split(".");
        let current = data;
        for (const p of parts) {
            if (!current || !Object.prototype.hasOwnProperty.call(current, p)) {
                return ""; // si no existe, retornar vacío
            }
            current = current[p];
        }
        return current.toString();
    }

    static async savePaymentInfo(req, res) {
        const { connection } = await conexion.getConexion();
        try {
            const paymentData = req.body;

            if (!paymentData || !paymentData.reference || !paymentData.amountInCents || !paymentData.currency || !paymentData.signature) {
                return res.status(400).json({ error: "Datos incompletos en la solicitud." });
            }

            const expectedSignature = WompiController.generateSignatureHelper(paymentData.reference, paymentData.amountInCents, paymentData.currency);

            // Comparar la firma generada con la firma enviada en la solicitud
            if (paymentData.signature !== expectedSignature) {
                if (connection) await connection.rollback();
                return res.status(400).json({ error: "Firma inválida." });
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
                sponsor_id: Number(paymentData.customerData?.id) || null,
            });

            await connection.commit();

            return res.status(200).json({
                message: "Datos guardados correctamente.",
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

    }
}

// Exportar la clase directamente
module.exports = WompiController;