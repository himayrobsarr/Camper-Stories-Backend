// models/user.model.js
const bcrypt = require('bcrypt');
const conexion = require('../helpers/conexion');

class UserModel {

    static async createDocument(documentNumber, documentTypeId = 1) {
        console.log('createDocument:', { documentNumber, documentTypeId });
        const query = 'INSERT INTO DOCUMENT_NUMBER (document_number, document_type_id) VALUES (?, ?)';
        const result = await conexion.query(query, [documentNumber, documentTypeId]);
        return result.data.insertId;
    }

    static async getExistingDocument(documentNumber, documentTypeId = 1) {
        console.log('getExistingDocument:', { documentNumber, documentTypeId });
        const query = 'SELECT id FROM DOCUMENT_NUMBER WHERE document_number = ? AND document_type_id = ?';
        const result = await conexion.query(query, [documentNumber, documentTypeId]);
        return result.data[0]?.id;
    }



    static async findOrCreateDocument(documentNumber, documentTypeId = 1) {
        console.log('findOrCreateDocument:', { documentNumber, documentTypeId });
        try {
            let documentId = await this.getExistingDocument(documentNumber, documentTypeId);
            
            if (!documentId) {
                documentId = await this.createDocument(documentNumber, documentTypeId);
            }
            
            return documentId;
        } catch (error) {
            throw new Error(`Error con el documento: ${error.message}`);
        }
    }

    static async findOrCreateCity(cityName) {
        console.log('findOrCreateCity:', { cityName });
        try {
            let query = 'SELECT id FROM CITY WHERE name = ?';
            let result = await conexion.query(query, [cityName]);
            
            if (result.data[0]) {
                return result.data[0].id;
            }

            query = 'INSERT INTO CITY (name) VALUES (?)';
            result = await conexion.query(query, [cityName]);
            return result.data.insertId;
        } catch (error) {
            throw new Error(`Error con la ciudad: ${error.message}`);
        }
    }

    static async checkExistingEmail(email) {
        console.log('checkExistingEmail:', { email });
        const query = 'SELECT id FROM USER WHERE email = ?';
        const result = await conexion.query(query, [email]);
        if (result.data[0]) {
            throw new Error('El email ya está registrado');
        }
    }

    static async createWithRelations(userData) {
        console.log('createWithRelations:', userData);
        try {
            // 1. Verificar email duplicado
            await this.checkExistingEmail(userData.email);

            // 2. Crear registro en AGE
            const ageQuery = 'INSERT INTO AGE (birth_date) VALUES (?)';
            const ageResult = await conexion.query(ageQuery, [userData.birth_date]);
            const ageId = ageResult.data.insertId;

            // 3. Obtener o crear DOCUMENT_NUMBER
            const documentNumberId = await this.findOrCreateDocument(userData.document_number);
          console.log(documentNumberId + "HOLI")
            // 4. Obtener o crear CITY
            const cityId = await this.findOrCreateCity(userData.city);

            // 5. Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // 6. Crear usuario
            const userQuery = `
                INSERT INTO USER 
                (first_name, last_name, email, password, 
                city_id, age_id, role)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const userParams = [
                userData.first_name,
                userData.last_name,
                userData.email,
                hashedPassword,
                cityId,
                ageId,
                'camper'
            ];

            const userResult = await conexion.query(userQuery, userParams);

            // 7. Retornar usuario creado
            return {
                id: userResult.data.insertId,
                ...userData,
                password: undefined,
                role: 'camper'
            };
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        console.log('findByEmail:', { email });
        try {
            const query = `
                SELECT U.*, 
                       A.birth_date,
                       DN.document_number,
                       C.name as city_name
                FROM USER U 
                LEFT JOIN AGE A ON U.age_id = A.id
                LEFT JOIN DOCUMENT_NUMBER DN ON U.document_number_id = DN.id
                LEFT JOIN CITY C ON U.city_id = C.id
                WHERE U.email = ?
            `;
            const result = await conexion.query(query, [email]);
            return result.data[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        console.log('findById:', { id });
        try {
            const query = `
                SELECT U.*,
                       A.birth_date,
                       DN.document_number,
                       C.name as city_name
                FROM USER U
                LEFT JOIN AGE A ON U.age_id = A.id
                LEFT JOIN DOCUMENT_NUMBER DN ON U.document_number_id = DN.id
                LEFT JOIN CITY C ON U.city_id = C.id
                WHERE U.id = ?
            `;
            const result = await conexion.query(query, [id]);
            if (result.data[0]) {
                delete result.data[0].password;
            }
            return result.data[0];
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        console.log('findAll');
        try {
            const query = `
                SELECT U.id, U.first_name, U.last_name, U.email, U.role,
                       A.birth_date,
                       DN.document_number,
                       C.name as city_name
                FROM USER U
                LEFT JOIN AGE A ON U.age_id = A.id
                LEFT JOIN DOCUMENT_NUMBER DN ON U.document_number_id = DN.id
                LEFT JOIN CITY C ON U.city_id = C.id
            `;
            const result = await conexion.query(query);
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    static async validatePassword(user, password) {
        console.log('validatePassword:', { userId: user.id });
        return await bcrypt.compare(password, user.password);
    }
}

module.exports = UserModel;