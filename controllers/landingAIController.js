const landingAIModel = require('../models/landingAIModel');

const landingAIController = {
    saveRegisteredInfo: async (req, res) => {
        try {
            const { name, lastname, email, phone, document, payment_reference, selected_course } = req.body;

            const payment_date = null; // la fecha se crea en null, luego se actualiza

            if (!name || !lastname || !email || !phone || !document || !payment_reference || !selected_course) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            await landingAIModel.saveRegisteredInfo({
                name,
                lastname,
                email,
                phone,
                document,
                payment_reference,
                payment_date,
                selected_course
            });

            return res.status(200).json({ message: "Registro guardadito exitosamente" });
        } catch (error) {
            console.error("Error guardando la información:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    getAllRegistered: async (req, res) => {
        try {
            const registros = await landingAIModel.getAllRegistered();

            return res.status(200).json({
                success: true,
                message: "Registros obtenidos exitosamente",
                data: registros
            });
        } catch (error) {
            console.error("Error obteniendo los registros:", error);
            return res.status(500).json({
                success: false,
                error: "Error interno del servidor"
            });
        }
    },

    getRegisteredById: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: "ID no proporcionado"
                });
            }

            const registro = await landingAIModel.getRegisteredById(id);

            if (!registro) {
                return res.status(404).json({
                    success: false,
                    error: "Registro no encontrado"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Registro obtenido exitosamente",
                data: registro
            });
        } catch (error) {
            console.error("Error obteniendo el registro:", error);
            return res.status(500).json({
                success: false,
                error: "Error interno del servidor"
            });
        }
    },

    getConfirmedCount: async (req, res) => {
        try {
            const total = await landingAIModel.getConfirmedCount();

            return res.status(200).json({
                success: true,
                message: "Total de Registros Exitosos obtenidos exitosamente",
                data: total
            });
        } catch (error) {
            console.error("Error obteniendo los registros:", error);
            return res.status(500).json({
                success: false,
                error: "Error interno del servidor"
            });
        }
    },
};

module.exports = landingAIController;
