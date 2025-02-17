const express = require("express");
const CamperController = require("../controllers/camperController");
const authMiddleware = require('../middlewares/authMiddleware');
const limit = require('../limit/camperLimit');

const router = express.Router();

/**
 * 1. Rutas globales que no usan parámetros
 * Estas deben ir PRIMERO para evitar conflictos con rutas parametrizadas
 */
router.get('/all/details', CamperController.getAllCampersDetails); // Mover al inicio
router.post("/", authMiddleware, CamperController.create);

/**
 * 2. Rutas específicas relacionadas con estados
 */
router.get('/trainees/:campusId', CamperController.getTrainees);
router.get('/graduates/:campusId', CamperController.getGraduatesByCampus);

/**
 * 3. Rutas específicas para sueños de campers
 */
router.get('/:id/dreams', CamperController.getDreamsByCamperId);
router.post('/:id/dreams', authMiddleware, CamperController.addDreamToCamper);
router.delete('/:id/dreams/:dream_id', authMiddleware, CamperController.deleteDreamFromCamper);

/**
 * 4. Rutas generales públicas
 */
router.get("/:campusId/campus", CamperController.getAll);
router.get("/:id/details", CamperController.getCamperDetails);

/**
 * 5. Rutas relacionadas con videos
 */
router.get("/:camperId/videos", CamperController.getVideosByCamperId);
router.post("/:id/videos", CamperController.addTrainingVideo);
router.delete("/:id/videos/:video_id", CamperController.deleteTrainingVideo);

/**
 * 6. Rutas relacionadas con proyectos
 */
router.get("/:id/proyects", CamperController.getProjectsByCamperId);
router.post("/:id/proyects", CamperController.addProjectToCamper);
router.delete("/:id/proyects/:proyect_id", CamperController.deleteProjectFromCamper);

/**
 * 7. Rutas relacionadas con el estado y atributos del camper
 */
router.patch('/:id/status', CamperController.updateStatus);

/**
 * 8. Rutas relacionadas con gestión directa del camper
 */
router.put("/:id", authMiddleware, CamperController.update);
router.delete("/:id", authMiddleware, CamperController.delete);

/**
 * 9. Rutas generales y de fallback (SIEMPRE AL FINAL)
 */
router.get("/:id", CamperController.getById);

module.exports = router;