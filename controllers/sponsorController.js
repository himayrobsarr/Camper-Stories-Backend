const SponsorModel = require('../models/sponsorModel');

class SponsorController {
    static async create(req, res) {
        try {
            // Validar datos del cuerpo de la solicitud
            const {
                first_name,
                last_name,
                email,
                password,
                document_type,
                document_number,
                city,
                birth_date
            } = req.body;

            if (
                !first_name || !last_name || !email || !password ||
                !document_type || !document_number || !city || !birth_date
            ) {
                return res.status(400).json({
                    message: 'Todos los campos son obligatorios'
                });
            }

            // Crear sponsor
            const newSponsor = await SponsorModel.createSponsor({
                first_name,
                last_name,
                email,
                password,
                document_type,
                document_number,
                city,
                birth_date
            });

            // Responder con éxito
            res.status(201).json({
                message: 'Sponsor creado exitosamente',
                data: newSponsor
            });
        } catch (error) {
            console.error('Error en createSponsor:', error);
            res.status(500).json({
                message: 'Error al crear sponsor',
                error: error.message
            });
        }
    }
}

module.exports = SponsorController;
