const conexion = require('../helpers/conexion');

class PlanModel {
    constructor() {
        this.table = 'PLAN';
    }

    /**
     * Busca un plan por su ID
     * @param {number} id - ID del plan a buscar
     * @returns {Promise<Object>} Plan encontrado o null
     * @throws {Error} Si hay un error en la consulta
     */
    async findById(id) {
        try {
            const query = `
                SELECT 
                    p.id,
                    p.main_price,
                    GROUP_CONCAT(b.description) as benefits
                FROM ${this.table} p
                LEFT JOIN PLAN_HAS_BENEFIT phb ON p.id = phb.plan_id
                LEFT JOIN BENEFIT b ON phb.benefit_id = b.id
                WHERE p.id = ?
                GROUP BY p.id
            `;
            
            const result = await conexion.query(query, [id]);
            
            if (!result.data || result.data.length === 0) {
                return null;
            }
            
            const plan = result.data[0];
            return {
                id: plan.id,
                main_price: plan.main_price,
                benefits: plan.benefits ? plan.benefits.split(',') : []
            };
        } catch (error) {
            console.error('Error en findById:', error);
            throw new Error(`Error al buscar el plan: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los planes
     * @returns {Promise<Array>} Lista de planes
     * @throws {Error} Si hay un error en la consulta
     */
    async getAllPlans() {
        try {
            const query = `
                SELECT 
                    p.id,
                    p.main_price,
                    GROUP_CONCAT(b.description) as benefits
                FROM ${this.table} p
                LEFT JOIN PLAN_HAS_BENEFIT phb ON p.id = phb.plan_id
                LEFT JOIN BENEFIT b ON phb.benefit_id = b.id
                GROUP BY p.id
            `;
            
            const result = await conexion.query(query);
            return result.data.map(plan => ({
                id: plan.id,
                main_price: plan.main_price,
                benefits: plan.benefits ? plan.benefits.split(',') : []
            }));
        } catch (error) {
            console.error('Error en getAllPlans:', error);
            throw new Error(`Error al obtener los planes: ${error.message}`);
        }
    }

    /**
     * Crea un nuevo plan
     * @param {Object} planData - Datos del plan a crear
     * @param {number} planData.main_price - Precio principal del plan
     * @returns {Promise<Object>} Plan creado
     * @throws {Error} Si hay un error en la inserción
     */
    async create(planData) {
        try {
            const { connection } = await conexion.getConexion();
            
            try {
                await connection.beginTransaction();

                const [result] = await connection.query(
                    `INSERT INTO ${this.table} (main_price) VALUES (?)`,
                    [planData.main_price]
                );

                const [newPlan] = await connection.query(
                    `SELECT id, main_price FROM ${this.table} WHERE id = ?`,
                    [result.insertId]
                );

                await connection.commit();
                return newPlan[0];
            } catch (error) {
                await connection.rollback();
                console.error('Error en create:', error);
                throw new Error(`Error al crear el plan: ${error.message}`);
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error de conexión en create:', error);
            throw new Error(`Error de conexión: ${error.message}`);
        }
    }

    /**
     * Actualiza un plan existente
     * @param {number} id - ID del plan a actualizar
     * @param {Object} planData - Datos a actualizar
     * @param {number} planData.main_price - Nuevo precio principal
     * @returns {Promise<Object>} Plan actualizado
     * @throws {Error} Si hay un error en la actualización
     */
    async update(id, planData) {
        try {
            const { connection } = await conexion.getConexion();
            
            try {
                await connection.beginTransaction();

                await connection.query(
                    `UPDATE ${this.table} SET main_price = ? WHERE id = ?`,
                    [planData.main_price, id]
                );

                const [updatedPlan] = await connection.query(
                    `SELECT id, main_price FROM ${this.table} WHERE id = ?`,
                    [id]
                );

                await connection.commit();
                return updatedPlan[0];
            } catch (error) {
                await connection.rollback();
                console.error('Error en update:', error);
                throw new Error(`Error al actualizar el plan: ${error.message}`);
            } finally {
                if (connection) connection.release();
            }
        } catch (error) {
            console.error('Error de conexión en update:', error);
            throw new Error(`Error de conexión: ${error.message}`);
        }
    }

    async getPlanWithBenefits(id) {
        try {
            const query = `
                SELECT 
                    p.id,
                    p.main_price,
                    b.id as benefit_id,
                    b.description as benefit_description
                FROM ${this.table} p
                LEFT JOIN PLAN_HAS_BENEFIT phb ON p.id = phb.plan_id
                LEFT JOIN BENEFIT b ON phb.benefit_id = b.id
                WHERE p.id = ?
            `;
            
            const result = await conexion.query(query, [id]);
            
            if (!result.data || result.data.length === 0) {
                return null;
            }

            const benefits = result.data
                .filter(row => row.benefit_id)
                .map(row => ({
                    id: row.benefit_id,
                    description: row.benefit_description
                }));

            return {
                id: result.data[0].id,
                main_price: result.data[0].main_price,
                benefits
            };
        } catch (error) {
            console.error('Error en getPlanWithBenefits:', error);
            throw new Error(`Error al obtener el plan con beneficios: ${error.message}`);
        }
    }
}

module.exports = new PlanModel();