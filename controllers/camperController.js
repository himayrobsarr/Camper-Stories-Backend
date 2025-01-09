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

    // Obtener todos los campers filtrados por estado (egresado o en formación)
    getAllByStatus: async (req, res) => {
        const { status } = req.params; // Ejemplo: "egresado" o "en_formacion"
        try {
            const result = await CamperModel.getAllCampersByStatus(status);
            if (!result.data.length) {
                return res.status(404).json({ message: "No se encontraron campers con ese estado" });
            }
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los campers por estado", error: error.message });
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

};

module.exports = CamperController;