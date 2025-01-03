const db = require("../helpers/conexion"); // Importa la conexión a MySQL

const CamperModel = {
    // Obtener todos los campers (público)
    getAllCampers: async () => {
        const query = "SELECT * FROM CAMPER";
        return db.query(query);
    },

    // Obtener un camper por ID (público)
    getCamperById: async (id) => {
        const query = "SELECT * FROM CAMPER WHERE id = ?";
        return db.query(query, [id]);
    },

    // Crear un nuevo camper (solo el dueño del perfil o admin)
    createCamper: async ({ user_id, title, description, about, image, main_video_url }, requestingUserId, userRole) => {
        // Verificar que solo el dueño del perfil o admin pueda crear
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para crear un perfil para otro usuario');
        }

        const query = "INSERT INTO CAMPER (user_id, title, description, about, image, main_video_url) VALUES (?, ?, ?, ?, ?, ?)";
        return db.query(query, [user_id, title, description, about, image, main_video_url]);
    },

    // Actualizar un camper existente (solo el dueño del perfil o admin)
    updateCamper: async (user_id, camperData, requestingUserId, userRole) => {
        // Verificar permisos
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para actualizar este perfil');
        }
    
        const query = "UPDATE CAMPER SET ? WHERE user_id = ?";
        const result = await db.query(query, [camperData, user_id]);
    
        if (result.affectedRows === 0) {
            throw new Error('Camper no encontrado o no actualizado');
        }
    
        return result;
    },   
    
    updateCamperByUserId: async (userId, data) => {
        const { document_number } = data;
    
        const query = `
            UPDATE CAMPER
            SET document_number = ?
            WHERE user_id = ?
        `;
        const values = [document_number, userId];
    
        const result = await db.query(query, values);
    
        if (result.affectedRows === 0) {
            throw new Error('No se encontró un CAMPER para el usuario especificado');
        }
    
        return result;
    },
    

    // Eliminar un camper (solo admin o dueño del perfil)
    deleteCamper: async (id, requestingUserId, userRole) => {
        // Primero verificar si el camper existe y obtener su user_id
        const camper = await db.query("SELECT user_id FROM CAMPER WHERE id = ?", [id]);
        
        if (!camper.data.length) {
            throw new Error('Camper no encontrado');
        }

        // Verificar permisos
        if (userRole !== 'admin' && camper.data[0].user_id !== requestingUserId) {
            throw new Error('No tienes permiso para eliminar este perfil');
        }

        const query = "DELETE FROM CAMPER WHERE id = ?";
        return db.query(query, [id]);
    },
};

module.exports = CamperModel