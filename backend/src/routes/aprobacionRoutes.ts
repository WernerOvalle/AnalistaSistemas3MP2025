import express from 'express';
import * as aprobacionController from '../controllers/aprobacionController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = express.Router();

router.post(
  '/aprobar/:id_expediente',
  authenticateToken,
  authorize('Coordinador', 'Administrador'),
  aprobacionController.aprobarExpediente
);

router.post(
  '/rechazar/:id_expediente',
  authenticateToken,
  authorize('Coordinador', 'Administrador'),
  aprobacionController.rechazarExpediente
);

router.post(
  '/',
  authenticateToken,
  authorize('Coordinador', 'Administrador'),
  aprobacionController.crearAprobacion
);

router.get(
  '/expediente/:id',
  authenticateToken,
  aprobacionController.obtenerAprobacionesPorExpediente
);

export default router;
