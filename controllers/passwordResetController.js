const crypto = require('crypto');
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const conexion = require('../helpers/conexion');
const nodemailer = require('nodemailer');

class PasswordResetController {
    static async requestPasswordReset(req, res) {
        const { email } = req.body;

        try {
            // Verificar si el usuario existe y obtener sus datos
            const userResult = await conexion.query('SELECT id, email FROM USER WHERE email = ?', [email]);
            console.log('Resultado de la consulta:', userResult);

            if (!userResult.data || userResult.data.length === 0) {
                return res.status(404).json({ message: 'Correo no registrado' });
            }

            const user = userResult.data[0];
            console.log('Usuario encontrado:', user);

            // Generar token
            const token = crypto.randomBytes(32).toString('hex');

            // Limpiar tokens antiguos primero
            await conexion.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);

            // Insertar nuevo token
            const insertQuery = `INSERT INTO password_reset_tokens (user_id, token) VALUES (?, ?)`;
            await conexion.query(insertQuery, [user.id, token]);

            // Configuración para envío de correo
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const resetLink = `${process.env.FRONTEND_URL}campers/newPassword/${token}`;

            // Enviar correo
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Recuperación de Contraseña',
                html: `<p>Haz clic en el siguiente enlace para recuperar tu contraseña:</p><a href="${resetLink}">${resetLink}</a>`,
            });

            res.json({ message: 'Correo enviado con el enlace de recuperación' });
        } catch (error) {
            console.error('Error detallado:', error);
            res.status(500).json({ 
                message: 'Error en el servidor',
                error: error.message,
                details: error.stack
            });
        }
    }

    static async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        try {
            // Validar el token
            const query = `SELECT user_id, created_at FROM password_reset_tokens WHERE token = ?`;
            const result = await conexion.query(query, [token]);
            const tokenData = result.data[0];

            if (!tokenData) {
                return res.status(400).json({ message: 'Token inválido o expirado' });
            }

            // Verificar expiración (24 horas)
            const tokenAge = (new Date() - new Date(tokenData.created_at)) / (1000 * 60 * 60);
            if (tokenAge > 24) {
                return res.status(400).json({ message: 'El token ha expirado' });
            }

            // Encriptar la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar la contraseña del usuario
            await conexion.query('UPDATE USER SET password = ? WHERE id = ?', [hashedPassword, tokenData.user_id]);

            // Eliminar el token
            await conexion.query('DELETE FROM password_reset_tokens WHERE token = ?', [token]);

            res.json({ message: 'Contraseña actualizada exitosamente' });
        } catch (error) {
            console.error('Error en resetPassword:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
}

module.exports = PasswordResetController;
