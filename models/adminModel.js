const db = require("../helpers/conexion");


class adminModel {
    static async getAllregister() {
        const query = 'SELECT COUNT(*) AS total_registros FROM CAMPER;';
        const result = await db.query(query);
        if (!result.data || result.data.length === 0) {
            throw new Error('No se encontraron registros');
        }
        return result.data[0].total_registros;
    }

    static async getAllIncomplete() {
        const query = `SELECT c.id, c.user_id, c.title, c.history, c.about, c.main_video_url, 
                              c.full_name, c.profile_picture, c.status
                       FROM CAMPER c
                       LEFT JOIN CAMPER_PROJECT cp ON c.id = cp.camper_id
                       LEFT JOIN CAMPER_MERIT cm ON c.id = cm.user_id
                       LEFT JOIN DREAMS d ON c.id = d.camper_id
                       LEFT JOIN TRAINING_VIDEO tv ON c.id = tv.camper_id
                       WHERE (c.user_id IS NULL OR
                              c.title IS NULL OR
                              c.history IS NULL OR
                              c.about IS NULL OR
                              c.main_video_url IS NULL OR
                              c.full_name IS NULL OR
                              c.profile_picture IS NULL OR
                              c.status IS NULL)
                             AND (cp.camper_id IS NOT NULL OR
                                  cm.user_id IS NOT NULL OR
                                  d.camper_id IS NOT NULL OR
                                  tv.camper_id IS NOT NULL)
                       GROUP BY c.id, c.user_id, c.title, c.history, c.about, c.main_video_url, 
                                c.full_name, c.profile_picture, c.status;`;

        const result = await db.query(query);
        if (!result.data || result.data.length === 0) {
            throw new Error('No se encontraron registros incompletos');
        }
        return result.data; 
    }
}

module.exports = adminModel;
