const db = require("../helpers/conexion"); // Conexión a MySQL

const MeritModel = {
    // Obtener todos los méritos (tabla MERIT)
    getAllMerits: async () => {
        const query = "SELECT * FROM MERIT";
        return db.query(query);
    },

    // Obtener los méritos de un usuario específico
    getMeritsByUserId: async (userId) => {
        const query = `
            SELECT m.* 
            FROM CAMPER_MERIT cm
            JOIN MERIT m ON cm.merit_id = m.id
            WHERE cm.user_id = ?`;
        return db.query(query, [userId]);
    },

    // Asignar un mérito a un usuario
    assignMeritToUser: async ({ user_id, merit_id }, requestingUserId, userRole) => {
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para asignar méritos a otros usuarios.');
        }
        const query = "INSERT INTO CAMPER_MERIT (user_id, merit_id) VALUES (?, ?)";
        return db.query(query, [user_id, merit_id]);
    },

    // Actualizar un mérito asignado
    updateMeritAssignment: async ({ user_id, merit_id }, requestingUserId, userRole) => {
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para actualizar méritos de otros usuarios.');
        }
        const query = `
            UPDATE CAMPER_MERIT
            SET merit_id = ?
            WHERE user_id = ?`;
        return db.query(query, [merit_id, user_id]);
    }
};

module.exports = MeritModel;
