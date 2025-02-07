const express = require("express");
const CamperController = require("../controllers/camperController");
const authMiddleware = require('../middlewares/authMiddleware');
const limit = require('../limit/camperLimit');

const router = express.Router();

// 1. Primero las rutas específicas para estados
router.get('/graduates', CamperController.getGraduates);  // /campers/graduates
router.get('/trainees/:campusid', CamperController.getTrainees);    // /campers/trainees
router.get('/:id/dreams', CamperController.getDreamsByCamperId);//obtener sueno por id de usuario


router.post('/:id/dreams', authMiddleware, CamperController.addDreamToCamper);



// En camperRoutes.js
router.delete('/:id/dreams/:dream_id', authMiddleware, CamperController.deleteDreamFromCamper);

// 2. Rutas públicas generales
router.get("/:campusid",  CamperController.getAll);
router.get("/:id/details", CamperController.getCamperDetails);

// 3. Rutas con parámetros
router.get("/:id",  CamperController.getById);
router.get("/:camperId/videos", CamperController.getVideosByCamperId);
router.post("/:id/videos", CamperController.addTrainingVideo);
router.delete("/:id/videos/:video_id", CamperController.deleteTrainingVideo);

router.get("/:id/proyects", CamperController.getProjectsByCamperId);
router.post("/:id/proyects", CamperController.addProjectToCamper);
router.delete("/:id/proyects/:proyect_id", CamperController.deleteProjectFromCamper);

router.patch('/:id/status', CamperController.updateStatus);

// Rutas protegidas
router.post("/", authMiddleware,  CamperController.create);
router.put("/:id", authMiddleware,  CamperController.update);
router.delete("/:id", authMiddleware,  CamperController.delete);

module.exports = router;