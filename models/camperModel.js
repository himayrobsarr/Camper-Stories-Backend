const db = require("../helpers/conexion");
const { uploadToS3 } = require("../models/uploadModel");
const { deleteFromS3 } = require('../helpers/aws'); // Importar la función para eliminar en S3

const CamperModel = {
    // Obtener todos los campers
    getAllCampersByCampus: async (campusId) => {
        const query = `
            SELECT 
                c.id AS camper_id,
                c.title,
                c.history,
                c.about,
                c.main_video_url,
                c.full_name,
                c.profile_picture,
                c.status,
                u.birth_date,
                u.city_id,
                c.campus_id
            FROM CAMPER c
            INNER JOIN USER u ON c.user_id = u.id
            WHERE c.campus_id = ?
        `;
        return db.query(query, [campusId]);
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

            // console.log("Filas obtenidas:", rows);
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
            // console.log("Video añadido exitosamente:", result);
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
            // console.log("Video eliminado:", result);
            return result; // Retorna el resultado de la eliminación
        } catch (error) {
            console.error("Error al eliminar el video de formación:", error);
            throw error; // Lanza el error para manejarlo en niveles superiores
        }
    },


    // Obtener un camper por ID
    getCamperById: async (id) => {
        const query = `
            SELECT 
                c.*, 
                u.birth_date, 
                CONCAT(ct.name, ', ', d.name) AS city 
            FROM CAMPER c
            JOIN USER u 
                ON c.user_id = u.id
            JOIN CITY ct 
                ON u.city_id = ct.id
            JOIN DEPARTAMENT d 
                ON d.id = ct.departament_id
            WHERE c.id = ?;
        `;
        return db.query(query, [id]);
    },

    // Crear un nuevo camper (solo el dueño del perfil o admin)
    createCamper: async ({
        user_id,
        title,
        history,
        about,
        
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


    updateCamper: async (camper_id, camperData, requestingUserId, userRole) => {
        let imageUrl = null;
        // Si hay una nueva imagen, elimina la anterior
        if (camperData.profile_picture) {
            // Obtener la imagen actual del camper
            const queryGetOldPicture = `SELECT profile_picture FROM CAMPER WHERE id = ?`;
            const oldPictureResult = await db.query(queryGetOldPicture, [camper_id]);

            if (oldPictureResult.data.length > 0) {
                const oldPictureUrl = oldPictureResult.data[0].profile_picture;

                if (oldPictureUrl) {
                    try {
                        await deleteFromS3(oldPictureUrl); // Eliminar la imagen anterior
                        console.log("Imagen anterior eliminada correctamente.");
                    } catch (error) {
                        console.error("Error al eliminar la imagen anterior:", error);
                    }
                }
            }

            // Subir la nueva imagen a S3
            imageUrl = await uploadToS3(camperData.profile_picture, "camper", camper_id);
        }

        //validar si hay nueva ciudad
        if (camperData.city_id !== undefined) {
            const newcity_id = camperData.city_id;
            // Consulta para obtener el user_id asociado al camper_id
            const userIdQuery = `SELECT u.id FROM USER u JOIN CAMPER c ON u.id = c.user_id WHERE c.id = ?`;
            const userRows = await db.query(userIdQuery, [camper_id]);
            const user_id = userRows.data[0].id; // Extraer el id del usuario\
             // console.log("user_id", user_id)
            // Consulta para actualizar el city_id del usuario
            const updateCityQuery = `UPDATE USER SET city_id = ? WHERE id = ?`;
            const updatecityResult = await db.query(updateCityQuery, [newcity_id, user_id]);
        }
        
        const updates = {};
        if (camperData.full_name !== undefined) updates.full_name = camperData.full_name;
        if (camperData.about !== undefined) updates.about = camperData.about;
        if (camperData.main_video_url !== undefined) updates.main_video_url = camperData.main_video_url;
        if (imageUrl) updates.profile_picture = imageUrl;

        // Actualizar datos del camper
        const query = "UPDATE CAMPER SET ? WHERE id = ?";
        const result = await db.query(query, [updates, camper_id]);

        if (result.affectedRows === 0) {
            throw new Error('Camper no encontrado o no actualizado');
        }

        // Recuperar datos actualizados
        const getUpdateCamper = `
            SELECT c.full_name, c.about, c.main_video_url, c.profile_picture, u.city_id 
            FROM CAMPER c 
            JOIN USER u ON u.id = c.user_id 
            WHERE c.id = ?
        `;
        const camperResult = await db.query(getUpdateCamper, [camper_id]);
        const updatedCamper = camperResult.data[0];

        return {
            updatedCamper,
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

            // console.log("Resultado de la consulta:", result); // Log para verificar la estructura

            // Si el resultado es un objeto, debemos extraer la propiedad que contiene los datos.
            const rows = Array.isArray(result) ? result : result.data || result[0];

            // console.log("Filas obtenidas:", rows); // Log de los resultados

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
    getGraduateCampersByCampus: async (campusId) => {
        const query = `
            SELECT 
                id AS camper_id,
                title,
                history,
                about,
                main_video_url,
                full_name,
                profile_picture,
                status,
                campus_id
            FROM CAMPER
            WHERE status = 'egresado' 
            AND campus_id = ?
        `;
        return db.query(query, [campusId]);
    },    

    // Get all training campers
    getTrainingCampers: async (campusId) => {
        const query = `
            SELECT 
                id AS camper_id,
                title,
                history,
                about,
                main_video_url,
                full_name,
                profile_picture,
                status,
                campus_id
            FROM CAMPER
            WHERE status = 'formacion'
            AND campus_id = ?
        `;
        return db.query(query, [campusId]);
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
    },

    getCamperDetails: async (camperId) => {
        try {
            // Ejecutar las consultas en paralelo para optimizar rendimiento
            const [camperData, dreams, projects, videos] = await Promise.all([
                db.query(`
                    SELECT 
                        c.id AS camper_id,
                        c.title,
                        c.history,
                        c.about,
                        c.main_video_url,
                        c.full_name,
                        c.profile_picture,
                        c.status,
                        u.birth_date,
                        u.city_id 
                    FROM CAMPER c
                    INNER JOIN USER u ON c.user_id = u.id
                    WHERE c.id = ?
                `, [camperId]),
    
                db.query("SELECT * FROM DREAMS WHERE camper_id = ?", [camperId]),
                db.query(`
                    SELECT p.* 
                    FROM PROJECT p 
                    INNER JOIN CAMPER_PROJECT cp ON p.id = cp.project_id 
                    WHERE cp.camper_id = ?;
                `, [camperId]),
                db.query("SELECT * FROM TRAINING_VIDEO WHERE camper_id = ?", [camperId])
            ]);
    
            if (!camperData.data.length) {
                throw new Error("Camper no encontrado");
            }
    
            return {
                camper: camperData.data[0],
                dreams: dreams.data || [],
                projects: projects.data || [],
                videos: videos.data || []
            };
    
        } catch (error) {
            console.error("Error obteniendo detalles del camper:", error);
            throw error;
        }
    },

        getCamperDetails: async (camperId) => {
        try {
            // Ejecutar las consultas en paralelo para optimizar rendimiento
            const [camperData, dreams, projects, videos] = await Promise.all([
                db.query(`
                    SELECT 
                        c.id AS camper_id,
                        c.title,
                        c.history,
                        c.about,
                        c.main_video_url,
                        c.full_name,
                        c.profile_picture,
                        c.status,
                        u.birth_date,
                        u.city_id 
                    FROM CAMPER c
                    INNER JOIN USER u ON c.user_id = u.id
                    WHERE c.id = ?
                `, [camperId]),
    
                db.query("SELECT * FROM DREAMS WHERE camper_id = ?", [camperId]),
                db.query(`
                    SELECT p.* 
                    FROM PROJECT p 
                    INNER JOIN CAMPER_PROJECT cp ON p.id = cp.project_id 
                    WHERE cp.camper_id = ?;
                `, [camperId]),
                db.query("SELECT * FROM TRAINING_VIDEO WHERE camper_id = ?", [camperId])
            ]);
    
            if (!camperData.data.length) {
                throw new Error("Camper no encontrado");
            }
    
            return {
                camper: camperData.data[0],
                dreams: dreams.data || [],
                projects: projects.data || [],
                videos: videos.data || []
            };
    
        } catch (error) {
            console.error("Error obteniendo detalles del camper:", error);
            throw error;
        }
    },


    

};

module.exports = CamperModel;
