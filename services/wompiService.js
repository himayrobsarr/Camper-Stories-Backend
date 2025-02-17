const axios = require('axios');
const crypto = require('crypto');
const SubscriptionModel = require('../models/subscriptionModel');

class WompiService {
    constructor() {
        this.apiKey = process.env.WOMPI_PRIVATE_KEY;
        this.baseUrl = process.env.WOMPI_API_URL;
    }

    static verifyWebhookSignature(req) {
        const signature = req.headers['x-wompi-signature'];
        const webhookKey = process.env.WOMPI_WEBHOOK_KEY;
        
        const hash = crypto
            .createHmac('sha256', webhookKey)
            .update(JSON.stringify(req.body))
            .digest('hex');
        
        return signature === hash;
    }

    static async handleSubscriptionCreated(data) {
        try {
            const { subscription } = data;
            await SubscriptionModel.updateStatus(subscription.reference, 'active');
        } catch (error) {
            console.error('Error handling subscription created:', error);
            throw error;
        }
    }

    static async handleSubscriptionUpdated(data) {
        try {
            const { subscription } = data;
            await SubscriptionModel.updateStatus(
                subscription.reference, 
                subscription.status.toLowerCase()
            );
        } catch (error) {
            console.error('Error handling subscription updated:', error);
            throw error;
        }
    }

    static async handleSubscriptionCancelled(data) {
        try {
            const { subscription } = data;
            await SubscriptionModel.updateStatus(subscription.reference, 'cancelled');
        } catch (error) {
            console.error('Error handling subscription cancelled:', error);
            throw error;
        }
    }

    static async createSubscription(data) {
        try {
            const response = await axios.post(
                `${process.env.WOMPI_API_URL}/subscriptions`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating subscription in Wompi:', error);
            throw error;
        }
    }
}

module.exports = WompiService;