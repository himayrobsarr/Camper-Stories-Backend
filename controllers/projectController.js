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

        const projectData = req.body;
    
        const requestingUserId = req.user.id; // ID del usuario logueado
        try {
            // Pasamos el user_id del usuario logueado al modelo
            const result = await CamperProjectModel.addProjectForCamper(projectData, requestingUserId);
    
            if (!result) {
                throw new Error('No se pudo agregar el proyecto');
            }
    
            // Respuesta exitosa si el proyecto se agrega correctamente
            res.status(201).json({
                message: "Proyecto agregado",
                project: result
            });
        } catch (error) {
            console.error("Error en el controlador addProjectForCamper:", error);
    
            // Manejo de errores basado en el tipo de error
            if (error.message.includes('No se pudo agregar el proyecto')) {
                res.status(400).json({
                    message: "No se pudo agregar el proyecto. Intenta nuevamente."
                });
            } else if (error.message.includes('Error en la base de datos')) {
                res.status(500).json({
                    message: "Hubo un error al interactuar con la base de datos.",
                    error: error.message
                });
            } else {
                // Manejo de errores generales
                res.status(500).json({
                    message: "Error al agregar el proyecto",
                    error: error.message
                });
            }
        }
    },

    // Actualizar un proyecto de un camper
    updateProjectForCamper: async (req, res) => {
        const { id } = req.params; // Cambié 'project_id' a 'id'
        const projectData = req.body;
        const requestingUserId = req.user.id; // ID del usuario logueado

        try {
            // Pasamos el user_id y el id (anteriormente project_id) al modelo para actualizar el proyecto
            const result = await CamperProjectModel.updateProjectForCamper(projectData, requestingUserId, id);
            
            if (!result) {
                throw new Error('No se pudo actualizar el proyecto');
            }
            
            // Respuesta exitosa si el proyecto se actualiza correctamente
            res.status(200).json({
                message: "Proyecto actualizado",
                project: result
            });
        } catch (error) {
            console.error("Error en el controlador updateProjectForCamper:", error);
            
            // Manejo de errores basado en el tipo de error
            if (error.message.includes('No se pudo actualizar el proyecto')) {
                res.status(400).json({
                    message: "No se pudo actualizar el proyecto. Intenta nuevamente."
                });
            } else if (error.message.includes('Error en la base de datos')) {
                res.status(500).json({
                    message: "Hubo un error al interactuar con la base de datos.",
                    error: error.message
                });
            } else {
                // Manejo de errores generales
                res.status(500).json({
                    message: "Error al actualizar el proyecto",
                    error: error.message
                });
            }
        }
    }
};

module.exports = CamperProjectController;
