const db = require("../helpers/conexion");

const DocumentModel = {
    // Crear un nuevo documento
    createDocument: async ({ document_number }) => {
        const query = 'INSERT INTO DOCUMENT_NUMBER (document_number) VALUES (?)';
        const values = [document_number];
        return await db.query(query, values);
    },

    // Obtener un documento por ID
    getDocumentById: async (id) => {
        const query = "SELECT * FROM DOCUMENT_NUMBER WHERE id = ?";
        return db.query(query, [id]);
    },

    // Actualizar un documento
    updateDocument: async (document_id, document_number) => {
        const query = "UPDATE DOCUMENT_NUMBER SET document_number = ? WHERE id = ?";
        return db.query(query, [document_number, document_id]);
    },

    // Eliminar un documento
    deleteDocument: async (id) => {
        const query = "DELETE FROM DOCUMENT_NUMBER WHERE id = ?";
        return db.query(query, [id]);
    },
};

module.exports = DocumentModel;
