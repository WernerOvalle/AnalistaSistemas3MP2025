import express from 'express';
import * as expedienteController from '../controllers/expedienteController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  authorize('Técnico', 'Coordinador', 'Administrador'),
  expedienteController.crearExpediente
);

router.get(
  '/',
  authenticateToken,
  expedienteController.obtenerExpedientes
);

router.get(
  '/:id',
  authenticateToken,
  expedienteController.obtenerExpedientePorId
);

router.put(
  '/:id/estado',
  authenticateToken,
  authorize('Coordinador', 'Administrador'),
  expedienteController.actualizarEstadoExpediente
);

router.put(
  '/:id/enviar-revision',
  authenticateToken,
  authorize('Técnico', 'Coordinador', 'Administrador'),
  expedienteController.enviarARevision
);

router.get(
  '/:id/indicios',
  authenticateToken,
  expedienteController.obtenerIndiciosPorExpediente
);

export default router;
