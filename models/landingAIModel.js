const db = require("../helpers/conexion");

const landingAIModel = {
    saveRegisteredInfo: async ({ name, lastname, email, phone, document, payment_reference, payment_date, selected_course }) => {
      try {

        const formattedDate = new Date(payment_date).toISOString().slice(0, 19).replace('T', ' ');
  
        const query = `
          INSERT INTO INSCRIPCIONES_IA (name, lastname, email, phone, document, payment_reference, payment_date, selected_course)
          VALUES (?, ?, ?, ?, ?, ?, ?)
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
    }
  };
  

module.exports = landingAIModel;
