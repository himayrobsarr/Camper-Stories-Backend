const db = require('../helpers/conexion');

class SubscriptionModel {
    static async create(subscriptionData) {
        try {
            const query = `
                INSERT INTO SUBSCRIPTION (
                    subscription_id,
                    user_id,
                    plan_id,
                    sponsor_id,
                    payment_source_id,
                    reference,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                subscriptionData.subscription_id,
                subscriptionData.user_id,
                subscriptionData.plan_id,
                subscriptionData.sponsor_id,
                subscriptionData.payment_source_id,
                subscriptionData.reference,
                subscriptionData.status || 'pending'
            ];

            const result = await db.query(query, values);
            return result.data;
        } catch (error) {
            console.error('Error en create subscription:', error);
            throw error;
        }
    }

    static async findByReference(reference) {
        try {
            const query = `
                SELECT s.*, p.main_price, u.email
                FROM SUBSCRIPTION s
                JOIN PLAN p ON s.plan_id = p.id
                JOIN USER u ON s.user_id = u.id
                WHERE s.reference = ?
            `;

            const result = await db.query(query, [reference]);
            return result.data[0];
        } catch (error) {
            console.error('Error en findByReference:', error);
            throw error;
        }
    }

    static async updateStatus(subscriptionId, status) {
        try {
            const query = `
                UPDATE SUBSCRIPTION 
                SET status = ?, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE subscription_id = ?
            `;

            const result = await db.query(query, [status, subscriptionId]);
            return result.data;
        } catch (error) {
            console.error('Error en updateStatus:', error);
            throw error;
        }
    }
}

module.exports = SubscriptionModel; 