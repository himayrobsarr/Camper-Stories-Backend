const technologyModel = require("../models/technologyModel.js");

const technologyController = {
    getAll: async (req, res) => {
        try {
            const technology = await technologyModel.getAlltechnology();
            if (technology && technology.data) {
                return res.status(200).json(technology);
            }
            return res.status(404).json({ message: "No se encontraron tecnologias" });
        } catch (error) {
            console.error('Error en technologyController.getAll:', error);
            return res.status(500).json({ 
                message: "Error interno del servidor al obtener las tecnologias",
                error: error.message 
            });
        }
    }
};

module.exports = technologyController;