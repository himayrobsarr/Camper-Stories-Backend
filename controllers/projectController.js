const CamperProjectModel = require("../models/projectModel");

const CamperProjectController = {
    // Obtener todos los proyectos de un camper por camper_id
    getProjectsByCamperId: async (req, res) => {
        console.log("Parámetros recibidos:", req.params); // Depuración
        const { camper_id } = req.params; // Extrae 'id' de los parámetros
        try {
            const result = await CamperProjectModel.getProjectsByCamperId(camper_id); // Pasa 'id' al modelo
            if (!result.length) {
                return res.status(404).json({ message: "No se encontraron proyectos para este camper" });
            }
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los proyectos", error: error.message });
        }
    },      

    // Agregar un nuevo proyecto para un camper
    addProjectForCamper: async (req, res) => {
        const { camper_id } = req.params;
        const projectData = req.body;

        try {
            const result = await CamperProjectModel.addProjectForCamper(camper_id, projectData);
            res.status(201).json({ message: "Proyecto agregado", project: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al agregar el proyecto", error: error.message });
        }
    },

    // Actualizar un proyecto existente
    updateProjectForCamper: async (req, res) => {
        const { camper_id, project_id } = req.params;
        const projectData = req.body;

        try {
            const result = await CamperProjectModel.updateProjectForCamper(camper_id, project_id, projectData);
            res.status(200).json({ message: "Proyecto actualizado", project: result });
        } catch (error) {
            console.error(error);
            res.status(error.message.includes('no pertenece') ? 403 : 500)
                .json({ message: error.message });
        }
    },
};

module.exports = CamperProjectController;
