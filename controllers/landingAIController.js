const landingAIModel = require('../models/landingAIModel');

const landingAIController = {
    saveRegisteredInfo: async (req, res) => {
        try {
            const { name, lastname, email, phone, document, payment_reference, payment_date } = req.body;

            if (!name || !lastname || !email || !phone || !document) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            await landingAIModel.saveRegisteredInfo({
                name,
                lastname,
                email,
                phone,
                document,
                payment_reference,
                payment_date
            });

            return res.status(200).json({ message: "Registro guardad exitosamente" });
        } catch (error) {
            console.error("Error guardando la información:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
};

module.exports = landingAIController;
