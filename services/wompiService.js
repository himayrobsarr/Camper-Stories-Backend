const axios = require('axios');

class WompiService {
    constructor() {
        this.apiUrl = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
        this.privateKey = process.env.WOMPI_PRIVATE_KEY;
        this.publicKey = process.env.WOMPI_PUBLIC_KEY;
    }

    // Crear una suscripción recurrente
    static async createRecurringPayment(data) {
        try {
            const response = await axios.post(
                `${this.apiUrl}/payment_sources`,
                {
                    type: 'CARD',
                    token: data.payment_source_id,
                    customer_email: data.customer_data.email,
                    acceptance_token: data.acceptance_token
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.privateKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Si la fuente de pago se crea exitosamente, crear la suscripción
            if (response.data.data.id) {
                const subscriptionResponse = await axios.post(
                    `${this.apiUrl}/subscriptions`,
                    {
                        payment_source_id: response.data.data.id,
                        plan_id: data.plan_id,
                        customer_data: data.customer_data
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.privateKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                return subscriptionResponse.data.data;
            }

            throw new Error('Error al crear la fuente de pago');

        } catch (error) {
            console.error('Error en createRecurringPayment:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error_message || 'Error al crear la suscripción');
        }
    }

    // Cancelar una suscripción
    static async cancelSubscription(subscriptionId) {
        try {
            const response = await axios.post(
                `${this.apiUrl}/subscriptions/${subscriptionId}/cancel`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${this.privateKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error en cancelSubscription:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error_message || 'Error al cancelar la suscripción');
        }
    }

    // Obtener información de una suscripción
    static async getSubscription(subscriptionId) {
        try {
            const response = await axios.get(
                `${this.apiUrl}/subscriptions/${subscriptionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.privateKey}`
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error en getSubscription:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error_message || 'Error al obtener la suscripción');
        }
    }
}

module.exports = WompiService; 