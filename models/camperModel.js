const db = require("../helpers/conexion");

const CamperModel = {
    // Obtener todos los campers
    getAllCampers: async () => {
        const query = `
            SELECT 
                c.id AS camper_id,
                c.title,
                c.history,
                c.about,
                c.image,
                c.main_video_url,
                c.full_name,
                c.profile_picture,
                c.status,
                u.birth_date,
                u.city_id
            FROM CAMPER c
            INNER JOIN USER u ON c.user_id = u.id
        `;
        return db.query(query);
    },
    
    getVideosByCamperId: async (camperId) => {
        const query = `
            SELECT tv.*
            FROM TRAINING_VIDEO tv
            WHERE tv.camper_id = ?;
        `;
        try {
            const result = await db.query(query, [camperId]);
    
            // Accede a la propiedad 'data' si el resultado tiene este formato
            const rows = result.data;
            if (!rows || !Array.isArray(rows)) {
                throw new Error("El resultado no es un array o es undefined.");
            }
    
            console.log("Filas obtenidas:", rows);
            return rows; // Retorna los videos encontrados
        } catch (error) {
            console.error("Error al obtener los videos por camper_id:", error);
            throw error; // Lanza el error para manejarlo en niveles superiores
        }
    },

    addTrainingVideo: async (camperId, { title, video_url, platform }) => {
        const query = `
            INSERT INTO TRAINING_VIDEO (camper_id, title, video_url, platform)
            VALUES (?, ?, ?, ?);
        `;
        try {
            const result = await db.query(query, [camperId, title, video_url, platform]);
            console.log("Video añadido exitosamente:", result);
            return result; // Retorna el resultado de la inserción
        } catch (error) {
            console.error("Error al añadir un video de formación:", error);
            throw error; // Lanza el error para manejarlo en niveles superiores
        }
    },

    deleteTrainingVideo: async (camperId, videoId) => {
        const query = `
            DELETE FROM TRAINING_VIDEO
            WHERE camper_id = ? AND id = ?;
        `;
        try {
            const result = await db.query(query, [camperId, videoId]);
            console.log("Video eliminado:", result);
            return result; // Retorna el resultado de la eliminación
        } catch (error) {
            console.error("Error al eliminar el video de formación:", error);
            throw error; // Lanza el error para manejarlo en niveles superiores
        }
    },
    
    
    // Obtener un camper por ID
    getCamperById: async (id) => {
        const query = "SELECT c.*, u.birth_date, ct.name FROM CAMPER c JOIN USER u ON c.user_id = u.id JOIN CITY ct ON u.city_id = ct.id WHERE c.id = ?;";
        return db.query(query, [id]);
    },

    // Crear un nuevo camper (solo el dueño del perfil o admin)
    createCamper: async ({
        user_id,
        title,
        description,
        about,
        image,
        main_video_url,
        document_number_id,
        full_name,
        age,
        city_id,
        profile_picture
    }, requestingUserId, userRole) => {
        // Verificar que solo el dueño del perfil o admin pueda crear
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para crear un perfil para otro usuario');
        }

        // Validación de datos
        if (!title || !description || !about || !full_name || !age || !city_id) {
            throw new Error("Todos los campos son obligatorios (title, description, about, full_name, age, city_id).");
        }

        const query = `
            INSERT INTO CAMPER (
                user_id,
                title,
                description,
                about,
                image,
                main_video_url,
                document_number_id,
                full_name,
                age,
                city_id,
                profile_picture
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            user_id,
            title,
            history,
            about,
            image,
            main_video_url,
            document_number_id,
            full_name,
            age,
            city_id,
            profile_picture
        ];

        return db.query(query, values);
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

    // Actualizar los datos del camper (y asociar el documento)
    updateCamperAndUser: async (user_id, camperData, userData, requestingUserId, userRole) => {
        // Verificar permisos
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para actualizar este perfil');
        }
        
        // Actualizar los datos del usuario
        const userQuery = "UPDATE USER SET ? WHERE id = ?";
        await db.query(userQuery, [userData, user_id]);

        // Actualizar los datos del camper
        const camperQuery = "UPDATE CAMPER SET ? WHERE user_id = ?";
        const result = await db.query(camperQuery, [camperData, user_id]);
    
        if (result.affectedRows === 0) {
            throw new Error('Camper no encontrado o no actualizado');
        }

        return result;
    },

    // Eliminar un camper
    deleteCamper: async (id, requestingUserId, userRole) => {
        const camper = await db.query("SELECT user_id FROM CAMPER WHERE id = ?", [id]);
        
        if (!camper.data.length) {
            throw new Error('Camper no encontrado');
        }

        if (userRole !== 'admin' && camper.data[0].user_id !== requestingUserId) {
            throw new Error('No tienes permiso para eliminar este perfil');
        }

        const query = "DELETE FROM CAMPER WHERE id = ?";
        return db.query(query, [id]);
    },

    //proyectos por camper etc
    getProjectsByCamperId: async (camperId) => {
        const query = `
            SELECT p.*
            FROM PROJECT p
            INNER JOIN CAMPER_PROJECT cp ON p.id = cp.project_id
            WHERE cp.camper_id = ?;
        `;
        try {
            const result = await db.query(query, [camperId]);

            console.log("Resultado de la consulta:", result); // Log para verificar la estructura

            // Si el resultado es un objeto, debemos extraer la propiedad que contiene los datos.
            const rows = Array.isArray(result) ? result : result.data || result[0];

            console.log("Filas obtenidas:", rows); // Log de los resultados

            return rows;
        } catch (error) {
            console.error("Error al obtener proyectos:", error);
            throw error;
        }
    },

    addProjectToCamper: async (camperId, { title, description, image }) => {
        const queryProject = `
            INSERT INTO PROJECT (title, description, image)
            VALUES (?, ?, ?);
        `;
        const queryCamperProject = `
            INSERT INTO CAMPER_PROJECT (camper_id, project_id)
            VALUES (?, ?);
        `;
        
        try {
            // Insertar el proyecto en la tabla PROJECT
            const projectResult = await db.query(queryProject, [title, description, image]);

            // Acceder correctamente al insertId
            const projectId = projectResult.data.insertId; // Aquí es donde obtenemos el insertId

            // Verificar que se haya insertado el proyecto correctamente
            if (!projectId) {
                throw new Error("Error al obtener el project_id.");
            }

            // Insertar la relación entre el Camper y el Proyecto
            await db.query(queryCamperProject, [camperId, projectId]);

            return projectId; // Retornar el ID del proyecto recién insertado
        } catch (error) {
            console.error("Error al añadir un proyecto:", error.message);
            throw error; // Lanza el error para manejarlo en niveles superiores
        }
    },

    deleteProjectFromCamper: async (camperId, projectId) => {
        const query = `
            DELETE FROM CAMPER_PROJECT
            WHERE camper_id = ? AND project_id = ?;
        `;
        try {
            const result = await db.query(query, [camperId, projectId]);
            return result.affectedRows;
        } catch (error) {
            console.error("Error al eliminar el proyecto:", error);
            throw error;
        }
    },

    //campers estados
    getGraduateCampers: async () => {
        const query = `
            SELECT 
                c.id AS camper_id,
                c.title,
                c.history,
                c.about,
                c.image,
                c.main_video_url,
                c.full_name,
                c.profile_picture,
                c.status,
                u.birth_date,
                u.city_id
            FROM CAMPER c
            INNER JOIN USER u ON c.user_id = u.id
            WHERE c.status = 'egresado'
        `;
        return db.query(query);
    },

    // Get all training campers
    getTrainingCampers: async () => {
        const query = `
            SELECT 
                c.id AS camper_id,
                c.title,
                c.history,
                c.about,
                c.image,
                c.main_video_url,
                c.full_name,
                c.profile_picture,
                c.status,
                u.birth_date,
                u.city_id
            FROM CAMPER c
            INNER JOIN USER u ON c.user_id = u.id
            WHERE c.status = 'formacion'
        `;
        return db.query(query);
    },

    // Update camper status
    updateCamperStatus: async (camperId, status, requestingUserId, userRole) => {
        // Verificar que el estado sea válido
        const validStatuses = ['egresado', 'formacion'];
        if (!validStatuses.includes(status)) {
            throw new Error('Estado inválido. Debe ser "egresado" o "formacion"');
        }

        // Verificar permisos (solo admin puede cambiar el estado)
        if (userRole !== 'admin') {
            throw new Error('Solo los administradores pueden cambiar el estado de un camper');
        }

        const query = `
            UPDATE CAMPER 
            SET status = ?
            WHERE id = ?
        `;
        
        const result = await db.query(query, [status, camperId]);
        
        if (result.affectedRows === 0) {
            throw new Error('Camper no encontrado');
        }

        return result;
    }
};

module.exports = CamperModel;
