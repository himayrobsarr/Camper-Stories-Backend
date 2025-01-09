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
    
    
    addProjectForCamper: async (projectData) => {
        const { title, description, image, code_url, camper_id } = projectData;

        // Insertar el proyecto
        const projectQuery = `
            INSERT INTO PROJECT (title, description, image, code_url, created_at)
            VALUES (?, ?, ?, ?, NOW());
        `;
        const projectResult = await db.query(projectQuery, [title, description, image, code_url]);
        const project_id = projectResult?.data?.insertId;

        if (!project_id) {
            throw new Error("Error al insertar el proyecto");
        }

        // Vincular el proyecto al camper
        const camperProjectQuery = `
            INSERT INTO CAMPER_PROJECT (camper_id, project_id)
            VALUES (?, ?);
        `;
        await db.query(camperProjectQuery, [camper_id, project_id]);

        // Devolver los datos del proyecto
        return { project_id, title, description, image, code_url };
    },

    updateProjectForCamper: async (project_id, projectData, camper_id) => {
        const { title, description, image, code_url } = projectData;
    
        // Construir el objeto con los campos a actualizar
        const fieldsToUpdate = {};
        if (title) fieldsToUpdate.title = title;
        if (description) fieldsToUpdate.description = description;
        if (image) fieldsToUpdate.image = image;
        if (code_url) fieldsToUpdate.code_url = code_url;
    
        if (Object.keys(fieldsToUpdate).length === 0) {
            throw new Error('No hay datos nuevos para actualizar');
        }
    
        // Actualizar el proyecto
        const updateQuery = `
            UPDATE PROJECT
            SET ?
            WHERE id = ?
        `;
        const updateResult = await db.query(updateQuery, [fieldsToUpdate, project_id]);
    
        if (updateResult.affectedRows === 0) {
            throw new Error('El proyecto no se pudo actualizar');
        }
    
        return { project_id, ...fieldsToUpdate };
    }
    

    
    
};

module.exports = CamperProjectModel;
