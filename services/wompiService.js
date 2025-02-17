const axios = require('axios');

class WompiService {
    constructor() {
        this.apiUrl = process.env.WOMPI_API_URL ;
        this.privateKey = process.env.WOMPI_PRIVATE_KEY;
        this.publicKey = process.env.WOMPI_PUBLIC_KEY;

        if (!this.privateKey || !this.publicKey) {
            throw new Error('Wompi keys no configuradas');
        }
    }

    async createRecurringPayment(data) {
        try {
            // 1. Crear la fuente de pago
            const paymentSourceResponse = await axios.post(
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

            if (!paymentSourceResponse.data.data.id) {
                throw new Error('Error al crear la fuente de pago');
            }

            // 2. Crear la suscripción
            const subscriptionResponse = await axios.post(
                `${this.apiUrl}/subscriptions`,
                {
                    payment_source_id: paymentSourceResponse.data.data.id,
                    plan_id: process.env.WOMPI_PLAN_ID,
                    customer_email: data.customer_data.email
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.privateKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return subscriptionResponse.data.data;

        } catch (error) {
            console.error('Error detallado:', error.response?.data);
            throw new Error(
                error.response?.data?.error_message || 
                'Error al crear la suscripción'
            );
        }
    }

    async cancelSubscription(subscriptionId) {
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
            throw new Error(
                error.response?.data?.error_message || 
                'Error al cancelar la suscripción'
            );
        }
    }

    async getSubscription(subscriptionId) {
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
            throw new Error(
                error.response?.data?.error_message || 
                'Error al obtener la suscripción'
            );
        }
    }
}

// Exportar una instancia
module.exports = new WompiService();