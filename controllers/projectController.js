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

    
    addProjectForCamper: async (req, res) => {
        const projectData = req.body;
        try {
            // Pasamos los datos del proyecto al modelo
            const result = await CamperProjectModel.addProjectForCamper(projectData);

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

            // Manejo de errores basados en el tipo de error
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

    updateProjectForCamper: async (req, res) => {
        const { projectid } = req.params;  // Obtener el ID del proyecto desde la URL
        const projectData = req.body;  // Los nuevos datos del proyecto que vienen en el cuerpo de la solicitud
        
        try {
            // Llamamos al modelo para actualizar el proyecto
            const result = await CamperProjectModel.updateProjectForCamper(projectid, projectData);
            
            // Enviar respuesta exitosa si la actualización fue exitosa
            res.status(200).json({
                message: "Proyecto actualizado",
                project: result
            });
        } catch (error) {
            console.error("Error al actualizar el proyecto:", error);
        
            // Manejar errores según su tipo
            if (error.message.includes('El proyecto no pertenece')) {
                // Error 403 cuando el proyecto no pertenece al camper
                res.status(403).json({
                    message: "El proyecto no pertenece al camper especificado."
                });
            } else if (error.message.includes('No hay datos nuevos para actualizar')) {
                // Error 400 cuando no hay datos nuevos para actualizar
                res.status(400).json({
                    message: "No hay datos nuevos para actualizar el proyecto."
                });
            } else {
                // Error 500 en caso de otros problemas generales
                res.status(500).json({
                    message: "Hubo un error al intentar actualizar el proyecto.",
                    error: error.message
                });
            }
        }
    }    
    
};

module.exports = CamperProjectController;
