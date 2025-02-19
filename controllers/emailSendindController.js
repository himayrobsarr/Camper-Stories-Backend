const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (email, username) => {
    try {
        // Configuración para envío de correo
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const courseInfoLink = `https://campuslands.vercel.app`;
        const contactEmail = "miguel@fundacioncampuslands.com";
        const contactPhone = "+57 301 246 3004";

        // Enviar correo de bienvenida
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🎓 Confirmación de Inscripción - Curso de Inteligencia Artificial Campuslands',
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
                                        ¡Bienvenido/a al Curso de Inteligencia Artificial: De Cero a Experto! 🎓
                                    </h1>
                                    
                                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                                        Estimado/a ${username},
                                    </p>
                                    
                                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                                        Nos complace darte la bienvenida a nuestro <b>Curso de Inteligencia Artificial</b>. Has tomado una decisión importante al unirte a este programa, y estamos aquí para acompañarte en cada paso de tu aprendizaje en el mundo de la inteligencia artificial.
                                    </p>

                                    <h2 style="color: #007bff; font-size: 18px; text-align: center;">Detalles del Curso:</h2>
                                    <ul style="color: #666666; font-size: 16px; line-height: 1.5; padding-left: 20px;">
                                        <li>📆 <b>Fecha y Hora:</b> 22 de febrero de 2025, de 8:00 a.m. a 12:00-01:00 p.m.</li>
                                        <li>⏱️ <b>Duración:</b> 4 horas de formación intensiva y práctica</li>
                                        <li>📍 <b>Modalidad:</b> Presencial en nuestras instalaciones.</li>
                                        <li>📄 <b>Importante:</b> Traer un documento de identificación en físico (cédula, pasaporte, o licencia).</li>
                                    </ul>

                                    <h2 style="color: #007bff; font-size: 18px; text-align: center;">Ubicación para la modalidad presencial:</h2>
                                    <p style="color: #666666; font-size: 16px; line-height: 1.5; text-align: center;">
                                        Campuslands <br>
                                        Floridablanca, Santander
                                        Anillo Vial Floridablanca - Girón Km 3.9 <br>
                                        Zona Franca Santander <br>
                                        Edificio Zenith, Piso 6
                                    </p>

                                    <h2 style="color: #007bff; font-size: 18px; text-align: center;">Beneficios exclusivos de este curso:</h2>
                                    <ul style="color: #666666; font-size: 16px; line-height: 1.5; padding-left: 20px;">
                                        <li>✅ <b>Certificación oficial:</b> Obtendrás un reconocimiento respaldado por Campuslands al finalizar el curso.</li>
                                        <li>✅ <b>Acceso a nuestra comunidad privada de alumnos:</b> Únete a una red exclusiva para intercambiar conocimientos y establecer conexiones valiosas.</li>
                                        <li>✅ <b>Aprendizaje práctico y dinámico:</b> Desde los fundamentos hasta aplicaciones avanzadas, con casos reales de uso de herramientas de IA.</li>
                                        <li>✅ <b>Material de apoyo:</b> Recursos descargables y guías que te serán útiles incluso después del curso.</li>
                                    </ul>

                                    <table role="presentation" style="width: 100%; margin: 30px 0;">
                                        <tr>
                                            <td style="text-align: center;">
                                                <a href="${courseInfoLink}" 
                                                   style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                                    Más Información
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <h2 style="color: #007bff; font-size: 18px; text-align: center;">Información adicional:</h2>
                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; text-align: center;">
                                        Para más detalles, visita nuestra página oficial: <a href="${courseInfoLink}" style="color: #007bff;">Cursos Campuslands</a>
                                    </p>
                                    
                                    <h2 style="color: #007bff; font-size: 18px; text-align: center;">Contacto:</h2>
                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; text-align: center;">
                                        ✉️ <b>Correo electrónico:</b> <a href="mailto:${contactEmail}" style="color: #007bff;">${contactEmail}</a><br>
                                        📞 <b>Número de contacto:</b> <a href="tel:${contactPhone}" style="color: #007bff;">${contactPhone}</a>
                                    </p>

                                    <p style="color: #666666; font-size: 14px; line-height: 1.5; text-align: center;">
                                        ¡Esperamos verte en clase y acompañarte en este emocionante viaje hacia la Excelencia en inteligencia artificial!
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
                                        &copy; Campus ${new Date().getFullYear()}. Todos los derechos reservados.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `
        });

        console.log('Correo de confirmación enviado correctamente');
        return { success: true, message: 'Correo de confirmación enviado correctamente' };
    } catch (error) {
        console.error('Error en sendWelcomeEmail:', error);
        return { success: false, message: 'Error al enviar el correo', error: error.message };
    }
};

const sendNotificationEmail = async ({ email, username, phone, documentNumber, documentType, paymentMethod, amount, contactEmail }) => {
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
                                    <li>📄 <b>Número de documento:</b> ${documentType}: ${documentNumber}</li>
                                    <li>📚 <b>Curso inscrito:</b> ${courseName}</li>
                                    <li>💳 <b>Método de pago:</b> ${paymentMethod} - <b>Valor:</b> ${amount} </li>
                                </ul>

                                <h2 style="color: #007bff; font-size: 18px; text-align: center;">Acción requerida:</h2>
                                <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: center;">
                                    Por favor, generar el acceso correspondiente para este participante.
                                </p>

                                <h2 style="color: #007bff; font-size: 18px; text-align: center;">Contacto:</h2>
                                <p style="color: #666666; font-size: 14px; line-height: 1.5; text-align: center;">
                                    Si necesitan más información, pueden contactarme directamente en: <a href="mailto:${contactEmail}" style="color: #007bff;">${contactEmail}</a>.
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
                                    &copy; Campus ${new Date().getFullYear()}. Todos los derechos reservados.
                                </p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        });

        console.log('Correo de notificación enviado correctamente');
        return { success: true, message: 'Correo de notificación enviado correctamente' };
    } catch (error) {
        console.error('Error en sendNotificationEmail:', error);
        return { success: false, message: 'Error al enviar el correo', error: error.message };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendNotificationEmail
};

