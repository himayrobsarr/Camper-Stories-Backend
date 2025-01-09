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
        const requestingUserId = req.user.id; // ID del usuario logueado
        const userRole = req.user.role; // Rol del usuario logueado

        try {
            if (userRole !== 'admin' && parseInt(userId) !== requestingUserId) {
                return res.status(403).json({ message: "No tienes permiso para acceder a estos méritos" });
            }
            const result = await MeritModel.getMeritsByUserId(userId);
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los méritos del usuario", error: error.message });
        }
    },

    // Asignar un mérito a un usuario
    assignMerit: async (req, res) => {
        try {
            const result = await MeritModel.assignMeritToUser(
                req.body,
                req.user.id,
                req.user.role
            );
            res.status(201).json({ message: "Mérito asignado exitosamente", id: result.data.insertId });
        } catch (error) {
            console.error(error);
            res.status(error.message.includes('permiso') ? 403 : 500).json({ message: error.message });
        }
    },

    // Actualizar un mérito asignado
    updateMerit: async (req, res) => {
        try {
            const result = await MeritModel.updateMeritAssignment(
                req.body,
                req.user.id,
                req.user.role
            );
            res.status(200).json({ message: "Mérito actualizado exitosamente" });
        } catch (error) {
            console.error(error);
            res.status(error.message.includes('permiso') ? 403 : 500).json({ message: error.message });
        }
    }
};

module.exports = MeritController;
