// controllers/user.controller.js
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const conexion = require('../helpers/conexion');
const SponsorModel = require('../models/sponsorModel');

class UserController {
    static async      create(req, res) {
        try {
            // Validar campos requeridos
            const requiredFields = ['first_name', 'last_name', 'email', 'password', 'document_type', 'document_number', 'birth_date', 'city', 'campus_id'];
            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res.status(400).json({ message: `El campo ${field} es requerido` });
                }
            }

            // Extraer document_number del cuerpo de la solicitud
            const { document_number } = req.body;

            // Validar si el camper existe en la lista blanca
            await UserModel.checkDocNumInWhitelist(document_number);

            // Validar formato de fecha
            const birthDate = new Date(req.body.birth_date);
            if (isNaN(birthDate.getTime())) {
                return res.status(400).json({ message: 'Formato de fecha inválido. Use YYYY-MM-DD' });
            }

            // Crear usuario con todas sus relaciones
            const user = await UserModel.createWithRelations(req.body);

        

            // Generar token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    role: 'camper' 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({ token, user });
        } catch (error) {
            console.error('Error en create:', error);
            res.status(400).json({ 
                message: 'Error al crear el usuario',
                error: error.message 
            });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            const user = await UserModel.findByEmail(email);
            
            if (!user) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            const isValidPassword = await UserModel.validatePassword(user, password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { 
                    id: user.user_id, 
                    email: user.email, 
                    role_id: user.role_id,
                    role_name: user.role_name
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            const userData = {
                camper_id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role_id: user.role_id,
                role_name: user.role_name,
                city: user.city_name
            };

            res.json({ 
                token,
                user: userData
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    static async logout(req, res) {
        res.json({ message: 'Sesión cerrada exitosamente' });
    }

    static async getAll(req, res) {
        try {
            const users = await UserModel.findAll();
            res.json(users);
        } catch (error) {
            console.error('Error en getAll:', error);
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    }

    static async getById(req, res) {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json(user);
        } catch (error) {
            console.error('Error en getById:', error);
            res.status(500).json({ message: 'Error al obtener el usuario' });
        }
    }

    static async update(req, res) {
        try {
            // Implementar actualización si es necesario
            res.status(501).json({ message: 'Función no implementada' });
        } catch (error) {
            console.error('Error en update:', error);
            res.status(400).json({ message: 'Error al actualizar el usuario' });
        }
    }

    static async delete(req, res) {
        try {
            const query = 'DELETE FROM USER WHERE id = ?';
            await conexion.query(query, [req.params.id]);
            res.json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            console.error('Error en delete:', error);
            res.status(500).json({ message: 'Error al eliminar el usuario' });
        }
    }

    static async createSponsor(req, res) {
        try {
            // Validar campos requeridos para sponsor
            const requiredFields = [
                'first_name', 
                'last_name', 
                'email', 
                'password', 
                'document_type', 
                'document_number'
            ];

            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res.status(400).json({ 
                        success: false,
                        error: `El campo ${field} es requerido` 
                    });
                }
            }

            // Verificar si el email ya existe
            const existingUser = await UserModel.findByEmail(req.body.email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'El email ya está registrado'
                });
            }

            // Crear el usuario
            const userData = {
                ...req.body,
                role_id: 'sponsor' // Role de sponsor directamente
            };

            const userId = await UserModel.create(userData);

            // Crear registro en tabla SPONSOR
            await SponsorModel.create({
                user_id: userId,
                image_url: req.body.image_url || null,
                plan_id: null // Se actualizará cuando seleccione un plan
            });

            // Generar token
            const token = jwt.sign(
                { 
                    id: userId, 
                    email: req.body.email,
                    role: 'sponsor'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                success: true,
                message: 'Sponsor registrado exitosamente',
                token,
                user: {
                    id: userId,
                    email: req.body.email,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    role: 'sponsor'
                }
            });

        } catch (error) {
            console.error('Error en createSponsor:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al crear el sponsor'
            });
        }
    }
}

module.exports = UserController;