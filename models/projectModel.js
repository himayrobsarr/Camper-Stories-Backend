const db = require("../helpers/conexion"); // Importa la conexión a MySQL

const CamperProjectModel = {
    // Obtener todos los proyectos de un camper por camper_id
    getProjectsByCamperId: async (camperid) => {
        const query = `
            SELECT m.*
            FROM CAMPER_PROJECT cm
            JOIN PROJECT m ON cm.project_id = m.id
            WHERE cm.camper_id = ?`;
        return db.query(query, [camperid]);
    },
    
    addProjectForCamper: async (projectData, requestingUserId) => {
        const { title, description, image, code_url } = projectData;
    
        // Validaciones
        if (!title || typeof title !== 'string' || title.trim() === '') {
            throw new Error('El título es obligatorio y debe ser una cadena no vacía');
        }
        if (!description || typeof description !== 'string' || description.trim() === '') {
            throw new Error('La descripción es obligatoria y debe ser una cadena no vacía');
        }
        if (code_url && !/^https?:\/\//.test(code_url)) {
            throw new Error('La URL del código debe ser un enlace válido');
        }
    
        const camperQuery = 
            `SELECT id AS camper_id FROM CAMPER WHERE user_id = ? LIMIT 1`;
        ;
        
        // Ejecuta la consulta para obtener el camper_id
        const camperResult = await db.query(camperQuery, [requestingUserId]);
    
        // Accedemos al camper_id
        const camper_id = camperResult && camperResult.data && camperResult.data[0] ? camperResult.data[0].camper_id : undefined;
    
        if (!camper_id) {
            throw new Error("No se pudo obtener el ID del camper");
        }
    
        const projectQuery = 
            `INSERT INTO PROJECT (title, description, image, code_url, created_at)
            VALUES (?, ?, ?, ?, NOW());`
        ;
        const projectResult = await db.query(projectQuery, [title, description, image, code_url]);
    
        // Accedemos a insertId desde projectResult
        const project_id = projectResult && projectResult.data && projectResult.data.insertId ? projectResult.data.insertId : undefined;
    
        if (!project_id) {
            throw new Error("No se pudo obtener el ID del proyecto.");
        }
        
        const camperProjectQuery = 
        `INSERT INTO CAMPER_PROJECT (camper_id, project_id)
            VALUES (?, ?);`
        ;
        const camperProjectResult = await db.query(camperProjectQuery, [camper_id, project_id]);
    
        return { project_id, title, description, image, code_url };
    },

     // Actualizar un proyecto de un camper
     updateProjectForCamper: async (projectData, requestingUserId, project_id) => {
        const { title, description, image, code_url } = projectData;

        // Realiza las validaciones si es necesario
        if (!title || typeof title !== 'string' || title.trim() === '') {
            throw new Error('El título es obligatorio y debe ser una cadena no vacía');
        }
        if (!description || typeof description !== 'string' || description.trim() === '') {
            throw new Error('La descripción es obligatoria y debe ser una cadena no vacía');
        }
        if (code_url && !/^https?:\/\//.test(code_url)) {
            throw new Error('La URL del código debe ser un enlace válido');
        }

        // Realiza la consulta para actualizar el proyecto
        const projectQuery = `
            UPDATE PROJECT
            SET title = ?, description = ?, image = ?, code_url = ?
            WHERE id = ?;  
        `;
        
        const result = await db.query(projectQuery, [title, description, image, code_url, project_id]);

        // Retorna el resultado si la actualización fue exitosa
        if (result && result.data.affectedRows > 0) {
            return { id: project_id, title, description, image, code_url }; // Retorna los datos del proyecto actualizado
        } else {
            return null; // Si no se actualizó ningún proyecto
        }
    }
    
};

module.exports = CamperProjectModel;
