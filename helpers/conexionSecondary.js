require('dotenv').config();
const mysql = require('mysql2/promise');

class ConexionSecundaria {
    constructor() {
        this.pools = new Map();
        this.configs = {
            khc_campusland: {
                host: process.env.DB_HOST1,
                user: process.env.DB_USER1,
                password: process.env.DB_PASSWORD1,
                port: process.env.DB_PORT1,
                database: process.env.DB_NAME1,
            },
            khc_bogota: {
                host: process.env.DB_HOST2,
                user: process.env.DB_USER2,
                password: process.env.DB_PASSWORD2,
                port: process.env.DB_PORT2,
                database: process.env.DB_NAME2,
            },
            khc_tibu: {
                host: process.env.DB_HOST3,
                user: process.env.DB_USER3,
                password: process.env.DB_PASSWORD3,
                port: process.env.DB_PORT3,
                database: process.env.DB_NAME3,
            }
        };
    }

    getPool(dbName) {
        if (!this.pools.has(dbName)) {
            const config = {
                ...this.configs[dbName],
                connectionLimit: 25,
                queueLimit: 0,
                waitForConnections: true,
                connectTimeout: 10000,
                idleTimeout: 60000,
                maxIdle: 10
            };
            this.pools.set(dbName, mysql.createPool(config));
        }
        return this.pools.get(dbName);
    }

    async query(dbName, query, params = []) {
        let connection;
        try {
            const pool = this.getPool(dbName);
            connection = await pool.getConnection();
            const [results] = await connection.query(query, params);
            return { status: 200, data: results };
        } catch (error) {
            console.error(`Error en la query (${dbName}):`, error.message);
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