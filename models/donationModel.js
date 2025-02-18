const conexion = require('../helpers/conexion');

class DonationModel {
    //Crear una nueva donación
    static async create(donationData) {
        try {
            await conexion.query('START TRANSACTION');

            const query = `
                INSERT INTO DONATION (
                    payment_id,
                    message,
                    amount,
                    camper_id,
                    user_id,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())
            `;

            const params = [
                donationData.payment_id,
                donationData.message,
                donationData.amount,
                donationData.camper_id,
                donationData.user_id,
                donationData.created_at
            ];

            const result = await conexion.query(query, params);
            await conexion.query('COMMIT');

            return {
                id: result.data.insertId,
                ...donationData
            };
        } catch (error) {
            await conexion.query('ROLLBACK');
            throw error;
        }
    }

    //Obtener donación por ID
    static async findById(id) {
        try {
            const query = `SELECT * FROM DONATION WHERE id = ?`;
            const result = await conexion.query(query, [id]);
            return result.data[0] || null;
        } catch (error) {
            throw error;
        }
    }

    //Obtener donaciones por usuario
    static async findByUserId(userId) {
        try {
            const query = `SELECT * FROM DONATION WHERE user_id = ?`;
            const result = await conexion.query(query, [userId]);
            return result.data || null;
        } catch (error) {
            throw error;
        }
    }

    //Obtener donaciones por camper
    static async findByCamperId(camperId) {
        try {
            const query = `SELECT * FROM DONATION WHERE camper_id = ?`;
            const result = await conexion.query(query, [camperId]);
            return result.data || null;
        } catch (error) {
            throw error;
        }
    }

    //Obtener donaciones por pago
    static async findByPaymentId(paymentId) {
        try {
            const query = `SELECT * FROM DONATION WHERE payment_id = ?`;
            const result = await conexion.query(query, [paymentId]);
            return result.data || null;
        } catch (error) {
            throw error;
        }
    }

    //Obtener todas las donaciones
    static async findAll() {
        try {
            const query = `SELECT * FROM DONATION`;
            const result = await conexion.query(query);
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    //Actualizar Donacion
    static async update(id, donationData) {
        try {
            await conexion.query('START TRANSACTION');

            const updateFields = Object.keys(donationData)
                .filter(key => donationData[key] !== undefined)
                .map(key => `${key} = ?`);

            if (updateFields.length === 0) throw new Error("No hay campos para actualizar");

            const query = `UPDATE DONATION SET ${updateFields.join(', ')} WHERE id = ?`;
            const values = [...Object.values(donationData).filter(value => value !== undefined), id];

            await conexion.query(query, values);
            await conexion.query('COMMIT');

            return await this.findById(id);
        } catch (error) {
            await conexion.query('ROLLBACK');
            throw error;
        }
    }

    //Eliminar donacion por ID
    static async delete(id) {
        try {
            await conexion.query('START TRANSACTION');
            await conexion.query('DELETE FROM DONATION WHERE id = ?', [id]);
            await conexion.query('COMMIT');
            return true;
        } catch (error) {
            await conexion.query('ROLLBACK');
            throw error;
        }
    }

    // Obtener las donaciones de un sponsor, con nombre de camper (si existe)
    static async findDonationsBySponsorId(sponsorId) {
        console.log('sponsorId:', sponsorId);
        try {
            const query = `
        SELECT 
          d.id,
          d.amount AS monto,
          DATE_FORMAT(d.created_at, '%Y-%m-%d') AS fecha,
          u.first_name AS camper
        FROM DONATION d
        LEFT JOIN CAMPER c ON d.camper_id = c.id
        LEFT JOIN USER u ON c.user_id = u.id
        WHERE d.user_id = ?
      `;
            const result = await conexion.query(query, [sponsorId]);
            return result.data; // arreglo de donaciones
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DonationModel;