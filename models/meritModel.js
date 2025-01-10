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
    updateCamperMerits: async ({ camperId, meritIds }) => {
        try {
            // First delete existing merit relations
            await db.query('DELETE FROM CAMPER_MERIT WHERE user_id = ?', [camperId]);
            
            // Continuar con la inserción...
            if (meritIds && meritIds.length > 0) {
                const values = meritIds.map(meritId => [camperId, meritId]);
                await db.query(
                    'INSERT INTO CAMPER_MERIT (user_id, merit_id) VALUES ?',
                    [values]
                );
            }
            
            return true;
        } catch (error) {
            throw new Error(`Error updating camper merits: ${error.message}`);
        }
    }
};

module.exports = MeritModel;