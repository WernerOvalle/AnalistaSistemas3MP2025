import express from 'express';
import * as reporteController from '../controllers/reporteController';
import { authenticateToken, authorize } from '../middleware/auth';

const router = express.Router();

router.get(
  '/expedientes-estado',
  authenticateToken,
  authorize('Coordinador', 'Administrador'),
  reporteController.reporteExpedientesPorEstado
);

router.get(
  '/aprobaciones-rechazos',
  authenticateToken,
  authorize('Coordinador', 'Administrador'),
  reporteController.reporteAprobacionesRechazos
);

router.get(
  '/estadisticas',
  authenticateToken,
  reporteController.estadisticasGenerales
);

export default router;
