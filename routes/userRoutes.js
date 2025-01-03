const express = require("express");
const UserController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Rutas públicas
router.post('/login', UserController.login);
router.post('/register', UserController.create); // Ruta pública para registro
router.post('/', UserController.create); // Ruta alternativa para registro

// Ruta para cerrar sesión
router.post('/logout', UserController.logout); // Ruta para cerrar sesión

// Rutas protegidas con authMiddleware
router.get("/", authMiddleware, UserController.getAll);
router.get("/:id", authMiddleware, UserController.getById);
router.put("/:id", authMiddleware, UserController.update);
router.delete("/:id", authMiddleware, UserController.delete);

module.exports = router;
