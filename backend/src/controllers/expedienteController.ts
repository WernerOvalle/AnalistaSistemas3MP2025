import { Request, Response } from 'express';
import { getPool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const crearExpediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const {
      numero_expediente,
      titulo,
      descripcion,
      fecha_incidente,
      lugar_incidente,
    } = req.body;

    if (!numero_expediente || !titulo || !fecha_incidente) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('numero_expediente', numero_expediente)
      .input('titulo', titulo)
      .input('descripcion', descripcion || null)
      .input('fecha_incidente', new Date(fecha_incidente))
      .input('lugar_incidente', lugar_incidente || null)
      .input('id_tecnico_registra', user!.id_usuario)
      .execute('sp_CrearExpediente');

    const nuevoId = result.recordset[0].id_expediente;
    console.log('✅ Expediente creado con ID:', nuevoId);

    res.status(201).json({
      message: 'Expediente creado exitosamente',
      id_expediente: nuevoId,
    });
  } catch (error: any) {
    console.error('Error al crear expediente:', error);
    if (error.number === 2627) {
      res.status(409).json({ error: 'El número de expediente ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear expediente' });
    }
  }
};

export const obtenerExpedientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_estado, fecha_inicio, fecha_fin, id_tecnico } = req.query;

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_estado', id_estado || null)
      .input('fecha_inicio', fecha_inicio ? new Date(fecha_inicio as string) : null)
      .input('fecha_fin', fecha_fin ? new Date(fecha_fin as string) : null)
      .input('id_tecnico', id_tecnico || null)
      .execute('sp_ObtenerExpedientes');

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener expedientes:', error);
    res.status(500).json({ error: 'Error al obtener expedientes' });
  }
};

export const obtenerExpedientePorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('🔍 Buscando expediente con ID:', id);

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', parseInt(id))
      .execute('sp_ObtenerExpedientePorId');

    console.log('📊 Resultado de búsqueda:', result.recordset.length, 'registros');

    if (result.recordset.length === 0) {
      console.log('❌ Expediente no encontrado en base de datos');
      res.status(404).json({ error: 'Expediente no encontrado' });
      return;
    }

    console.log('✅ Expediente encontrado:', result.recordset[0].id_expediente);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener expediente:', error);
    res.status(500).json({ error: 'Error al obtener expediente' });
  }
};

export const actualizarEstadoExpediente = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { id } = req.params;
    const { id_estado } = req.body;

    if (!id_estado) {
      res.status(400).json({ error: 'El estado es requerido' });
      return;
    }

    const pool = await getPool();
    await pool
      .request()
      .input('id_expediente', parseInt(id))
      .input('id_estado', id_estado)
      .input('id_usuario', user!.id_usuario)
      .execute('sp_ActualizarEstadoExpediente');

    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

export const enviarARevision = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { id } = req.params;

    const pool = await getPool();
    await pool
      .request()
      .input('id_expediente', parseInt(id))
      .input('id_usuario', user!.id_usuario)
      .execute('sp_EnviarExpedienteARevision');

    res.json({ message: 'Expediente enviado a revisión exitosamente' });
  } catch (error) {
    console.error('Error al enviar a revisión:', error);
    res.status(500).json({ error: 'Error al enviar a revisión' });
  }
};

export const obtenerIndiciosPorExpediente = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', parseInt(id))
      .execute('sp_ObtenerIndiciosPorExpediente');

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener indicios:', error);
    res.status(500).json({ error: 'Error al obtener indicios' });
  }
};
