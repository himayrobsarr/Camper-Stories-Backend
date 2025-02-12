const connection = require('../helpers/conexion');

const technologyModel = {
    getAlltechnology: async () => {
        try {
            const query = 'SELECT id, name FROM TECHNOLOGY';
            const result = await connection.query(query);
            
            if (result && result.data) {
                return { data: result.data };
            }
            
            throw new Error('No se pudieron obtener los datos');
        } catch (error) {
            throw new Error(`Error al obtener las TECNOLOGIAS: ${error.message}`);
        }
    }
};

module.exports = technologyModel;