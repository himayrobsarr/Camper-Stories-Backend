const db = require("../helpers/conexion"); // Importa la conexión a MySQL
const { uploadToS3 } = require("../models/uploadModel");

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
    const { title, description, image, code_url, technologyIds } = projectData;

    console.log("Datos recibidos en projectData:", projectData);

    // Validaciones de entrada
    if (!camper_id) {
      throw new Error("El camper_id es obligatorio y debe ser proporcionado");
    }
    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new Error(
        "El título es obligatorio y debe ser una cadena no vacía"
      );
    }
    if (
      !description ||
      typeof description !== "string" ||
      description.trim() === ""
    ) {
      throw new Error(
        "La descripción es obligatoria y debe ser una cadena no vacía"
      );
    }
    if (code_url && !/^https?:\/\//.test(code_url)) {
      throw new Error("La URL del código debe ser un enlace válido");
    }
    // if (technologyIds && !Array.isArray(technologyIds)) {
    //     throw new Error('technologyIds debe ser un arreglo de IDs');
    // }

    // Subir la imagen a S3

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadToS3(image, "proyecto", camper_id);
    }

    console.log("image URL model", imageUrl);

    // Verificar que el usuario logueado tiene acceso al camper
    const camperQuery = `
            SELECT user_id FROM CAMPER WHERE id = ? LIMIT 1
        `;
    const camper = await db.query(camperQuery, [camper_id]);
    const camper_user_id = camper.data[0].user_id;
    console.log("user_id", camper_user_id);
    console.log("req user_id", requestingUserId);

    if (!camper_user_id) {
      throw new Error("No se encontró un camper con el ID proporcionado");
    }

    if (camper_user_id !== requestingUserId) {
      throw new Error("No tienes permiso para agregar proyectos a este camper");
    }

    // Insertar el proyecto en la tabla PROJECT
    const projectQuery = `
            INSERT INTO PROJECT (title, description, image, code_url, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;
    const projectResult = await db.query(projectQuery, [
      title,
      description,
      imageUrl,
      code_url,
    ]);
    const project_id = projectResult.data.insertId;
    console.log("Inserted Project_id:", project_id);

    // Insertar tecnologías en la tabla PROJECT_TECHNOLOGY
    if (technologyIds && technologyIds.length > 0) {
      const techValues = technologyIds.map((techId) => [project_id, techId]);
      await db.query(
        "INSERT INTO PROJECT_TECHNOLOGY (project_id, technology_id) VALUES ?",
        [techValues]
      );
    }

    // Asociar el proyecto al camper en la tabla CAMPER_PROJECT
    const camperProjectQuery = `
            INSERT INTO CAMPER_PROJECT (camper_id, project_id)
            VALUES (?, ?)
        `;
    await db.query(camperProjectQuery, [camper_id, project_id]);

    return {
      project_id,
      title,
      description,
      imageUrl,
      code_url,
      technologyIds,
    };
  },

  // Actualizar un proyecto existente (solo si el proyecto pertenece al camper)
  updateProjectForCamper: async (camper_id, project_id, projectData) => {
    const { title, description, image, code_url, technologyIds } = projectData;

    // Validaciones de entrada
    if (title && (typeof title !== "string" || title.trim() === "")) {
      throw new Error("El título debe ser una cadena no vacía");
    }
    if (
      description &&
      (typeof description !== "string" || description.trim() === "")
    ) {
      throw new Error("La descripción debe ser una cadena no vacía");
    }
    if (code_url && !/^https?:\/\//.test(code_url)) {
      throw new Error("La URL del código debe ser un enlace válido");
    }
    // if (technologyIds && !Array.isArray(technologyIds)) {
    //     throw new Error('technologyIds debe ser un arreglo de IDs');
    // }

    // Verificar que el proyecto pertenece al camper
    const verifyQuery = `
            SELECT *
            FROM CAMPER_PROJECT
            WHERE camper_id = ? AND project_id = ?
        `;
    const verifyResult = await db.query(verifyQuery, [camper_id, project_id]);

    if (!verifyResult.data.length) {
      throw new Error("El proyecto no pertenece al camper especificado");
    }

    // Manejar la subida de nueva imagen a S3 si existe
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadToS3(image, "proyecto", camper_id);
    }

    // Construir dinámicamente los campos a actualizar
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (imageUrl) updates.image = imageUrl; // Usar imageUrl en lugar de image
    if (code_url) updates.code_url = code_url;

    // Actualizar el proyecto en la tabla PROJECT
    if (Object.keys(updates).length > 0) {
      const updateQuery = `
                UPDATE PROJECT
                SET ?
                WHERE id = ?
            `;
      const updateResult = await db.query(updateQuery, [updates, project_id]);

      if (updateResult.affectedRows === 0) {
        throw new Error("El proyecto no se pudo actualizar");
      }
    }

    // Actualizar tecnologías asociadas al proyecto
    if (technologyIds) {
      // Eliminar las tecnologías existentes para este proyecto
      const deleteTechQuery = `
                DELETE FROM PROJECT_TECHNOLOGY
                WHERE project_id = ?
            `;
      await db.query(deleteTechQuery, [project_id]);

      // Insertar las nuevas tecnologías
      if (technologyIds.length > 1) {
        const techValues = technologyIds.map((techId) => [project_id, techId]);
        await db.query(
          "INSERT INTO PROJECT_TECHNOLOGY (project_id, technology_id) VALUES ?",
          [techValues]
        );
      } else if (technologyIds.length === 1) {  // Corregido el operador de asignación = a comparación ===
        // Formateamos el valor único de la misma manera que múltiples valores
        const techValues = [[project_id, technologyIds[0]]];
        await db.query(
            "INSERT INTO PROJECT_TECHNOLOGY (project_id, technology_id) VALUES ?",
            [techValues]
        );
    }
    }

    // Obtener el proyecto actualizado para devolverlo
    const getProjectQuery = `
            SELECT title, description, image, code_url
            FROM PROJECT
            WHERE id = ?
        `;
    const projectResult = await db.query(getProjectQuery, [project_id]);
    const updatedProject = projectResult.data[0];

    return {
      project_id,
      ...updatedProject,
      technologyIds: technologyIds || undefined,
    };
  },

  //tecnologias por proyecto
  getProjectTechnologies: async (projectId) => {
    const query = `
            SELECT t.id, t.name
            FROM PROJECT_TECHNOLOGY pt
            JOIN TECHNOLOGY t ON pt.technology_id = t.id
            WHERE pt.project_id = ?
        `;

    try {
      const result = await db.query(query, [projectId]);

      // Verificar si result.data existe y es un array
      if (!result.data || !Array.isArray(result.data)) {
        console.log("Resultado de la consulta:", result);
        return [];
      }

      // Mapear los resultados si existen
      return result.data.map((tech) => ({
        id: tech.id,
        name: tech.name,
      }));
    } catch (error) {
      console.error("Error en getProjectTechnologies:", error);
      throw error;
    }
  },
};

module.exports = CamperProjectModel;
