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
             // console.log('Resultado de la consulta:', userResult);

            if (!userResult.data || userResult.data.length === 0) {
                return res.status(404).json({ message: 'Correo no registrado' });
            }

            const user = userResult.data[0];
             // console.log('Usuario encontrado:', user);

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
                subject: 'Recuperación de Contraseña - Campuslands',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 40px 0; text-align: center; background-color: #ffffff;">
                                    <!-- Aquí puedes agregar tu logo -->
                                    <img src="https://camper-stories.s3.us-east-2.amazonaws.com/assets/CampusLogo.png" alt="Logo" style="max-width: 200px; height: auto;">
                                </td>
                            </tr>
                        </table>
                        
                        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px; text-align: center;">
                                        Recuperación de Contraseña
                                    </h1>
                                    
                                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                                        Hola,
                                    </p>
                                    
                                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                                        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no has solicitado este cambio, puedes ignorar este correo.
                                    </p>
                                    
                                    <table role="presentation" style="width: 100%; margin: 30px 0;">
                                        <tr>
                                            <td style="text-align: center;">
                                                <a href="${resetLink}" 
                                                   style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                                    Restablecer Contraseña
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                                        Por razones de seguridad, este enlace expirará en 24 horas. Si necesitas un nuevo enlace, puedes solicitarlo nuevamente en nuestra página web.
                                    </p>
                                    
                                    <p style="color: #666666; font-size: 14px; line-height: 1.5;">
                                        Si tienes problemas para hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
                                    </p>
                                    
                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; word-break: break-all;">
                                        ${resetLink}
                                    </p>
                                </td>
                            </tr>
                        </table>
                        
                        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto;">
                            <tr>
                                <td style="padding: 40px; text-align: center;">
                                    <p style="color: #999999; font-size: 14px; margin: 0;">
                                        Este es un correo electrónico automático, por favor no respondas a este mensaje.
                                    </p>
                                    <p style="color: #999999; font-size: 14px; margin: 10px 0 0 0;">
                                        &copy; ${new Date().getFullYear()} Campuslands. Todos los derechos reservados.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `
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
