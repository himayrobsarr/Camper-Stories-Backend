const connection = require('../helpers/conexion');

const CityModel = {
    getAllCities: async () => {
        try {
            const query = 'CALL GetCitiesWithDept()';
            const result = await connection.query(query);
            
            if (result && result.data) {
                return { data: result.data };
            }
            
            throw new Error('No se pudieron obtener los datos');
        } catch (error) {
            throw new Error(`Error al obtener las ciudades: ${error.message}`);
        }
    }

};



module.exports = CityModel;