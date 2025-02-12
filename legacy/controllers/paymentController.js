const Payment = require('../models/Payment'); // Modelo de pago
const axios = require('axios'); // Para interactuar con la API de Wompi

// Configuración de Wompi
const WOMPI_API_KEY = process.env.WOMPI_API_KEY;
const WOMPI_URL = 'https://sandbox.wompi.co/v1';

class PaymentController {
  // Inicia el pago
  static async createPayment(req, res) {
    try {
      const { sponsor_id, camper_id, amount, payment_method } = req.body;

      // Crear registro en la base de datos
      const payment = await Payment.create({
        sponsor_id,
        camper_id,
        amount,
        payment_method,
      });

      // Crear el enlace de pago en Wompi
      const response = await axios.post(`${WOMPI_URL}/transactions`, {
        amount_in_cents: amount * 100, // Wompi maneja centavos
        currency: 'COP',
        reference: `PAYMENT-${payment.id}`,
        payment_method: {
          type: payment_method, // 'CARD', 'PSE', etc.
        },
      }, {
        headers: {
          Authorization: `Bearer ${WOMPI_API_KEY}`,
        },
      });

      // Actualizar el registro con el transaction_id
      payment.transaction_id = response.data.data.id;
      payment.wompi_reference = response.data.data.reference;
      await payment.save();

      res.json({ success: true, payment_url: response.data.data.payment_link });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error iniciando el pago' });
    }
  }

  // Manejar Webhooks
  static async handleWebhook(req, res) {
    try {
      const { data, event } = req.body;

      // Buscar el pago por transaction_id
      const payment = await Payment.findOne({
        where: { transaction_id: data.transaction.id },
      });

      if (!payment) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      // Actualizar el estado del pago
      payment.payment_status = data.transaction.status;
      await payment.save();

      // Opcional: guardar el webhook para auditoría
      await WebhookLog.create({
        payment_id: payment.id,
        event_type: event,
        payload: JSON.stringify(req.body),
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error procesando el webhook' });
    }
  }
}

module.exports = PaymentController;
