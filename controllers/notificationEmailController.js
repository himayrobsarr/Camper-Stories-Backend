const nodemailer = require('nodemailer');

class NotificationEmailController {
    static async sendNotificationEmail(req, res) {
        const { email, username, phone, documentNumber, documentType, paymentMethod, contactEmail } = req.body;

        try {

            const courseName = "Inteligencia Artificial 22 de febrero de 2025";
            // Configuración para envío de correo
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Enviar correo de notificación
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: contactEmail,
                subject: '📋 Nueva Inscripción - Curso de Inteligencia Artificial',
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
                                <td style="padding: 40px 0; text-align: center; background-color: #000000;">
                                    <img src="https://camper-stories.s3.us-east-2.amazonaws.com/assets/CampusLogo.png" alt="Logo" style="max-width: 300px; height: auto;">
                                </td>
                            </tr>
                        </table>
                        
                        <table role="presentation" style="max-width: 600px; margin: 50px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px; text-align: center;">
                                        Nueva Inscripción Confirmada 🎓
                                    </h1>
                                    
                                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                                        Hola equipo,
                                    </p>
                                    
                                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                                        Les informamos que <b>${username}</b> (<a href="mailto:${email}" style="color: #007bff;">${email}</a>) se ha inscrito en el curso <b>${courseName}</b> y ha realizado el pago mediante <b>${paymentMethod}</b>.
                                    </p>

                                    <h2 style="color: #007bff; font-size: 18px; text-align: center;">Detalles de la inscripción:</h2>
                                    <ul style="color: #666666; font-size: 16px; line-height: 1.5; padding-left: 20px;">
                                        <li>📧 <b>Correo del participante:</b> ${email}</li>
                                        <li>📞 <b>Teléfono del participante:</b> ${phone}</li>
                                        <li>📛 <b>Nombre del participante:</b> ${username}</li>
                                        <li>📄 <b>Numero de documento:</b> ${documentType}: ${documentNumber}</li>
                                        <li>📚 <b>Curso inscrito:</b> ${courseName}</li>}
                                        <li>💳 <b>Método de pago:</b> ${paymentMethod}</li>
                                    </ul>

                                    <h2 style="color: #007bff; font-size: 18px; text-align: center;">Acción requerida:</h2>
                                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: center;">
                                        Por favor, generar el acceso correspondiente para este participante.
                                    </p>

                                    <h2 style="color: #007bff; font-size: 18px; text-align: center;">Contacto:</h2>
                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; text-align: center;">
                                        Si necesitan más información, pueden responder a este correo o contactarme directamente en: <a href="mailto:${contactEmail}" style="color: #007bff;">${contactEmail}</a>.
                                    </p>

                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; text-align: center;">
                                        ¡Gracias por su colaboración!
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

            console.log('Correo de notificación enviado correctamente');
            res.json({ message: 'Correo de notificación enviado correctamente' });
        } catch (error) {
            console.error('Error en sendNotificationEmail:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }
}

module.exports = NotificationEmailController;