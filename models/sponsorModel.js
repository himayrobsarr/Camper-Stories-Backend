const bcrypt = require('bcrypt');
const conexion = require("../helpers/conexion");
const UserModel = require('./userModel'); // Importar UserModel para reutilizar funciones

class SponsorModel {
    static async createSponsor(sponsorData) {
        try {
            // Iniciar transacción
            await conexion.query('START TRANSACTION');

            try {
                // Reutilizar validaciones del UserModel
                await UserModel.checkExistingEmail(sponsorData.email);
                await UserModel.checkExistingDocumentNumber(sponsorData.document_number);
                await UserModel.checkDocumentType(sponsorData.document_type || 1);

                // Encriptar contraseña
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(sponsorData.password, salt);

                // Crear usuario con rol sponsor
                const query = `
                    INSERT INTO USER (
                        first_name, last_name, email, password,
                        role, document_type_id, document_number,
                        city_id, birth_date, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `;
                const params = [
                    sponsorData.first_name,
                    sponsorData.last_name,
                    sponsorData.email,
                    hashedPassword,
                    'sponsor', // Asignar rol sponsor
                    sponsorData.document_type,
                    sponsorData.document_number,
                    sponsorData.city,
                    sponsorData.birth_date
                ];

                const result = await conexion.query(query, params);

                // Confirmar transacción
                await conexion.query('COMMIT');

                // Retornar datos del sponsor creado
                return {
                    id: result.data.insertId,
                    ...sponsorData,
                    password: undefined, // No retornar la contraseña
                    role: 'sponsor'
                };
            } catch (error) {
                // Si algo falla, revertir transacción
                await conexion.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Error en createSponsor:', error);
            throw error;
        }
    }
}

module.exports = SponsorModel;
