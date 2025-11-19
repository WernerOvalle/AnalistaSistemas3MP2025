import { Request, Response } from 'express';
import { getPool } from '../config/database';

export const reporteExpedientesPorEstado = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const pool = await getPool();
    const result = await pool
      .request()
      .input('fecha_inicio', fecha_inicio ? new Date(fecha_inicio as string) : null)
      .input('fecha_fin', fecha_fin ? new Date(fecha_fin as string) : null)
      .execute('sp_ReporteExpedientesPorEstado');

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

export const reporteAprobacionesRechazos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const pool = await getPool();
    const result = await pool
      .request()
      .input('fecha_inicio', fecha_inicio ? new Date(fecha_inicio as string) : null)
      .input('fecha_fin', fecha_fin ? new Date(fecha_fin as string) : null)
      .execute('sp_ReporteAprobacionesRechazos');

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

export const estadisticasGenerales = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('sp_EstadisticasGenerales');

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
