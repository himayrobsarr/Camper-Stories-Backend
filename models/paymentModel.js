const conexion = require('../helpers/conexion');
class PaymentModel {
  // Crear un nuevo pago
  static async create(paymentData) {
    try {
      await conexion.query('START TRANSACTION');

      const query = `
                INSERT INTO PAYMENT (
                    id,
                    sponsor_id, 
                    user_id, 
                    amount, 
                    currency,
                    transaction_id, 
                    payment_status, 
                    payment_method,
                    payment_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

      const params = [
        paymentData.reference,
        paymentData.sponsor_id || null,
        paymentData.user_id || null,
        paymentData.amount,
        paymentData.currency || 'COP',
        paymentData.transaction_id,
        paymentData.payment_status || 'pending',
        paymentData.payment_method || 'card',
      ];

      conexion.query(query, params);
      await conexion.query('COMMIT');
      return {
        id: paymentData.reference,
        ...paymentData,
      };


    } catch (error) {
      await conexion.query('ROLLBACK');
      throw error;
    }
  }

  // Obtener pago por ID
  static async findById(id) {
    try {
      const query = `SELECT * FROM PAYMENT WHERE id = ?`;
      const result = await conexion.query(query, [id]);
      return result.data[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener pagos por usuario
  static async findByUserId(userId) {
    try {
      const query = `SELECT * FROM PAYMENT WHERE user_id = ?`;
      const result = await conexion.query(query, [userId]);
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los pagos
  static async findAll() {
    try {
      const query = `SELECT * FROM PAYMENT`;
      const result = await conexion.query(query);
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un pago por ID
  static async update(id, paymentData) {
    try {
      await conexion.query('START TRANSACTION');

      const updateFields = Object.keys(paymentData)
        .filter(key => paymentData[key] !== undefined)
        .map(key => `${key} = ?`);

      if (updateFields.length === 0) throw new Error("No hay campos para actualizar");

      const query = `UPDATE PAYMENT SET ${updateFields.join(', ')} WHERE id = ?`;
      const values = [...Object.values(paymentData).filter(value => value !== undefined), id];

      await conexion.query(query, values);
      await conexion.query('COMMIT');

      return await this.findById(id);
    } catch (error) {
      await conexion.query('ROLLBACK');
      throw error;
    }
  }

  // Eliminar un pago por ID
  static async delete(id) {
    try {
      await conexion.query('START TRANSACTION');
      await conexion.query('DELETE FROM PAYMENT WHERE id = ?', [id]);
      await conexion.query('COMMIT');
      return true;
    } catch (error) {
      await conexion.query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = PaymentModel;
