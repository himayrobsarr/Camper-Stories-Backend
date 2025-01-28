const bcrypt = require('bcrypt');
const db = require("../helpers/conexion");
const UserModel = require('./userModel'); // Importar UserModel para reutilizar funciones


class SponsorModel {

        static async getAllSponsors() {
            const query = `
                SELECT 
                    s.id AS user_id,
                    s.first_name,
                    s.last_name,
                    s.email,
                    dt.name AS document_type,
                    s.document_number,
                    c.name AS city,
                    s.birth_date 
                FROM USER s
                LEFT JOIN DOCUMENT_TYPE dt ON s.document_type_id = dt.id
                LEFT JOIN CITY c ON s.city_id = c.id
                WHERE s.role = 'sponsor'
            `;
        
            try {
                const result = await db.query(query); // Ejecuta la consulta y obtiene el resultado
                console.log('Resultado de la consulta:', result); // Log de lo que devuelve la consulta
        
                // Accedemos a la propiedad `data` que contiene el array de filas
                const rows = result.data;
    
                if (!Array.isArray(rows)) {
                    throw new Error('Se esperaba un array de resultados dentro de `data`');
                }
        
                return rows; // Retorna las filas
            } catch (error) {
                console.error('Error en getAllSponsors:', error.message);
                throw new Error(`Error en la consulta de sponsors: ${error.message}`);
            }
        }

    
      
    

    static async createSponsor(sponsorData) {
        try {
            const query = `INSERT INTO USER (first_name, last_name, email, password, document_type, document_number, city, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                sponsorData.first_name,
                sponsorData.last_name,
                sponsorData.email,
                sponsorData.password,
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
            console.error('Error en createSponsor:', error);
            throw error;
        }
    };

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
}

module.exports = SponsorModel;
