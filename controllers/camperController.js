const CamperModel = require("../models/camperModel")

const CamperController = {
    // Obtener todos los campers
    getAll: async(req, res) => {
        try {
            const result = await CamperModel.getAllCampers();
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los campers", error: error.message});
        }
    },

    getVideosByCamperId: async (req, res) => {
        const camperId = parseInt(req.params.camperId, 10); // Asegurar que sea un número
        console.log("CamperId recibido:", camperId); // Log para depuración

        try {
            const videos = await CamperModel.getVideosByCamperId(camperId);

            if (!videos || videos.length === 0) {
                console.log("No se encontraron videos para camperId:", camperId);
                return res.status(404).json({ message: "No se encontraron videos para este camper." });
            }

            console.log("Videos encontrados:", videos);
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
            console.log(error);
            res.status(error.message.includes('permiso') ? 403 : 500)
                .json({ message: error.message });
        }
    },

    // Actualizar un camper existente
    update: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await CamperModel.updateCamper(
                id, 
                req.body,
                req.user.id,
                req.user.role
            );
            res.status(200).json({ message: "Camper actualizado"})
        } catch (error) {
            console.log(error);
            res.status(error.message.includes('permiso') ? 403 : 500)
                .json({ message: error.message });
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
};

module.exports = CamperController;