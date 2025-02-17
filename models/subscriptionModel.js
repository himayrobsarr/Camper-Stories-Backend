const db = require('../helpers/conexion');

class SubscriptionModel {
    static async saveInitialReference(data) {
        const query = `
            INSERT INTO SUBSCRIPTION (
                reference,
                plan_id,
                status,
                created_at,
                updated_at
            ) VALUES (?, ?, 'pending', NOW(), NOW())
        `;

        return await db.query(query, [
            data.reference,
            data.planId
        ]);
    }

    static async getByReference(reference) {
        const query = `
            SELECT 
                s.*,
                p.main_price
            FROM SUBSCRIPTION s
            JOIN PLAN p ON s.plan_id = p.id
            WHERE s.reference = ?
        `;
        const result = await db.query(query, [reference]);
        return result.data[0];
    }

    static async create(subscriptionData) {
        const query = `
            INSERT INTO SUBSCRIPTION (
                subscription_id,
                payment_source_id,
                plan_id,
                user_id,
                status,
                reference,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        return await db.query(query, [
            subscriptionData.wompi_subscription_id,
            subscriptionData.wompi_payment_source_id,
            subscriptionData.plan_id,
            subscriptionData.user_id,
            subscriptionData.status,
            subscriptionData.reference
        ]);
    }

    static async updateStatus(reference, status) {
        const query = `
            UPDATE SUBSCRIPTION 
            SET 
                status = ?,
                updated_at = NOW()
            WHERE reference = ?
        `;
        return await db.query(query, [status, reference]);
    }

    static async findById(id) {
        const query = 'SELECT * FROM SUBSCRIPTION WHERE id = ?';
        const result = await db.query(query, [id]);
        return result.data[0];
    }
}

module.exports = SubscriptionModel; 