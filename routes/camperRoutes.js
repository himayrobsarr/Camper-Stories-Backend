const express = require("express");
const CamperController = require("../controllers/camperController");
const authMiddleware = require('../middlewares/authMiddleware');
const limit = require('../limit/camperLimit');

const router = express.Router();

// 1. Primero las rutas específicas para estados
router.get('/graduates', CamperController.getGraduates);  // /campers/graduates
router.get('/trainees', CamperController.getTrainees);    // /campers/trainees
router.get('/:id/dreams', CamperController.getDreamsByCamperId);//obtener sueno por id de usuario

router.post('/:id/dreams', authMiddleware, CamperController.addDreamToCamper);

// En camperRoutes.js
router.delete('/:id/dreams/:dream_id', authMiddleware, CamperController.deleteDreamFromCamper);

// 2. Rutas públicas generales
router.get("/", limit.getAllCampersLimiter, CamperController.getAll);

// 3. Rutas con parámetros
router.get("/:id", limit.getCamperByIdLimiter, CamperController.getById);
router.get("/:camperId/videos", CamperController.getVideosByCamperId);
router.post("/:id/videos", CamperController.addTrainingVideo);
router.delete("/:id/videos/:video_id", CamperController.deleteTrainingVideo);

router.get("/:id/proyects", CamperController.getProjectsByCamperId);
router.post("/:id/proyects", CamperController.addProjectToCamper);
router.delete("/:id/proyects/:proyect_id", CamperController.deleteProjectFromCamper);

router.patch('/:id/status', CamperController.updateStatus);

// Rutas protegidas
router.post("/", authMiddleware, limit.createCamperLimiter, CamperController.create);
router.put("/:id", authMiddleware, limit.updateCamperLimiter, CamperController.update);
router.delete("/:id", authMiddleware, limit.deleteCamperLimiter, CamperController.delete);

module.exports = router;