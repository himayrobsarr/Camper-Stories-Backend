const db = require("../helpers/conexion"); // Importa la conexión a MySQL
const { uploadToS3 } = require('../models/uploadModel');

const DreamModel = {
    // Obtener todos los sueños (público)
    getAllDreams: async () => {
        const query = "SELECT * FROM DREAMS";
        return db.query(query);
    },

    // Obtener un sueño por ID (público)
    getDreamById: async (id) => {
        const query = "SELECT * FROM DREAMS WHERE id = ?";
        return db.query(query, [id]);
    },

    createDream: async ({ title, description, image_url, camper_id }, requestingUserId, userRole) => {
         /* console.log('Iniciando createDream con datos:', {
            title,
            description,
            imageUrlProvided: !!image_url,
            camper_id,
            requestingUserId,
            userRole
        });
        */

        // Validación de permisos
        // if (userRole !== 'admin' && requestingUserId !== camper_id) {
        //      // console.log('Validación de permisos fallida:', {
        //         userRole,
        //         requestingUserId,
        //         camper_id
        //     });
        //     throw new Error('No tienes permiso para crear un sueño para otro usuario');
        // }
    
        let uploadedImageUrl = null;
    
        // Subir la imagen a S3 si se proporciona
        if (image_url) {
             // console.log('Intentando subir imagen a S3...');
            try {
                uploadedImageUrl = await uploadToS3(image_url, "sueño", camper_id);
                 // console.log('Imagen subida exitosamente:', uploadedImageUrl);
            } catch (error) {
                console.error('Error al subir imagen a S3:', error);
                throw new Error(`Error al subir la imagen: ${error.message}`);
            }
        }
    
        // Insertar el sueño en la base de datos
        const query = `
            INSERT INTO DREAMS (title, description, image_url, camper_id)
            VALUES (?, ?, ?, ?)
        `;
    
        const result = await db.query(query, [title, description, uploadedImageUrl, camper_id]);
         // console.log("result:", result.data.insertId)
    
        if (result.affectedRows === 0) {
            throw new Error('No se pudo crear el sueño');
        }
    
        // Devolver el sueño creado
        const createdDreamQuery = `
            SELECT id, title, description, image_url, camper_id
            FROM DREAMS
            WHERE id = ?
        `;
        const createdDreamResult = await db.query(createdDreamQuery, [result.data.insertId]);
    
        return {
            createdDream: createdDreamResult.data[0],
        };
    },  

// Actualizar un sueño existente (solo el dueño del perfil o admin)
updateDream: async (id, dreamData, dreamFiles, requestingUserId, userRole) => {
    // Obtener el user_id del sueño a actualizar
    const dream = await db.query("SELECT camper_id, image_url FROM DREAMS WHERE id = ?", [id]);
    
    if (!dream.data.length) {
        throw new Error('Sueño no encontrado');
    }
     // console.log("el dream en la db:",dream)

     // console.log("el nuevo dream:",dreamData)

     // console.log("dream files : ", dreamFiles)

    let image_url =dreamFiles.image_url
    let uploadedImageUrl = null;
    
        // Subir la imagen a S3 si se proporciona
        if (image_url) {
             // console.log('Intentando subir imagen a S3...');
            try {
                uploadedImageUrl = await uploadToS3(image_url, "sueño", id);
                 // console.log('Imagen subida exitosamente:', uploadedImageUrl);
            } catch (error) {
                console.error('Error al subir imagen a S3:', error);
                throw new Error(`Error al subir la imagen: ${error.message}`);
            }
        }
    dreamData.image_url = uploadedImageUrl
    const dreamUserId = dream.data[0].camper_id;
    // Verificar permisos
     // console.log("tu rol : ", userRole)
    if (userRole !== 'admin' && requestingUserId !== dreamUserId) {
        throw new Error('No tienes permiso para actualizar este sueño');
    }

    const query = "UPDATE DREAMS SET ? WHERE id = ?";
    const result = await db.query(query, [dreamData, id]);

    if (result.affectedRows === 0) {
        throw new Error('Sueño no encontrado o no actualizado');
    }

    return result;
},


    // Eliminar un sueño (solo admin o dueño del perfil)
    deleteDream: async (id, requestingUserId, userRole) => {
        // Obtener el user_id del sueño
        const dream = await db.query("SELECT user_id FROM DREAMS WHERE id = ?", [id]);
        
        if (!dream.data.length) {
            throw new Error('Sueño no encontrado');
        }
    
        // Verificar permisos
        if (userRole !== 'admin' && dream.data[0].user_id !== requestingUserId) {
            throw new Error('No tienes permiso para eliminar este sueño');
        }
    
        const query = "DELETE FROM DREAMS WHERE id = ?";
        return db.query(query, [id]);
    }, 
    
};

module.exports = DreamModel;
