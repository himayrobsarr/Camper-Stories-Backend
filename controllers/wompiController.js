const crypto = require("crypto");
const INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;

const WompiController = {
    generateSignature: async (req, res) => {
        try {
            const { reference, amountInCents, currency } = req.body;

            if (!reference || !amountInCents || !currency) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            if (!INTEGRITY_KEY) {
                return res.status(500).json({ error: "INTEGRITY_KEY no está configurada." });
            }

            // Asegurar que los valores sean exactamente como los necesitamos
            const cleanReference = reference.toString();
            const cleanAmount = amountInCents.toString();
            const cleanCurrency = currency.toUpperCase();

            // Construir el string sin espacios ni caracteres adicionales
            const stringToSign = `${cleanReference}${cleanAmount}${cleanCurrency}${INTEGRITY_KEY}`;

            // Generar la firma usando UTF-8
            const signature = crypto
                .createHash("sha256")
                .update(stringToSign, 'utf8')
                .digest("hex");

            console.log(signature)

            return res.status(200).json({ signature });
        } catch (error) {
            console.error("Error generando la firma:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },
};

module.exports = WompiController;