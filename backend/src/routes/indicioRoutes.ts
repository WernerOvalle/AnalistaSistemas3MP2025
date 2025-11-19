import express from 'express';
import * as indicioController from '../controllers/indicioController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = express.Router();

router.get(
  '/expediente/:id_expediente',
  authenticateToken,
  indicioController.obtenerIndiciosPorExpediente
);

router.post(
  '/',
  authenticateToken,
  authorize('Técnico', 'Coordinador', 'Administrador'),
  indicioController.crearIndicio
);

router.put(
  '/:id',
  authenticateToken,
  authorize('Técnico', 'Coordinador', 'Administrador'),
  indicioController.actualizarIndicio
);

router.delete(
  '/:id',
  authenticateToken,
  authorize('Técnico', 'Coordinador', 'Administrador'),
  indicioController.eliminarIndicio
);

export default router;
