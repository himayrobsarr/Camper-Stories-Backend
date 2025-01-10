const MeritModel = require("../models/meritModel");

const MeritController = {
    // Obtener todos los méritos
    getAll: async (req, res) => {
        try {
            const result = await MeritModel.getAllMerits();
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los méritos", error: error.message });
        }
    },

    // Obtener los méritos de un usuario específico
    getByUserId: async (req, res) => {
        const { userId } = req.params;

        try {
            const result = await MeritModel.getMeritsByUserId(userId);
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los méritos del usuario", error: error.message });
        }
    },

    // Actualizar todos los méritos de un camper
    updateCamperMerits: async (req, res) => {
        const { camperId } = req.params;
        const { meritIds } = req.body;
        const userRole = req.user.role;
    
        try {
            // Validaciones básicas
            if (!camperId) {
                return res.status(400).json({ 
                    message: "El ID del camper es requerido" 
                });
            }
    
            if (!Array.isArray(meritIds)) {
                return res.status(400).json({ 
                    message: "meritIds debe ser un array" 
                });
            }
    
            // // Verificar permisos
            // if (userRole !== 'admin' && userRole !== 'trainer') {
            //     return res.status(403).json({ 
            //         message: "No tienes permiso para actualizar méritos" 
            //     });
            // }
    
            await MeritModel.updateCamperMerits({ camperId, meritIds });
            
            return res.status(200).json({
                message: "Méritos actualizados exitosamente"
            });
    
        } catch (error) {
            console.error('Error en updateCamperMerits:', error);
            return res.status(500).json({ 
                message: "Error al actualizar los méritos del camper",
                error: error.message 
            });
        }
    }
};

module.exports = MeritController;