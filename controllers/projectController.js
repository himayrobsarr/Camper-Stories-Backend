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

        console.log('req.body:', req.body);
        console.log('req.files:', req.files);

        try {
            // Obtener los datos desde form-data
            const camper_id = req.body.camper_id; // Recibe como un campo plano
            const title = req.body.title;
            const description = req.body.description;
            const code_url = req.body.code_url;
            const technologyIds = JSON.parse(req.body.technologyIds || '[]'); // Parsear JSON de tecnología
            const image = req.files?.image; // El archivo de imagen, si existe
            const requestingUserId = req.user?.id; // ID del usuario logueado (middleware de autenticación)

            // Validar que camper_id exista
            if (!camper_id) {
                throw new Error("El campo 'camper_id' es obligatorio.");
            }

            // Validar otros campos necesarios
            if (!title || !description) {
                throw new Error("Los campos 'title' y 'description' son obligatorios.");
            }

            // Preparar los datos del proyecto
            const projectData = { title, description, image, code_url, technologyIds };

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
        try {
            console.log('req.body:', req.body);
    
            const camper_id = req.params.camper_id;
            const project_id = req.params.project_id;
    
            // Validar que camper_id y project_id existan
            if (!camper_id) {
                throw new Error("El campo 'camper_id' es obligatorio.");
            }
            if (!project_id) {
                throw new Error("El campo 'project_id' es obligatorio.");
            }
    
            // Crear un objeto dinámico con los campos enviados
            const updates = {};
            if (req.body.title !== undefined) updates.title = req.body.title;
            if (req.body.description !== undefined) updates.description = req.body.description;
            if (req.body.code_url !== undefined) updates.code_url = req.body.code_url;
    
            // Validar y manejar technologyIds si se envió
            if (req.body.technologyIds !== undefined) {
                if (!Array.isArray(req.body.technologyIds)) {
                    throw new Error("El campo 'technologyIds' debe ser un arreglo.");
                }
                updates.technologyIds = req.body.technologyIds;
            }
    
            // Validar que al menos un campo fue enviado
            if (Object.keys(updates).length === 0) {
                throw new Error("No se enviaron campos para actualizar.");
            }
    
            // Llamar al modelo con los campos dinámicos para actualizar el proyecto
            const result = await CamperProjectModel.updateProjectForCamper(camper_id, project_id, updates);
    
            res.status(200).json({
                message: "Proyecto actualizado correctamente",
                updatedFields: updates,
                project: result,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error al actualizar el proyecto",
                error: error.message,
            });
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
