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
}

module.exports = AdminController;
