const conexion = require('../helpers/conexion');    

class WebhookLogModel {
    // Crear un nuevo log de webhook
    static async create(eventType, environment, transactionId, reference, status, payload, checksum) {
        try {
            await conexion.query('START TRANSACTION');

            const query = `
                INSERT INTO WEBHOOK_LOG (
                    event_type,
                    environment,
                    transaction_id,
                    reference,
                    status,
                    payload,
                    checksum,
                    received_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            const params = [
                eventType,
                environment,
                transactionId,
                reference,
                status,
                JSON.stringify(payload), // Convertir el payload a JSON
                checksum
            ];

            const result = await conexion.query(query, params);
            await conexion.query('COMMIT');

            return {
                id: result.data.insertId,
                eventType,
                environment,
                transactionId,
                reference,
                status,
                payload,
                checksum
            };
        } catch (error) {
            await conexion.query('ROLLBACK');
            throw error;
        }
    }

    // Obtener log de webhook por transactionId y reference
    static async findWebhookLog(transactionId, reference) {
        try {
            const query = `
                SELECT * FROM WEBHOOK_LOG
                WHERE transaction_id = ? AND reference = ?
            `;
            const result = await conexion.query(query, [transactionId, reference]);
            return result.data[0] || null; // Devuelve el primer registro encontrado o null si no existe
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los logs de webhook
    static async findAll() {
        try {
            const query = `SELECT * FROM WEBHOOK_LOG`;
            const result = await conexion.query(query);
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar log de webhook
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

    // Eliminar log de webhook
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

module.exports = WebhookLogModel;
