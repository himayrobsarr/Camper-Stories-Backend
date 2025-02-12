const CityModel = require("../models/cityModel");

const CityController = {
    getAll: async (req, res) => {
        try {
            const cities = await CityModel.getAllCities();
            if (cities && cities.data) {
                return res.status(200).json(cities);
            }
            return res.status(404).json({ message: "No se encontraron ciudades" });
        } catch (error) {
            console.error('Error en CityController.getAll:', error);
            return res.status(500).json({ 
                message: "Error interno del servidor al obtener las ciudades",
                error: error.message 
            });
        }
    }
};

module.exports = CityController;