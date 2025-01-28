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




        static async getAll(req, res) {
            try {
                const sponsors = await SponsorModel.getAllSponsors();
    
                // Verificar si sponsors es un array antes de devolver la respuesta
                if (!Array.isArray(sponsors)) {
                    return res.status(500).json({
                        message: 'Error: Los datos obtenidos no son un array',
                        error: 'Datos inválidos recibidos'
                    });
                }
    
                // Responder con los datos si todo está correcto
                res.status(200).json({
                    message: 'Lista de sponsors obtenida exitosamente',
                    data: sponsors
                });
            } catch (error) {
                console.error('Error en getAllSponsors:', error.message);
                res.status(500).json({
                    message: 'Error al obtener la lista de sponsors',
                    error: error.message
                });
            }
        }


    static async update(req, res) {
        const { user_id } = req.params; // Obtener el ID del usuario de los parámetros de la solicitud
        const userData = req.body; // Obtener los datos del usuario del cuerpo de la solicitud
        const requestingUserId = req.user.id; // ID del usuario que hace la solicitud
        const userRole = req.user.role; // Rol del usuario que hace la solicitud
    
        try {
            // Llamar al modelo para actualizar el usuario
            const result = await SponsorModel.updateUser(user_id, userData, requestingUserId, userRole);
            return res.status(200).json(result); // Retornar los datos actualizados con un estado 200
        } catch (error) {
            console.error('Error en el controlador updateUser:', error);
            return res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
        }
    }
}

module.exports = SponsorController;
