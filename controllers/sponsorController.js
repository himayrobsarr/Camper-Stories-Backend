const SponsorModel = require("../models/sponsorModel");

const SponsorController = {
    // Obtener todos los sponsors
    getAll: async (req, res) => {
        try {
            const result = await SponsorModel.getAllSponsors();
            res.status(200).json(result.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los sponsors", error: error.message });
        }
    },

    // Obtener un sponsor por ID
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await SponsorModel.getSponsorById(id);
            if (!result.data.length) {
                return res.status(404).json({ message: "Sponsor no encontrado" });
            }
            res.status(200).json(result.data[0]);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener el sponsor", error });
        }
    },

    // Crear un nuevo sponsor
    create: async (req, res) => {
        try {
            const { contribution, first_name, last_name, email, phone, message } = req.body;
    
            if (!contribution || isNaN(contribution) || contribution <= 0) {
                return res.status(400).json({ message: 'El valor de la contribución es inválido.' });
            }
    
            if (!first_name || !last_name || !email) {
                return res.status(400).json({ message: 'Faltan campos obligatorios.' });
            }
    
            const result = await SponsorModel.createSponsor({
                contribution,
                first_name,
                last_name,
                email,
                phone,
                message,
            });
    
            res.status(201).json({ message: 'Sponsor registrado exitosamente', id: result.insertId });
        } catch (error) {
            res.status(500).json({ message: 'Error al registrar el sponsor', error: error.message });
        }
    },    

    // Actualizar un sponsor existente
    update: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await SponsorModel.updateSponsor(id, req.body);
            res.status(200).json({ message: "Información del sponsor actualizada" });
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar el sponsor", error: error.message });
        }
    },

    // Eliminar un sponsor
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await SponsorModel.deleteSponsor(id);
            res.status(200).json({ message: "Sponsor eliminado" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar el sponsor", error: error.message });
        }
    },
};

module.exports = SponsorController;
