const db = require("../helpers/conexion");
const bcrypt = require('bcrypt');


class adminModel {
    static async getAllregister() {
        const query = 'SELECT COUNT(*) AS total_registros FROM CAMPER;';
        const result = await db.query(query);
        if (!result.data || result.data.length === 0) {
            throw new Error('No se encontraron registros');
        }
        return result.data[0].total_registros;
    }

    static async getAllIncomplete() {
        const query = `SELECT c.id, c.user_id, c.title, c.history, c.about, c.main_video_url, 
                              c.full_name, c.profile_picture, c.status
                       FROM CAMPER c
                       LEFT JOIN CAMPER_PROJECT cp ON c.id = cp.camper_id
                       LEFT JOIN CAMPER_MERIT cm ON c.id = cm.user_id
                       LEFT JOIN DREAMS d ON c.id = d.camper_id
                       LEFT JOIN TRAINING_VIDEO tv ON c.id = tv.camper_id
                       WHERE (c.user_id IS NULL OR
                              c.title IS NULL OR
                              c.history IS NULL OR
                              c.about IS NULL OR
                              c.main_video_url IS NULL OR
                              c.full_name IS NULL OR
                              c.profile_picture IS NULL OR
                              c.status IS NULL)
                             AND (cp.camper_id IS NOT NULL OR
                                  cm.user_id IS NOT NULL OR
                                  d.camper_id IS NOT NULL OR
                                  tv.camper_id IS NOT NULL)
                       GROUP BY c.id, c.user_id, c.title, c.history, c.about, c.main_video_url, 
                                c.full_name, c.profile_picture, c.status;`;

        const result = await db.query(query);
        if (!result.data || result.data.length === 0) {
            throw new Error('No se encontraron registros incompletos');
        }
        return result.data; 
    }

    static async createAdmin(userData) {
        try {
            await db.query('START TRANSACTION');

            // 1. Validaciones en paralelo
            await Promise.all([
                this.checkExistingEmail(userData.email),
                this.checkExistingDocumentNumber(userData.document_number),
                this.checkDocumentType(userData.document_type)
            ]);

            // 2. Encriptar contraseña
            const hashedPassword = await this.hashPassword(userData.password);

            // 3. Insertar usuario admin
            const userId = await this.insertUser({
                ...userData,
                password: hashedPassword,
                role: 'admin'
            });

            await db.query('COMMIT');

            // 4. Retornar usuario creado sin la contraseña
            return {
                id: userId,
                ...userData,
                password: undefined,
                role: 'admin'
            };
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error en createAdmin:', error);
            throw error;
        }
    }

    /** 🔹 Valida si el email ya existe */
    static async checkExistingEmail(email) {
        const query = 'SELECT 1 FROM USER WHERE email = ?';
        const result = await db.query(query, [email]);
        if (result.data.length > 0) {
            throw new Error('El email ya está en uso');
        }
    }

    /** 🔹 Valida si el número de documento ya existe */
    static async checkExistingDocumentNumber(documentNumber) {
        const query = 'SELECT 1 FROM USER WHERE document_number = ?';
        const result = await db.query(query, [documentNumber]);
        if (result.data.length > 0) {
            throw new Error('El número de documento ya está en uso');
        }
    }

    /** 🔹 Verifica si el tipo de documento existe */
    static async checkDocumentType(documentType) {
        const query = 'SELECT 1 FROM DOCUMENT_TYPE WHERE id = ?';
        const result = await db.query(query, [documentType]);
        if (!result.data.length) {
            throw new Error('Tipo de documento no encontrado');
        }
    }

    /** 🔹 Encripta la contraseña */
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    /** 🔹 Inserta un usuario en la base de datos */
    static async insertUser(userData) {
        const query = `
            INSERT INTO USER (
                first_name, last_name, email, password, 
                role, document_type_id, document_number, 
                city_id, birth_date, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const params = [
            userData.first_name,
            userData.last_name,
            userData.email,
            userData.password,
            userData.role,
            userData.document_type,
            userData.document_number,
            userData.city,
            userData.birth_date
        ];

        const result = await db.query(query, params);
        return result.data.insertId;
    }
}

module.exports = adminModel;
