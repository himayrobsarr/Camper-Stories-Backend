const CamperProjectModel = require("../models/projectModel");

const CamperProjectController = {
    // Obtener todos los proyectos de un camper por camper_id
    getProjectsByCamperId: async (req, res) => {
        const { camperid } = req.params;
        try {
            const result = await CamperProjectModel.getProjectsByCamperId(camperid); 
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los proyectos del camper", error: error.message });
        }
    },      

    // Agregar un nuevo proyecto para un camper
    addProjectForCamper: async (req, res) => {
        const { camper_id } = req.params;
        const projectData = req.body;
        const requestingUserId = req.user.id; // ID del usuario logueado

        try {
            const result = await CamperProjectModel.addProjectForCamper(camper_id, projectData, requestingUserId);
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
