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

    // Obtener un camper por ID
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await CamperModel.getCamperById(id);
            if (!result.data.length) {
                return res.status(404).json({ message: "Camper no encontrado" });
            }
            res.status(200).json(result.data[0]);
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