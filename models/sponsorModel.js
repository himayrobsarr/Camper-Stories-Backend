const db = require("../helpers/conexion");

const SponsorModel = {
    // Obtener todos los sponsors
    getAllSponsors: async () => {
        const query = "SELECT * FROM SPONSOR";
        return db.query(query);
    },

    // Obtener un sponsor por ID
    getSponsorById: async (id) => {
        const query = "SELECT * FROM SPONSOR WHERE id = ?";
        return db.query(query, [id]);
    },

    // Crear un nuevo sponsor
    createSponsor: async ({ contribution, first_name, last_name, email, phone, message }) => {
        if (!contribution || !first_name || !last_name || !email) {
            throw new Error("Datos del formulario incompletos");
        }
        const query = `
            INSERT INTO SPONSOR (contribution, first_name, last_name, email, phone, message)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return db.query(query, [
            contribution,
            first_name,
            last_name,
            email.toLowerCase(),
            phone || null,
            message || null
        ]);
    },


    // Actualizar un sponsor existente
    updateSponsor: async (id, { first_name, last_name, email, phone, message }) => {
        if (!id) throw new Error("ID es requerido");
        if (!first_name && !last_name && !email && !phone && !message) {
            throw new Error("Datos de actualización inválidos");
        }

        const query = `
            UPDATE SPONSOR SET
            first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            message = COALESCE(?, message)
            WHERE id = ?
        `;
        return db.query(query, [first_name, last_name, email, phone, message, id]);
    },

    // Eliminar un sponsor
    deleteSponsor: async (id) => {
        if (!id) throw new Error("ID es requerido");

        const query = "DELETE FROM SPONSOR WHERE id = ?";
        return db.query(query, [id]);
    },
};

module.exports = SponsorModel;
