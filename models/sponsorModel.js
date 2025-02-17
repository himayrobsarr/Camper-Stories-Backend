const bcrypt = require('bcrypt');
const db = require("../helpers/conexion");
const UserModel = require('./userModel'); // Importar UserModel para reutilizar funciones
const PasswordResetController = require('../controllers/passwordResetController');


class SponsorModel {

    static async getAllSponsors() {
        const query = `
                SELECT 
                    s.id,
                    s.user_id,
                    s.image_url,
                    s.plan_id,
                    s.status,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.document_type_id,
                    dt.name AS document_type,
                    u.document_number,
                    u.city_id,
                    c.name AS city_name,
                    u.birth_date,
                    p.main_price as plan_price
                FROM SPONSOR s
                INNER JOIN USER u ON s.user_id = u.id
                LEFT JOIN DOCUMENT_TYPE dt ON u.document_type_id = dt.id
                LEFT JOIN CITY c ON u.city_id = c.id
                LEFT JOIN PLAN p ON s.plan_id = p.id
            `;

        try {
            const result = await db.query(query);
            const rows = result.data;

            if (!Array.isArray(rows)) {
                throw new Error('Se esperaba un array de resultados dentro de `data`');
            }

            return rows;
        } catch (error) {
            console.error('Error en getAllSponsors:', error.message);
            throw new Error(`Error en la consulta de sponsors: ${error.message}`);
        }
    }


    static async createSponsor(sponsorData) {
        try {
            const query = `
                INSERT INTO USER (
                    first_name, last_name, email, password,
                    document_type_id, document_number, city_id,
                    birth_date, role_id, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2, NULL)
            `;

            const params = [
                sponsorData.first_name,
                sponsorData.last_name,
                sponsorData.email,
                sponsorData.password,
                sponsorData.document_type_id,
                sponsorData.document_number,
                sponsorData.city_id,
                sponsorData.birth_date
            ];

            const userResult = await db.query(query, params);
            const userId = userResult.data.insertId;

            // Crear el registro en la tabla SPONSOR con el plan PIONEER (id = 4)
            const sponsorQuery = `
                INSERT INTO SPONSOR (
                    user_id, 
                    image_url, 
                    plan_id,
                    status
                ) VALUES (?, ?, 4, 'activo')
            `;

            await db.query(sponsorQuery, [
                userId,
                sponsorData.image_url || null
            ]);

            return {
                id: userId,
                ...sponsorData,
                plan_id: 4,
                status: 'activo',
                role_id: 2,
                password: undefined
            };
        } catch (error) {
            console.error('Error en createSponsor:', error);
            throw error;
        }
    }

    static async updateUser(user_id, userData, requestingUserId, userRole) {
        try {
            // Validar si el usuario que hace la solicitud tiene permisos para actualizar este usuario
            if (requestingUserId !== user_id && userRole !== 'admin') {
                throw new Error('No tienes permisos para actualizar este usuario');
            }

            // Preparar los campos a actualizar
            const updates = {};
            if (userData.first_name !== undefined) updates.first_name = userData.first_name;
            if (userData.last_name !== undefined) updates.last_name = userData.last_name;
            if (userData.email !== undefined) updates.email = userData.email;
            if (userData.password !== undefined) {
                // Hashear la nueva contraseña antes de guardarla
                const salt = await bcrypt.genSalt(10);
                updates.password = await bcrypt.hash(userData.password, salt);
            }
            if (userData.image_url !== undefined) updates.image_url = userData.image_url;
            if (userData.document_type_id !== undefined) updates.document_type_id = userData.document_type_id;
            if (userData.document_number !== undefined) updates.document_number = userData.document_number;
            if (userData.city_id !== undefined) updates.city_id = userData.city_id;
            if (userData.birth_date !== undefined) updates.birth_date = userData.birth_date;

            // Actualizar el usuario en la base de datos
            const query = "UPDATE USER SET ? WHERE id = ?";
            const result = await db.query(query, [updates, user_id]);

            if (result.affectedRows === 0) {
                throw new Error('Usuario no encontrado o no actualizado');
            }

            // Recuperar los datos actualizados del usuario
            const getUserQuery = `
                SELECT id, first_name, last_name, email, image_url, document_type_id, document_number, city_id, birth_date
                FROM USER
                WHERE id = ?
            `;
            const userResult = await db.query(getUserQuery, [user_id]);
            const updatedUser = userResult.data[0];

            return {
                message: 'Usuario actualizado exitosamente',
                data: updatedUser
            };
        } catch (error) {
            console.error('Error en updateUser:', error);
            throw error;
        }
    }

    static async getSponsorById(id) {
        const query = `
            SELECT 
                s.id,
                s.user_id,
                s.image_url,
                s.plan_id,
                s.status,
                u.first_name,
                u.last_name,
                u.email,
                u.document_type_id,
                dt.name AS document_type,
                u.document_number,
                u.city_id,
                c.name AS city_name,
                u.birth_date,
                p.main_price as plan_price
            FROM SPONSOR s
            INNER JOIN USER u ON s.user_id = u.id
            LEFT JOIN DOCUMENT_TYPE dt ON u.document_type_id = dt.id
            LEFT JOIN CITY c ON u.city_id = c.id
            LEFT JOIN PLAN p ON s.plan_id = p.id
            WHERE s.id = ?
        `;

        try {
            const result = await db.query(query, [id]);
            const rows = result.data;

            if (!Array.isArray(rows) || rows.length === 0) {
                return null;
            }

            return rows[0];
        } catch (error) {
            console.error('Error en getSponsorById:', error.message);
            throw new Error(`Error en la consulta del sponsor: ${error.message}`);
        }
    }

    static async deleteSponsor(id) {
        const query = `DELETE FROM USER WHERE id = ? AND role = 'sponsor'`;

        try {
            const result = await db.query(query, [id]); // Ejecuta la consulta para eliminar el sponsor

            if (result.affectedRows === 0) {
                throw new Error('Sponsor no encontrado o no se pudo eliminar');
            }

            return { message: 'Sponsor eliminado exitosamente' }; // Mensaje de éxito
        } catch (error) {
            console.error('Error en deleteSponsor:', error.message);
            throw new Error(`Error al eliminar el sponsor: ${error.message}`);
        }
    }

    static async finalizeDonationAndGeneratePassword(sponsorData) {
        try {
            // Usar el número de documento como contraseña
            const standardPassword = sponsorData.document_number; // Contraseña por defecto
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(standardPassword, salt);

            // Crear el sponsor con la contraseña generada
            const query = `INSERT INTO USER (first_name, last_name, email, password, document_type, document_number, city, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                sponsorData.first_name,
                sponsorData.last_name,
                sponsorData.email,
                hashedPassword, // Usar la contraseña hasheada
                sponsorData.document_type,
                sponsorData.document_number,
                sponsorData.city,
                sponsorData.birth_date
            ];
            const result = await db.query(query, params);
            return {
                id: result.insertId,
                ...sponsorData,
                password: undefined // No devolver la contraseña
            };
        } catch (error) {
            console.error('Error en finalizeDonationAndGeneratePassword:', error);
            throw error;
        }
    }

    static async createSponsorWithRelations(sponsorData) {
        try {
            await db.query('START TRANSACTION');

            try {
                // 1. Verificar email duplicado
                await UserModel.checkExistingEmail(sponsorData.email);

                // 2. Verificar número de documento duplicado
                await UserModel.checkExistingDocumentNumber(sponsorData.document_number);

                // 3. Verificar que existe el tipo de documento
                await UserModel.checkDocumentType(sponsorData.document_type_id);

                // 4. Generar contraseña por defecto usando el número de documento
                const defaultPassword = sponsorData.document_number;
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(defaultPassword, salt);

                // 5. Crear usuario con role_id = 2 (sponsor)
                const userQuery = `
                    INSERT INTO USER (
                        first_name, last_name, email, password,
                        role_id, document_type_id, document_number,
                        city_id, birth_date, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `;

                const userParams = [
                    sponsorData.first_name,
                    sponsorData.last_name,
                    sponsorData.email,
                    hashedPassword,
                    2,  // role_id para sponsor
                    sponsorData.document_type_id,
                    sponsorData.document_number,
                    sponsorData.city_id,
                    sponsorData.birth_date
                ];

                const userResult = await db.query(userQuery, userParams);
                const userId = userResult.data.insertId;

                // 6. Crear registro de sponsor
                const sponsorQuery = `
                    INSERT INTO SPONSOR (
                        user_id,
                        plan_id,
                        status
                    ) VALUES (?, ?, ?)
                `;

                const sponsorParams = [
                    userId,
                    sponsorData.plan_id,
                    'activo'  // cambiado a 'activo' ya que el pago está aprobado
                ];

                await db.query(sponsorQuery, sponsorParams);

                // Confirmar transacción
                await db.query('COMMIT');

                // 7. Enviar email con las credenciales
                try {
                    await PasswordResetController.sendWelcomeEmail({
                        email: sponsorData.email,
                        first_name: sponsorData.first_name,
                        document_number: sponsorData.document_number
                    });
                } catch (emailError) {
                    console.error('Error al enviar email de bienvenida:', emailError);
                    // No revertimos la transacción por error en el email
                }

                // 8. Retornar sponsor creado
                return {
                    id: userId,
                    ...sponsorData,
                    password: undefined,
                    role_id: 2,
                    status: 'activo'
                };

            } catch (error) {
                await db.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Error en createSponsorWithRelations:', error);
            throw error;
        }
    }

    static async create(sponsorData) {
        const query = `
            INSERT INTO SPONSOR (
                user_id,
                image_url,
                plan_id,
                status
            ) VALUES (?, ?, ?, 'activo')
        `;

        return await db.query(query, [
            sponsorData.user_id,
            sponsorData.image_url || null,
            sponsorData.plan_id || null,
            // Status por defecto es 'activo' según la estructura de la tabla
        ]);
    }

    static async updateStatus(userId, status) {
        if (!['activo', 'inactivo'].includes(status)) {
            throw new Error('Estado no válido');
        }

        const query = `
            UPDATE SPONSOR 
            SET status = ?
            WHERE user_id = ?
        `;

        return await db.query(query, [status, userId]);
    }

    static async updatePlan(userId, planId) {
        const query = `
            UPDATE SPONSOR 
            SET plan_id = ?
            WHERE user_id = ?
        `;

        return await db.query(query, [planId, userId]);
    }

    static async findByUserId(userId) {
        const query = `
            SELECT s.*, u.email, u.first_name, u.last_name, p.main_price
            FROM SPONSOR s
            JOIN USER u ON s.user_id = u.id
            LEFT JOIN PLAN p ON s.plan_id = p.id
            WHERE s.user_id = ?
        `;

        const result = await db.query(query, [userId]);
        return result.data[0];
    }

    static async updateImage(userId, imageUrl) {
        const query = `
            UPDATE SPONSOR 
            SET image_url = ?
            WHERE user_id = ?
        `;

        return await db.query(query, [imageUrl, userId]);
    }

    static async getAllActive() {
        const query = `
            SELECT s.*, u.email, u.first_name, u.last_name, p.main_price
            FROM SPONSOR s
            JOIN USER u ON s.user_id = u.id
            LEFT JOIN PLAN p ON s.plan_id = p.id
            WHERE s.status = 'activo'
        `;

        const result = await db.query(query);
        return result.data;
    }

    static async getSponsorWithBenefits(sponsorId) {
        const query = `
            SELECT 
                s.*,
                u.email,
                u.first_name,
                u.last_name,
                p.main_price,
                b.id AS benefit_id,
                b.description AS benefit_description
            FROM SPONSOR s
            JOIN USER u ON s.user_id = u.id
            LEFT JOIN PLAN p ON s.plan_id = p.id
            LEFT JOIN PLAN_HAS_BENEFIT phb ON p.id = phb.plan_id
            LEFT JOIN BENEFIT b ON phb.benefit_id = b.id
            WHERE s.id = ?
        `;

        try {
            const result = await db.query(query, [sponsorId]);
            const rows = result.data;

            if (!rows || rows.length === 0) {
                return null;
            }

            // Reorganizar los resultados para agrupar los beneficios
            const sponsor = {
                ...rows[0],
                benefits: rows.map(row => ({
                    id: row.benefit_id,
                    description: row.benefit_description
                }))
            };

            // Eliminar las propiedades redundantes
            delete sponsor.benefit_id;
            delete sponsor.benefit_description;

            return sponsor;
        } catch (error) {
            console.error('Error en getSponsorWithBenefits:', error.message);
            throw new Error(`Error al obtener sponsor con beneficios: ${error.message}`);
        }
    }
}

module.exports = SponsorModel;
