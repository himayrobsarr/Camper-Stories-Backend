const SponsorModel = require('../models/sponsorModel');
const DonationModel = require('../models/donationModel');
const jwt = require('jsonwebtoken');

class SponsorController {
    static async create(req, res) {
        try {
            // Validar campos requeridos
            const requiredFields = [
                'first_name',
                'last_name',
                'email',
                'password',
                'document_type_id',
                'document_number',
                'city_id',
                'birth_date'
            ];

            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res.status(400).json({
                        message: `El campo ${field} es requerido`
                    });
                }
            }

            // Validar formato de fecha
            const birthDate = new Date(req.body.birth_date);
            if (isNaN(birthDate.getTime())) {
                return res.status(400).json({
                    message: 'Formato de fecha inválido. Use YYYY-MM-DD'
                });
            }

            // Crear sponsor (ahora automáticamente con plan PIONEER)
            const sponsor = await SponsorModel.createSponsor(req.body);

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: sponsor.id,
                    email: sponsor.email,
                    role: 'sponsor'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'Sponsor creado exitosamente con plan PIONEER',
                token,
                sponsor
            });

        } catch (error) {
            console.error('Error en create sponsor:', error);
            res.status(400).json({
                message: 'Error al crear el sponsor',
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

    static async getById(req, res) {
        const { id } = req.params;

        try {
            const sponsor = await SponsorModel.getSponsorById(id);

            if (!sponsor) {
                return res.status(404).json({
                    message: 'Sponsor no encontrado'
                });
            }

            res.status(200).json({
                message: 'Sponsor encontrado exitosamente',
                data: sponsor
            });
        } catch (error) {
            console.error('Error en getById:', error.message);
            res.status(500).json({
                message: 'Error al obtener el sponsor',
                error: error.message
            });
        }
    }

    static async delete(req, res) {
        const { id } = req.params; // Obtener el ID del sponsor de los parámetros de la solicitud

        try {
            const result = await SponsorModel.deleteSponsor(id); // Llamar al modelo para eliminar el sponsor
            res.status(200).json(result); // Responder con el mensaje de éxito
        } catch (error) {
            console.error('Error en delete:', error.message);
            res.status(500).json({
                message: 'Error al eliminar el sponsor',
                error: error.message
            });
        }
    }

    static async finalizeDonation(req, res) {
        try {
            const {
                first_name,
                last_name,
                email,
                document_type,
                document_number,
                city,
                birth_date
            } = req.body;

            if (
                !first_name || !last_name || !email ||
                !document_type || !document_number || !city || !birth_date
            ) {
                return res.status(400).json({
                    message: 'Todos los campos son obligatorios'
                });
            }

            // Crear sponsor con contraseña generada
            const newSponsor = await SponsorModel.finalizeDonationAndGeneratePassword({
                first_name,
                last_name,
                email,
                document_type,
                document_number,
                city,
                birth_date
            });

            // Responder con éxito
            res.status(201).json({
                message: 'Sponsor creado exitosamente con contraseña generada',
                data: newSponsor
            });
        } catch (error) {
            console.error('Error en finalizeDonation:', error);
            res.status(500).json({
                message: 'Error al crear sponsor',
                error: error.message
            });
        }
    }

    // GET /api/sponsors/:sponsorId/donations
    static async getDonations(req, res) {
        try {
            const { sponsorId } = req.params;  
            const donations = await DonationModel.findDonationsBySponsorId(sponsorId);
            
            return res.json(donations);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error obteniendo donaciones del sponsor' });
        }
    }

    static async createPendingSponsor(req, res) {
        try {
            const requiredFields = [
                'first_name',
                'last_name',
                'document_number'
            ];
    
            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res.status(400).json({
                        message: `El campo ${field} es requerido`
                    });
                }
            }
    
            const pendingSponsor = await SponsorModel.finalizeDonationAndGeneratePassword({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                document_number: req.body.document_number
            });
    
            res.status(201).json({
                message: 'Sponsor pendiente creado exitosamente',
                data: pendingSponsor
            });
    
        } catch (error) {
            console.error('Error en createPendingSponsor:', error);
            res.status(400).json({
                message: 'Error al crear el sponsor pendiente',
                error: error.message
            });
        }
    }
    
    static async completeSponsorRegistration(req, res) {
        try {
            const { userId } = req.params;
            
            const requiredFields = [
                'email',
                'password',
                'document_type_id',
                'city_id',
                'birth_date'
            ];
    
            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res.status(400).json({
                        message: `El campo ${field} es requerido`
                    });
                }
            }
    
            const birthDate = new Date(req.body.birth_date);
            if (isNaN(birthDate.getTime())) {
                return res.status(400).json({
                    message: 'Formato de fecha inválido. Use YYYY-MM-DD'
                });
            }
    
            const result = await SponsorModel.completeSponsorRegistration(userId, req.body);
    
            res.status(200).json({
                message: 'Registro de sponsor completado exitosamente',
                data: result
            });
    
        } catch (error) {
            console.error('Error en completeSponsorRegistration:', error);
            res.status(400).json({
                message: 'Error al completar el registro del sponsor',
                error: error.message
            });
        }
    }
}

// Agregar middleware de manejo de errores específicos
const handleSponsorError = (error, res) => {
    if (error.message.includes('duplicate')) {
        return res.status(409).json({
            message: 'El email o documento ya está registrado',
            error: error.message
        });
    }
    // ... otros casos específicos
    return res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
    });
};

// Corregir la función successResponse que estaba mal ubicada y causaba un error de sintaxis
const successResponse = (res, status, message, data) => {
    res.status(status).json({
        success: true,
        message,
        data
    });
};

module.exports = SponsorController;
