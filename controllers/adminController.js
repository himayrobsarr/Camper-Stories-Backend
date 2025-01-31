const adminModel = require('../models/adminModel');

class AdminController {
    // Método para obtener el total de registros
    static async getAllRegister(req, res) {
        try {
            const totalRegistros = await adminModel.getAllregister();
            res.status(200).json({ totalRegistros });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Método para obtener los registros incompletos
    static async getAllIncomplete(req, res) {
        try {
            const totalIncompletos = await adminModel.getAllIncomplete();
            res.status(200).json({ totalIncompletos });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async createAdmin(req, res) {
        try {
            const { first_name, last_name, email, password, document_type, document_number, city, birth_date } = req.body;

            // Validación básica de datos requeridos
            if (!first_name || !last_name || !email || !password || !document_type || !document_number || !city || !birth_date) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios' });
            }

            // Crear el usuario admin en la base de datos
            const newAdmin = await adminModel.createAdmin({
                first_name,
                last_name,
                email,
                password,
                document_type,
                document_number,
                city,
                birth_date
            });

            return res.status(201).json({ message: 'Administrador creado exitosamente', admin: newAdmin });

        } catch (error) {
            console.error('Error en createAdmin:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = AdminController;
