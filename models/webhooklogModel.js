const conexion = require('../helpers/conexion');    

class WebhookLogModel {
    // Crear un nuevo log de webhook
    static async create(webhookData) {
        try {
            await conexion.query('START TRANSACTION');

            const query = `
                INSERT INTO WEBHOOK_LOG (
                    payment_id,
                    event_type,
                    payload,
                    received_at,
                    transaction_id,
                    status
                ) VALUES (?, ?, ?, NOW(), ?, ?)
            `;

            const params = [
                webhookData.payment_id,
                webhookData.event_type,
                webhookData.payload,
                webhookData.transaction_id,
                webhookData.status
            ];

            const result = await conexion.query(query, params);
            await conexion.query('COMMIT');

            return {
                id: result.data.insertId,
                ...webhookData
            };
        } catch (error) {
            await conexion.query('ROLLBACK');
            throw error;
        }
    }

    //Obtener log de webhook por ID
    static async findById(id) {
        try {
            const query = `SELECT * FROM WEBHOOK_LOG WHERE id = ?`;
            const result = await conexion.query(query, [id]);
            return result.data[0] || null;
        } catch (error) {
            throw error;
        }
    }

    //Obtener logs de webhook por ID de transacción
    static async findByTransactionId(transactionId) {
        try {
            const query = `SELECT * FROM WEBHOOK_LOG WHERE transaction_id = ?`;
            const result = await conexion.query(query, [transactionId]);
            return result.data || null;
        } catch (error) {
            throw error;
        }
    }

    //Obtener logs de webhook por ID de pago
    static async findByPaymentId(paymentId) {
        try {
            const query = `SELECT * FROM WEBHOOK_LOG WHERE payment_id = ?`;
            const result = await conexion.query(query, [paymentId]);
            return result.data || null;
        } catch (error) {
            throw error;
        }
    }

    //Obtener todos los logs de webhook
    static async findAll() {
        try {
            const query = `SELECT * FROM WEBHOOK_LOG`;
            const result = await conexion.query(query);
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    //Actualizar log de webhook
    static async update(id, webhookData) {
        try {
            await conexion.query('START TRANSACTION');

            const updateFields = Object.keys(webhookData).map(field => `${field} = ?`).join(', ');
            const query = `UPDATE WEBHOOK_LOG SET ${updateFields} WHERE id = ?`;
            const values = [...Object.values(webhookData).filter(value => value !== undefined), id];

            await conexion.query(query, values);
            await conexion.query('COMMIT');

            return await this.findById(id);
        } catch (error) {
            await conexion.query('ROLLBACK');
            throw error;
        }
    }

    //Eliminar log de webhook
    static async delete(id) {
        try {
            await conexion.query('START TRANSACTION');

            const query = `DELETE FROM WEBHOOK_LOG WHERE id = ?`;
            await conexion.query(query, [id]);

            await conexion.query('COMMIT');
            return true;
        } catch (error) {
            await conexion.query('ROLLBACK');
            throw error;
        }
    }
}
