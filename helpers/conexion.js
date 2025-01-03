require('dotenv').config();

// Verificación de variables de entorno
console.log('Verificando variables de entorno:');
const variablesRequeridas = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_PORT', 'DB_NAME'];
const variablesFaltantes = variablesRequeridas.filter(variable => !process.env[variable]);

if (variablesFaltantes.length > 0) {
    console.error('Faltan las siguientes variables de entorno:', variablesFaltantes);
    process.exit(1);
}

const mysql = require('mysql2/promise');

class Conexion {
    constructor() {
        this.config = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        };
        
        console.log('Configuración cargada:', {
            host: this.config.host,
            user: this.config.user,
            port: this.config.port,
            database: this.config.database
        });
        
        this.pool = mysql.createPool(this.config);
    }

    /**
     * Método para obtener la conexión a la base de datos.
     * @returns {Promise<Connection>} Una conexión activa a la base de datos.
     */
    async getConexion() {
        try {
            console.log('Intentando establecer conexión...');
            const connection = await this.pool.getConnection();
            console.log('Conexión exitosa a la base de datos');
            return { status: 200, message: 'Conexión establecida', connection };
        } catch (error) {
            console.error('Error de conexión:', error.message);
            console.error('Detalles completos del error:', error);
            throw new Error(
                JSON.stringify({ status: 500, message: 'Error en la conexión', error })
            );
        }
    }

    /**
     * Método para realizar consultas directamente desde el pool.
     * @param {string} query - Consulta SQL a ejecutar.
     * @param {Array} params - Parámetros para la consulta.
     * @returns {Promise<Object>} Resultado de la consulta.
     */
    async query(query, params = []) {
        try {
            console.log('Ejecutando query:', query);
            console.log('Parámetros:', params);
            const [results] = await this.pool.query(query, params);
            console.log('Query ejecutada exitosamente');
            return { status: 200, data: results };
        } catch (error) {
            console.error('Error en la query:', error.message);
            console.error('Query que falló:', query);
            console.error('Parámetros de la query:', params);
            throw new Error(
                JSON.stringify({ status: 500, message: 'Error al ejecutar la consulta', error })
            );
        }
    }
}

module.exports = new Conexion();
