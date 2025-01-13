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
        const { camper_id, projectData } = req.body; // Extrae camper_id y projectData desde el cuerpo de la solicitud
        const requestingUserId = req.user.id; // ID del usuario logueado
    
        try {
            // Validar que camper_id exista
            if (!camper_id) {
                throw new Error("El campo 'camper_id' es obligatorio.");
            }
    
            // Validar que projectData exista
            if (!projectData || typeof projectData !== 'object') {
                throw new Error("El campo 'projectData' debe ser un objeto válido.");
            }
    
            // Llama al modelo con los parámetros correctos
            const result = await CamperProjectModel.addProjectForCamper(camper_id, projectData, requestingUserId);
    
            res.status(201).json({
                message: "Proyecto agregado",
                project: result,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al agregar el proyecto",
                error: error.message,
            });
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

    //tecnologias de un proyecto
    getProjectTechnologies: async (req, res) => {
        const { projectId } = req.params;
        
        try {
            // Validar que projectId sea un número válido
            if (!projectId || isNaN(projectId)) {
                return res.status(400).json({
                    message: "ID de proyecto inválido",
                    technologies: []
                });
            }

            const technologies = await CamperProjectModel.getProjectTechnologies(projectId);
            
            // Siempre devolver un array, incluso si está vacío
            res.status(200).json({
                message: technologies.length ? "Tecnologías encontradas" : "No se encontraron tecnologías",
                technologies: technologies
            });

        } catch (error) {
            console.error('Error en el controlador:', error);
            res.status(500).json({
                message: "Error al obtener las tecnologías del proyecto",
                error: error.message,
                technologies: []
            });
        }
    }
};

module.exports = CamperProjectController;
