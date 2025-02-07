// helpers/conexionSecundaria.js
require('dotenv').config();
const mysql = require('mysql2/promise');

class ConexionSecundaria {
    constructor() {
        this.config = {
            host: process.env.DB2_HOST,
            user: process.env.DB2_USER,
            password: process.env.DB2_PASSWORD,
            port: process.env.DB2_PORT,
            database: process.env.DB2_NAME,
            connectionLimit: 25,
            queueLimit: 0,
            waitForConnections: true,
            connectTimeout: 10000,
            idleTimeout: 60000,
            maxIdle: 10
        };
        
        this.pool = mysql.createPool(this.config);
    }

    async query(query, params = []) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [results] = await connection.query(query, params);
            return { status: 200, data: results };
        } catch (error) {
            console.error('Error en la query:', error.message);
            throw new Error(JSON.stringify({ 
                status: 500, 
                message: 'Error al ejecutar la consulta', 
                error 
            }));
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = new ConexionSecundaria();