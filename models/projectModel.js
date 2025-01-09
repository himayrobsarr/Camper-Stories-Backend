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
    
    

    // Agregar un nuevo proyecto para un camper
    addProjectForCamper: async (camper_id, projectData, requestingUserId) => {
        const { title, description, image, code_url } = projectData;

        // Validaciones de entrada
        if (!title || typeof title !== 'string' || title.trim() === '') {
            throw new Error('El título es obligatorio y debe ser una cadena no vacía');
        }
        if (!description || typeof description !== 'string' || description.trim() === '') {
            throw new Error('La descripción es obligatoria y debe ser una cadena no vacía');
        }
        if (code_url && !/^https?:\/\//.test(code_url)) {
            throw new Error('La URL del código debe ser un enlace válido');
        }

        // Verificar que el usuario logueado tiene acceso al camper
        const camperQuery = `
            SELECT user_id FROM CAMPER WHERE camper_id = ? LIMIT 1
        `;
        const [camper] = await db.query(camperQuery, [camper_id]);

        if (!camper || camper.user_id !== requestingUserId) {
            throw new Error('No tienes permiso para agregar proyectos a este camper');
        }

        // Insertar el nuevo proyecto en la tabla PROJECT
        const projectQuery = `
            INSERT INTO PROJECT (title, description, image, code_url, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const projectResult = await db.query(projectQuery, [title, description, image, code_url]);

        const project_id = projectResult.insertId;

        // Asociar el proyecto al camper en la tabla CAMPER_PROJECT
        const camperProjectQuery = `
            INSERT INTO CAMPER_PROJECT (camper_id, project_id)
            VALUES (?, ?)
        `;
        await db.query(camperProjectQuery, [camper_id, project_id]);

        return { project_id, title, description, image, code_url };
    },

    // Actualizar un proyecto existente (solo si el proyecto pertenece al camper)
    updateProjectForCamper: async (camper_id, project_id, projectData) => {
        const { title, description, image, code_url } = projectData;

        // Validaciones
        if (title && (typeof title !== 'string' || title.trim() === '')) {
            throw new Error('El título debe ser una cadena no vacía');
        }
        if (description && (typeof description !== 'string' || description.trim() === '')) {
            throw new Error('La descripción debe ser una cadena no vacía');
        }
        if (code_url && !/^https?:\/\//.test(code_url)) {
            throw new Error('La URL del código debe ser un enlace válido');
        }

        // Verificar que el proyecto pertenece al camper
        const verifyQuery = `
            SELECT *
            FROM CAMPER_PROJECT
            WHERE camper_id = ? AND project_id = ?
        `;
        const verifyResult = await db.query(verifyQuery, [camper_id, project_id]);

        if (!verifyResult.length) {
            throw new Error('El proyecto no pertenece al camper especificado');
        }

        // Actualizar el proyecto en la tabla PROJECT
        const updateQuery = `
            UPDATE PROJECT
            SET ?
            WHERE id = ?
        `;
        const updateResult = await db.query(updateQuery, [projectData, project_id]);

        if (updateResult.affectedRows === 0) {
            throw new Error('El proyecto no se pudo actualizar');
        }

        return { project_id, ...projectData };
    }
};

module.exports = CamperProjectModel;
