const jwt = require('jsonwebtoken');
const UserModel = require("../models/userModel");
const CamperModel = require("../models/camperModel");
const DocumentModel = require("../models/documentModel");

const UserController = {
    // Crear un nuevo usuario
    create: async (req, res) => {
        const { first_name, last_name, email, password, role, document_number, age, city } = req.body;
    
        // Validación de datos
        if (!first_name || !last_name || !email || !password || !role || !document_number) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios (first_name, last_name, email, password, role, document_number)."
            });
        }
    
        try {
            // Crear el documento en la tabla DOCUMENT_NUMBER
            const documentResult = await DocumentModel.createDocument({ document_number });
            const document_id = documentResult.data[0].id;  // Obtener el ID del documento recién creado
    
            // Crear el usuario en la tabla USER con el document_id
            const result = await UserModel.createUser({ first_name, last_name, email, password, role, document_id });
            const userId = result.data.insertId; // Obtener el ID del usuario recién creado
    
            // Si el rol es 'camper', crear el perfil de camper
            if (role === 'camper') {
                await CamperModel.createCamper({ user_id: userId, age, city, document_id });
            }
    
            res.status(201).json({ message: "Usuario creado con éxito", id: userId });
        } catch (error) {
            res.status(500).json({ message: "Error al crear el usuario", error: error.message });
        }
    },
    

    // Lógica para login sigue igual
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email y password son requeridos' });
            }

            const user = await UserModel.login(email, password);

            // Generar token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.first_name + ' ' + user.last_name
                }
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },

    // Método para obtener un usuario por ID
    getById: async (req, res) => {
        try {
            if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
                return res.status(403).json({ message: "No tienes permiso para ver este usuario" });
            }
            const result = await UserModel.getUserById(req.params.id);
            if (!result.data.length) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json(result.data[0]);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener el usuario", error: error.message });
        }
    },

    // Actualizar un usuario
    update: async (req, res) => {
        const { first_name, last_name, email, role, document_number, age, city } = req.body;

        try {
            if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
                return res.status(403).json({ message: "No tienes permiso para modificar este usuario" });
            }

            // Actualizar los datos del usuario
            const result = await UserModel.updateUser(req.params.id, { first_name, last_name, email, role });

            // Si el rol es 'camper', actualizar también el perfil del camper
            if (role === 'camper') {
                await CamperModel.updateCamperByUserId(req.params.id, { age, city, document_number });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Eliminar un usuario
    delete: async (req, res) => {
        try {
            if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
                return res.status(403).json({ message: "No tienes permiso para eliminar este usuario" });
            }

            await UserModel.deleteUser(req.params.id);
            res.status(200).json({ message: "Usuario eliminado" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
        }
    },

    logout: (req, res) => {
        res.json({ message: "Sesión cerrada exitosamente" });
    }
};

module.exports = UserController;
