const db = require("../helpers/conexion");

const landingAIModel = {
    saveRegisteredInfo: async ({ name, lastname, email, phone, document, payment_reference, payment_date, selected_course }) => {
        try {

            const formattedDate = new Date(payment_date).toISOString().slice(0, 19).replace('T', ' ');

            const query = `
          INSERT INTO INSCRIPCIONES_IA (name, lastname, email, phone, document, payment_reference, payment_date, selected_course)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
            const values = [name, lastname, email, phone, document, payment_reference, formattedDate, selected_course];

            const { status, data } = await db.query(query, values);
            if (status === 200) {
                return data;
            } else {
                throw new Error("Error al guardar la información en la base de datos");
            }
        } catch (error) {
            console.error("Error al insertar en la base de datos:", error.message);
            throw error;
        }
    },

    getAllRegistered: async () => {
        try {
            const query = `
                SELECT 
                    id,
                    name,
                    lastname,
                    email,
                    phone,
                    document,
                    payment_reference,
                    payment_date,
                    selected_course,
                    created_at
                FROM INSCRIPCIONES_IA
                ORDER BY created_at DESC
            `;

            const { status, data } = await db.query(query);

            if (status === 200) {
                return data;
            } else {
                throw new Error("Error al obtener los registros de la base de datos");
            }
        } catch (error) {
            console.error("Error al consultar la base de datos:", error.message);
            throw error;
        }
    },

    getRegisteredById: async (id) => {
        try {
            const query = `
                SELECT 
                    id,
                    name,
                    lastname,
                    email,
                    phone,
                    document,
                    payment_reference,
                    payment_date,
                    selected_course,
                    created_at
                FROM INSCRIPCIONES_IA
                WHERE id = ?
            `;

            const { status, data } = await db.query(query, [id]);

            if (status === 200) {
                return data[0] || null;
            } else {
                throw new Error("Error al obtener el registro de la base de datos");
            }
        } catch (error) {
            console.error("Error al consultar la base de datos:", error.message);
            throw error;
        }
    },

    updateInscriptionStatus: async (payment_reference, payment_date) => {
        try {
          const formattedDate = new Date(payment_date)
            .toISOString()          
            .slice(0, 19)
            .replace('T', ' ');
      
          const query = `
            UPDATE INSCRIPCIONES_IA
            SET status = 'EXITOSO', payment_date = ?
            WHERE payment_reference = ?
          `;
          const { status, data } = await db.query(query, [formattedDate, payment_reference]);
      
          if (status === 200) {
            return data;
          } else {
            throw new Error("Error al actualizar el estado de la inscripción");
          }
        } catch (error) {
          console.error("Error al actualizar la inscripción:", error.message);
          throw error;
        }
    }
};

module.exports = landingAIModel;
