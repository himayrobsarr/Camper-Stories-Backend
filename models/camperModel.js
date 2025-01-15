const db = require("../helpers/conexion");
const { uploadToS3 } = require("../models/uploadModel");




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
        history,
        about,
        image = null,
        main_video_url = null,
        full_name,
        profile_picture,
        status = "formacion"
    }, requestingUserId, userRole) => {
        // Verificar permisos
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para crear un perfil para otro usuario');
        }

        // Validación de datos
        if (!title || !history || !about || !full_name) {
            throw new Error("Los campos title, history, about y full_name son obligatorios.");
        }

        // Subir imagen y obtener URL si existe
        let imageUrl = null;
        if (image) {
            imageUrl = await uploadToS3(image, 'camper_images', user_id);
        }

        // Crear el nuevo Camper
        const query = `
        INSERT INTO CAMPER (
            user_id,
            title,
            history,
            about,
            image,
            main_video_url,
            full_name,
            profile_picture,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const values = [
            user_id,
            title,
            history,
            about,
            imageUrl,
            main_video_url,
            full_name,
            profile_picture,
            status
        ];

        return db.query(query, values);
    },



    // Actualizar un camper existente (solo el dueño del perfil o admin)
    updateCamper: async (camper_id, camperData, requestingUserId, userRole) => {
        // Verificar permisos
        //    if (userRole !== 'admin' && user_id !== requestingUserId) {
        //       throw new Error('No tienes permiso para actualizar este perfil');
        //    }
        let imageUrl = null;
        if (camperData.profile_picture) {
            imageUrl = await uploadToS3(camperData.profile_picture, "camper", camper_id);
        }
        console.log("holi soy camper data", camperData)
        console.log("s3", imageUrl)

        const updates = {};
        if (camperData.full_name !== undefined) updates.full_name = camperData.full_name;
        if (camperData.about !== undefined) updates.about = camperData.about;
        if (camperData.main_video_url !== undefined) updates.main_video_url = camperData.main_video_url;
        updates.profile_picture = imageUrl;


        //validar si hay nueva ciudad
        let newcity_id;
        if (camperData.city_id !== undefined) {
            newcity_id = camperData.city_id;

            const userIdQuery = ` SELECT u.id FROM USER u JOIN CAMPER c ON u.id=c.user_id WHERE c.id = ?`
            const user_id = await db.query(userIdQuery, [camper_id]);
    
            const updateCityQuery = `
                                UPDATE USER
                                SET city_id = ?
                                 WHERE id = ?
                             `;
            const updatedCity = await db.query(updateCityQuery, [newcity_id, user_id])

        }

            console.log("hola soy updates model :V", updates)
        if (Object.keys(updates).length > 0) {
            const updateQuery = `
                          UPDATE CAMPER
                          SET ?
                          WHERE id = ?
                      `;
            const updateResult = await db.query(updateQuery, [updates, camper_id]);

            if (updateResult.affectedRows === 0) {
                throw new Error("El camper no se pudo actualizar");
            }
        }

        const query = "UPDATE CAMPER SET ? WHERE id = ?";
        const result = await db.query(query, [updates, camper_id]);

        if (result.affectedRows === 0) {
            throw new Error('Camper no encontrado o no actualizado');
        }

        const getUpdateCamper = `
            SELECT c.full_name, c.about, c.main_video_url, c.profile_picture, u.city_id FROM CAMPER c JOIN USER u ON u.id = c.user_id WHERE c.id = ?
        `;
        const camperResult = await db.query(getUpdateCamper, [camper_id]);
        const updatedCamper = camperResult.data[0];

        return {
            updatedCamper
        };

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
                id AS camper_id,
                title,
                history,
                about,
                image,
                main_video_url,
                full_name,
                profile_picture,
                status
            FROM CAMPER
            WHERE status = 'egresado'
        `;
        return db.query(query);
    },

    // Get all training campers
    getTrainingCampers: async () => {
        const query = `
            SELECT 
                id AS camper_id,
                title,
                history,
                about,
                image,
                main_video_url,
                full_name,
                profile_picture,
                status
            FROM CAMPER
            WHERE status = 'formacion'
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
    },

    //obtener suenos por id del camper
    getDreamsByCamperId: async (camperId) => {
        const query = `
              SELECT d.*
              FROM DREAMS d
            WHERE d.camper_id = ?;

            `;

        try {
            const result = await db.query(query, [camperId]);

            if (!result.data || !Array.isArray(result.data)) {
                throw new Error("El resultado no es un array o es undefined");
            }

            return result.data;
        } catch (error) {
            console.error("Error al obtener los sueños del camper:", error);
            throw error;
        }
    },

    addDreamToCamper: async (camperId, dreamData, requestingUserId, userRole) => {
        // Primero verificar si el camper existe
        const camperQuery = "SELECT user_id FROM CAMPER WHERE id = ?";
        const camperResult = await db.query(camperQuery, [camperId]);

        if (!camperResult.data || camperResult.data.length === 0) {
            throw new Error('Camper no encontrado');
        }

        // Verificar permisos - solo el dueño del perfil o admin puede agregar sueños
        const camperUserId = camperResult.data[0].user_id;
        if (userRole !== 'admin' && requestingUserId !== camperUserId) {
            throw new Error('No tienes permiso para agregar sueños a este perfil');
        }

        // Validar datos requeridos
        if (!dreamData.title || !dreamData.description) {
            throw new Error('El título y la descripción son requeridos');
        }

        const query = `
                INSERT INTO DREAMS (
                    title,
                    description,
                    image_url,
                    camper_id
                ) VALUES (?, ?, ?, ?);
            `;

        try {
            const result = await db.query(query, [
                dreamData.title,
                dreamData.description,
                dreamData.image_url || null,
                camperId
            ]);

            return result;
        } catch (error) {
            console.error("Error al agregar el sueño:", error);
            throw error;
        }
    },

    deleteDreamFromCamper: async (camperId, dreamId, requestingUserId, userRole) => {
        try {
            // 1. Verificar si el camper existe
            const camperQuery = "SELECT user_id FROM CAMPER WHERE id = ?";
            const camperResult = await db.query(camperQuery, [camperId]);

            if (!camperResult.data || camperResult.data.length === 0) {
                throw new Error('Camper no encontrado');
            }

            // 2. Verificar si el sueño existe y pertenece al camper
            const dreamQuery = "SELECT * FROM DREAMS WHERE id = ? AND camper_id = ?";
            const dreamResult = await db.query(dreamQuery, [dreamId, camperId]);

            if (!dreamResult.data || dreamResult.data.length === 0) {
                throw new Error('Sueño no encontrado o no pertenece a este camper');
            }

            // 3. Verificar permisos
            const camperUserId = camperResult.data[0].user_id;
            if (userRole !== 'admin' && requestingUserId !== camperUserId) {
                throw new Error('No tienes permiso para eliminar este sueño');
            }

            // 4. Eliminar el sueño
            const deleteQuery = `
                    DELETE FROM DREAMS 
                    WHERE id = ? AND camper_id = ?
                `;

            const result = await db.query(deleteQuery, [dreamId, camperId]);

            if (result.affectedRows === 0) {
                throw new Error('No se pudo eliminar el sueño');
            }

            return result;
        } catch (error) {
            console.error("Error al eliminar el sueño:", error);
            throw error;
        }
    }

};

module.exports = CamperModel;
