const express = require("express");
const CamperController = require("../controllers/camperController");
const authMiddleware = require('../middlewares/authMiddleware');
const limit = require('../limit/camperLimit');

const router = express.Router();

/**
 * 1. Rutas específicas relacionadas con estados
 * Estas rutas tienen prefijos específicos que las diferencian y no deberían solaparse.
 */
router.get('/trainees/:campusId', CamperController.getTrainees); // Obtener trainees de un campus
router.get('/graduates/:campusId', CamperController.getGraduatesByCampus); // Obtener graduados por campus

/**
 * 2. Rutas específicas para sueños de campers
 * Estas rutas gestionan los sueños asociados a un usuario.
 */
router.get('/:id/dreams', CamperController.getDreamsByCamperId); // Obtener sueños por ID de usuario
router.post('/:id/dreams', authMiddleware, CamperController.addDreamToCamper); // Agregar un sueño (protegida)
router.delete('/:id/dreams/:dream_id', authMiddleware, CamperController.deleteDreamFromCamper); // Eliminar un sueño específico (protegida)

/**
 * 3. Rutas generales públicas
 * Estas rutas no requieren autenticación y están abiertas para todos los usuarios.
 */
router.get("/:campusId/campus", CamperController.getAll); // Obtener todos los campers de un campus
router.get("/:id/details", CamperController.getCamperDetails); // Obtener detalles de un camper por ID

/**
 * 4. Rutas relacionadas con videos
 * Gestionan los videos asociados a un usuario.
 */
router.get("/:camperId/videos", CamperController.getVideosByCamperId); // Obtener videos por ID de camper
router.post("/:id/videos", CamperController.addTrainingVideo); // Agregar un video
router.delete("/:id/videos/:video_id", CamperController.deleteTrainingVideo); // Eliminar un video específico

/**
 * 5. Rutas relacionadas con proyectos
 * Gestionan los proyectos asociados a un usuario.
 */
router.get("/:id/proyects", CamperController.getProjectsByCamperId); // Obtener proyectos por ID de camper
router.post("/:id/proyects", CamperController.addProjectToCamper); // Agregar un proyecto
router.delete("/:id/proyects/:proyect_id", CamperController.deleteProjectFromCamper); // Eliminar un proyecto específico

/**
 * 6. Rutas relacionadas con el estado y atributos del camper
 * Estas rutas permiten actualizar información específica de un usuario.
 */
router.patch('/:id/status', CamperController.updateStatus); // Actualizar el estado de un camper

/**
 * 7. Rutas relacionadas con gestión directa del camper
 * Estas rutas permiten gestionar campers completos (crear, actualizar, eliminar).
 */
router.post("/", authMiddleware, CamperController.create); // Crear un nuevo camper (protegida)
router.put("/:id", authMiddleware, CamperController.update); // Actualizar un camper por ID (protegida)
router.delete("/:id", authMiddleware, CamperController.delete); // Eliminar un camper por ID (protegida)

/**
 * 8. Rutas generales y de fallback
 * Estas rutas pueden causar problemas de solapamiento si no se organizan correctamente.
 */
router.get("/:id", CamperController.getById); // Obtener un camper por ID (debe ir al final para evitar solapamiento)

module.exports = router;
