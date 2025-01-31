const crypto = require("crypto")

const INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;

exports.generateSignature = (req, res) => {

    const { reference, amountInCents, currency } = req.body;

    if (!reference || !amountInCents || !currency) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const stringToSign = `${reference}${amountInCents}${currency}${INTEGRITY_KEY}`;
    const signature = crypto.createHash("sha256").update(stringToSign).digest("hex");

    res.json({ signature });
};