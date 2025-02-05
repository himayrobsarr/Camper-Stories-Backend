const CamperModel = require("../models/camperModel")

const CamperController = {
    // Obtener todos los campers
    getAll: async (req, res) => {
        try {
            const result = await CamperModel.getAllCampers();
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los campers", error: error.message });
        }
    },

    getVideosByCamperId: async (req, res) => {
        const camperId = parseInt(req.params.camperId, 10); // Asegurar que sea un número
         // console.log("CamperId recibido:", camperId); // Log para depuración

        try {
            const videos = await CamperModel.getVideosByCamperId(camperId);

            if (!videos || videos.length === 0) {
                 // console.log("No se encontraron videos para camperId:", camperId);
                return res.status(404).json({ message: "No se encontraron videos para este camper." });
            }

             // console.log("Videos encontrados:", videos);
            return res.status(200).json(videos); // Retornar los videos en JSON
        } catch (error) {
            console.error("Error al obtener videos:", error.message);
            return res.status(500).json({ message: "Error al obtener los videos. Inténtalo más tarde.", error: error.message });
        }
    },

    addTrainingVideo: async (req, res) => {
        const { id: camperId } = req.params; // Obtener el ID del camper desde la URL
        const { title, video_url, platform } = req.body; // Datos del cuerpo de la solicitud

        try {
            // Validar que todos los campos necesarios estén presentes
            if (!title || !video_url) {
                return res.status(400).json({ message: "El título y la URL del video son obligatorios." });
            }

            // Llamar al modelo para insertar el video
            const result = await CamperModel.addTrainingVideo(camperId, { title, video_url, platform });

            return res.status(201).json({
                message: "Video añadido exitosamente.",
                videoId: result.insertId // Retorna el ID del nuevo video
            });
        } catch (error) {
            console.error("Error al añadir un video de formación:", error.message);
            return res.status(500).json({
                message: "Error al añadir el video de formación. Inténtalo más tarde.",
                error: error.message
            });
        }
    },

    deleteTrainingVideo: async (req, res) => {
        const { id: camperId, video_id: videoId } = req.params; // Obtener camperId y videoId desde la URL

        try {
            // Llamar al modelo para eliminar el video
            const result = await CamperModel.deleteTrainingVideo(camperId, videoId);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "No se encontró el video para eliminar o no pertenece al camper." });
            }

            return res.status(200).json({ message: "Video eliminado exitosamente." });
        } catch (error) {
            console.error("Error al eliminar el video de formación:", error.message);
            return res.status(500).json({
                message: "Error al eliminar el video de formación. Inténtalo más tarde.",
                error: error.message
            });
        }
    },

    // Obtener un camper por ID
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await CamperModel.getCamperById(id);
            if (!result.data.length) {
                return res.status(404).json({ message: "Camper no encontrado" });
            }
            const camper = result.data[0];

            res.status(200).json(camper);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener el camper", error });
        }
    },

    // Crear un nuevo camper
    create: async (req, res) => {
        try {
            const result = await CamperModel.createCamper(
                req.body,
                req.user.id,  // ID del usuario que hace la petición
                req.user.role // Rol del usuario que hace la petición
            );
            res.status(201).json({ message: "Camper creado", id: result.data.insertId });
        } catch (error) {
             // console.log(error);
            res.status(error.message.includes('permiso') ? 403 : 500)
                .json({ message: error.message });
        }
    },

    // Actualizar un camper existente
    update: async (req, res) => {
        try {
            // Logs detallados para depuración
             // console.log("req.params:", req.params);
             // console.log("req.body:", req.body);
             // console.log("req.files:", req.files);
    
            const { id } = req.params;
    
            // Validar que el id esté presente
            if (!id) {
                return res.status(400).json({ message: "El parámetro 'id' es obligatorio." });
            }
    
            // Crear un objeto dinámico con los campos enviados
            const updates = {};
            if (req.body.full_name !== undefined) updates.full_name = req.body.full_name;
            if (req.body.city_id !== undefined) updates.city_id = req.body.city_id;
            if (req.body.about !== undefined) updates.about = req.body.about;
            if (req.body.main_video_url !== undefined) updates.main_video_url = req.body.main_video_url;
            if (req.files && req.files.profile_picture) {  
                updates.profile_picture = req.files.profile_picture;    
            }
             // console.log("soy updates",updates)
    
            // Validar que al menos un campo fue enviado
            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ message: "No se enviaron campos para actualizar." });
            }
    
            // Llamar al modelo para actualizar el camper
            const result = await CamperModel.updateCamper(id, updates);

            const responseUpdates = { ...updates };
            if (req.files && req.files.profile_picture) {
                responseUpdates.profile_picture = req.files.profile_picture.name;
            }
    
            res.status(200).json({
                message: "Camper actualizado",
                updateFields: updates,
                camper: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al actualizar el camper",
                error: error.message,
            });
        }
    },
    

    // Eliminar un camper
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await CamperModel.deleteCamper(
                id,
                req.user.id,
                req.user.role
            );
            res.status(200).json({ message: "Camper eliminado" });
        } catch (error) {
            res.status(error.message.includes('permiso') ? 403 : 500)
                .json({ message: error.message });
        }
    },


    //proyectos por camper etc
    getProjectsByCamperId: async (req, res) => {
        const { id: camperId } = req.params;
        try {
            const projects = await CamperModel.getProjectsByCamperId(camperId);
            if (!projects || projects.length === 0) {
                return res.status(404).json({ message: "No se encontraron proyectos para este Camper." });
            }
            return res.status(200).json(projects);
        } catch (error) {
            console.error("Error al obtener proyectos:", error.message);
            return res.status(500).json({ message: "Error al obtener proyectos." });
        }
    },

    addProjectToCamper: async (req, res) => {
        const { id: camperId } = req.params;
        const { title, description, image } = req.body;

        if (!title || !description || !image) {
            return res.status(400).json({ message: "El título, descripción e imagen son obligatorios." });
        }

        try {
            // Llamar al modelo para añadir el proyecto
            const projectId = await CamperModel.addProjectToCamper(camperId, { title, description, image });

            return res.status(201).json({ message: "Proyecto añadido exitosamente.", projectId });
        } catch (error) {
            console.error("Error al añadir un proyecto:", error.message);
            return res.status(500).json({ message: "Error al añadir el proyecto." });
        }
    },

    deleteProjectFromCamper: async (req, res) => {
        const { id: camperId, proyect_id: projectId } = req.params;

        try {
            const affectedRows = await CamperModel.deleteProjectFromCamper(camperId, projectId);

            if (affectedRows === 0) {
                return res.status(404).json({ message: "No se encontró el proyecto para eliminar." });
            }

            return res.status(200).json({ message: "Proyecto eliminado exitosamente." });
        } catch (error) {
            console.error("Error al eliminar el proyecto:", error.message);
            return res.status(500).json({ message: "Error al eliminar el proyecto." });
        }
    },

    //campers stados
    getGraduates: async (req, res) => {
        try {
            const result = await CamperModel.getGraduateCampers();
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener los campers egresados",
                error: error.message
            });
        }
    },

    // Get all training campers
    getTrainees: async (req, res) => {
        try {
            const result = await CamperModel.getTrainingCampers();
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al obtener los campers en formación",
                error: error.message
            });
        }
    },

    // Update camper status
    updateStatus: async (req, res) => {
        if (!req.params.id) {
            return res.status(400).json({
                message: "Se requiere el ID del camper"
            });
        }

        if (!req.body.status) {
            return res.status(400).json({
                message: "Se requiere el nuevo estado del camper"
            });
        }
        const { id } = req.params;
        const { status } = req.body;

        try {
            await CamperModel.updateCamperStatus(
                id,
                status,
                req.user.id,
                req.user.role
            );
            res.status(200).json({
                message: `Estado del camper actualizado a ${status}`
            });
        } catch (error) {
            console.error(error);
            res.status(error.message.includes('admin') ? 403 : 500)
                .json({ message: error.message });
        }
    },

    //obtener sueno por id de camper
    getDreamsByCamperId: async (req, res) => {
        const { id } = req.params; // Obtener el ID del camper de los parámetros

        try {
            // Verificar que el ID es un número válido
            const camperId = parseInt(id, 10);
            if (isNaN(camperId)) {
                return res.status(400).json({
                    message: "El ID del camper debe ser un número válido"
                });
            }

            const dreams = await CamperModel.getDreamsByCamperId(camperId);

            if (!dreams || dreams.length === 0) {
                return res.status(404).json({
                    message: "No se encontraron sueños para este camper"
                });
            }

            return res.status(200).json(dreams);
        } catch (error) {
            console.error("Error al obtener los sueños del camper:", error);
            return res.status(500).json({
                message: "Error al obtener los sueños del camper",
                error: error.message
            });
        }
    },

    addDreamToCamper: async (req, res) => {
        const { id: camperId } = req.params;
        const dreamData = {
            title: req.body.title,
            description: req.body.description,
            image_url: req.body.image_url
        };

        try {
            // Validar que el camperId es un número válido
            if (!Number.isInteger(parseInt(camperId))) {
                return res.status(400).json({
                    message: "ID de camper inválido"
                });
            }

            const result = await CamperModel.addDreamToCamper(
                camperId,
                dreamData,
                req.user.id,    // ID del usuario que hace la petición
                req.user.role   // Rol del usuario que hace la petición
            );

            return res.status(201).json({
                message: "Sueño agregado exitosamente",
                dreamId: result.data.insertId
            });

        } catch (error) {
            console.error("Error completo:", error);
            const status = error.message.includes('permiso') ? 403
                : error.message.includes('no encontrado') ? 404
                    : 500;

            return res.status(status).json({
                message: "Error al agregar el sueño",
                error: error.message
            });
        }
    },

    deleteDreamFromCamper: async (req, res) => {
        const { id: camperId, dream_id: dreamId } = req.params;

        // Verificar si el usuario está autenticado
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado"
            });
        }

        try {
            // Validar que los IDs sean números válidos
            if (!Number.isInteger(parseInt(camperId)) || !Number.isInteger(parseInt(dreamId))) {
                return res.status(400).json({
                    message: "IDs inválidos"
                });
            }

            await CamperModel.deleteDreamFromCamper(
                camperId,
                dreamId,
                req.user.id,    // ID del usuario que hace la petición
                req.user.role   // Rol del usuario que hace la petición
            );

            return res.status(200).json({
                message: "Sueño eliminado exitosamente"
            });

        } catch (error) {
            console.error("Error completo:", error);
            const status = error.message.includes('permiso') ? 403
                : error.message.includes('no encontrado') ? 404
                    : 500;

            return res.status(status).json({
                message: "Error al eliminar el sueño",
                error: error.message
            });
        }
    },

    getCamperDetails: async (req, res) => {
        const { id } = req.params; // Obtener el ID del camper de los parámetros
    
        try {
            // Validar que el ID sea un número válido
            const camperId = parseInt(id, 10);
            if (isNaN(camperId)) {
                return res.status(400).json({
                    message: "El ID del camper debe ser un número válido"
                });
            }
    
            // Llamar al modelo para obtener los detalles completos del camper
            const details = await CamperModel.getCamperDetails(camperId);
    
            return res.status(200).json(details);
    
        } catch (error) {
            console.error("Error al obtener detalles del camper:", error);
    
            return res.status(500).json({
                message: "Error al obtener detalles del camper",
                error: error.message
            });
        }
    },
    

};

module.exports = CamperController;