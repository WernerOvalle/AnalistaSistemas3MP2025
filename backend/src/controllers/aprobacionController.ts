import { Request, Response } from 'express';
import { getPool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const crearAprobacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { id_expediente, aprobado, justificacion } = req.body;

    if (id_expediente === undefined || aprobado === undefined) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    if (!aprobado && !justificacion) {
      res.status(400).json({ 
        error: 'La justificación es requerida para rechazar un expediente' 
      });
      return;
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', id_expediente)
      .input('id_coordinador', user!.id_usuario)
      .input('aprobado', aprobado)
      .input('justificacion', justificacion || null)
      .execute('sp_CrearAprobacion');

    res.status(201).json({
      message: aprobado 
        ? 'Expediente aprobado exitosamente' 
        : 'Expediente rechazado exitosamente',
      id_aprobacion: result.recordset[0].id_aprobacion,
    });
  } catch (error) {
    console.error('Error al crear aprobación:', error);
    res.status(500).json({ error: 'Error al procesar aprobación' });
  }
};

export const aprobarExpediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { id_expediente } = req.params;
    const { justificacion } = req.body;

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', parseInt(id_expediente))
      .input('id_coordinador', user!.id_usuario)
      .input('aprobado', true)
      .input('justificacion', justificacion || null)
      .execute('sp_CrearAprobacion');

    res.status(201).json({
      message: 'Expediente aprobado exitosamente',
      id_aprobacion: result.recordset[0].id_aprobacion,
    });
  } catch (error) {
    console.error('Error al aprobar expediente:', error);
    res.status(500).json({ error: 'Error al aprobar expediente' });
  }
};

export const rechazarExpediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { id_expediente } = req.params;
    const { justificacion } = req.body;

    if (!justificacion) {
      res.status(400).json({ 
        error: 'La justificación es requerida para rechazar un expediente' 
      });
      return;
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', parseInt(id_expediente))
      .input('id_coordinador', user!.id_usuario)
      .input('aprobado', false)
      .input('justificacion', justificacion)
      .execute('sp_CrearAprobacion');

    res.status(201).json({
      message: 'Expediente rechazado exitosamente',
      id_aprobacion: result.recordset[0].id_aprobacion,
    });
  } catch (error) {
    console.error('Error al rechazar expediente:', error);
    res.status(500).json({ error: 'Error al rechazar expediente' });
  }
};

export const obtenerAprobacionesPorExpediente = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', parseInt(id))
      .execute('sp_ObtenerAprobacionesPorExpediente');

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener aprobaciones:', error);
    res.status(500).json({ error: 'Error al obtener aprobaciones' });
  }
};
