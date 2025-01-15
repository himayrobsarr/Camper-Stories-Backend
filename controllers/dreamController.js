const DreamModel = require("../models/dreamModel");

const DreamController = {
    // Obtener todos los sueños
    getAll: async (req, res) => {
        try {
            const result = await DreamModel.getAllDreams();
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los sueños", error: error.message });
        }
    },

    // Obtener un sueño por ID
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await DreamModel.getDreamById(id);
            if (!result.data.length) {
                return res.status(404).json({ message: "Sueño no encontrado" });
            }
            res.status(200).json(result.data[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener el sueño", error: error.message });
        }
    },

    // Crear un nuevo sueño
    create: async (req, res) => {
        try {
           
            
            const archivo = req.files.image_url;

            const dreamData = {
                title: req.body.title,
                description: req.body.description,
                image_url: archivo,
                camper_id: req.body.camper_id,
            };
    
          
    
            if (!dreamData.title || !dreamData.description || !dreamData.camper_id) {
                console.log('Validación fallida - campos faltantes:', dreamData);
                return res.status(400).json({ message: "Faltan campos obligatorios." });
            }
    
           
            const result = await DreamModel.createDream(
                dreamData,
                req.user.id,
                req.user.role
            );
           
    
            res.status(201).json({
                message: "Sueño creado",
                dream: result.createdDream,
            });
        } catch (error) {
          
            res.status(error.message.includes('permiso') ? 403 : 500)
               .json({ message: error.message });
        }
    },
    

    // Actualizar un sueño existente
    update: async (req, res) => {
        const { id } = req.params;
        console.log("request : ",req)
        try {
            const result = await DreamModel.updateDream(
                id,
                req.body, 
                req.files,    // Datos a actualizar
                req.user.id,  // ID del usuario autenticado
                req.user.role // Rol del usuario autenticado
            );
            res.status(200).json({ message: "Sueño actualizado" });
        } catch (error) {
            console.error(error);
            res.status(error.message.includes('permiso') ? 403 : 500).json({ message: error.message });
        }
    },

    // Eliminar un sueño
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await DreamModel.deleteDream(
                id,
                req.user.id,  // ID del usuario autenticado
                req.user.role // Rol del usuario autenticado
            );
            res.status(200).json({ message: "Sueño eliminado" });
        } catch (error) {
            console.error(error);
            res.status(error.message.includes('permiso') ? 403 : 500).json({ message: error.message });
        }
    },


};

module.exports = DreamController;
