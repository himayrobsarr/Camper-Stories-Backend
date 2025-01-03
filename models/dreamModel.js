const db = require("../helpers/conexion"); // Importa la conexión a MySQL

const DreamModel = {
    // Obtener todos los sueños (público)
    getAllDreams: async () => {
        const query = "SELECT * FROM DREAMS";
        return db.query(query);
    },

    // Obtener un sueño por ID (público)
    getDreamById: async (id) => {
        const query = "SELECT * FROM DREAMS WHERE id = ?";
        return db.query(query, [id]);
    },

    createDream: async ({ title, description, image_url, user_id }, requestingUserId, userRole) => {
        // Si el rol es 'admin', puede crear un sueño para cualquier usuario
        // Si el rol es 'camper', solo puede crear un sueño para su propio perfil
        if (userRole !== 'admin' && requestingUserId !== user_id) {
            throw new Error('No tienes permiso para crear un sueño para otro usuario');
        }
    
        const query = "INSERT INTO DREAMS (title, description, image_url, user_id) VALUES (?, ?, ?, ?)";
        return db.query(query, [title, description, image_url, user_id]);
    },    

// Actualizar un sueño existente (solo el dueño del perfil o admin)
updateDream: async (id, dreamData, requestingUserId, userRole) => {
    // Obtener el user_id del sueño a actualizar
    const dream = await db.query("SELECT user_id FROM DREAMS WHERE id = ?", [id]);
    
    if (!dream.data.length) {
        throw new Error('Sueño no encontrado');
    }

    const dreamUserId = dream.data[0].user_id;

    // Verificar permisos
    if (userRole !== 'admin' && requestingUserId !== dreamUserId) {
        throw new Error('No tienes permiso para actualizar este sueño');
    }

    const query = "UPDATE DREAMS SET ? WHERE id = ?";
    const result = await db.query(query, [dreamData, id]);

    if (result.affectedRows === 0) {
        throw new Error('Sueño no encontrado o no actualizado');
    }

    return result;
},


    // Eliminar un sueño (solo admin o dueño del perfil)
    deleteDream: async (id, requestingUserId, userRole) => {
        // Obtener el user_id del sueño
        const dream = await db.query("SELECT user_id FROM DREAMS WHERE id = ?", [id]);
        
        if (!dream.data.length) {
            throw new Error('Sueño no encontrado');
        }
    
        // Verificar permisos
        if (userRole !== 'admin' && dream.data[0].user_id !== requestingUserId) {
            throw new Error('No tienes permiso para eliminar este sueño');
        }
    
        const query = "DELETE FROM DREAMS WHERE id = ?";
        return db.query(query, [id]);
    },    
};

module.exports = DreamModel;
