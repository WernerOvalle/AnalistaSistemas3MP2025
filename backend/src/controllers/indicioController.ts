import { Request, Response } from 'express';
import { getPool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const obtenerIndiciosPorExpediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_expediente } = req.params;

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', parseInt(id_expediente))
      .execute('sp_ObtenerIndiciosPorExpediente');

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener indicios:', error);
    res.status(500).json({ error: 'Error al obtener indicios' });
  }
};

export const crearIndicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const {
      id_expediente,
      numero_indicio,
      nombre_objeto,
      descripcion,
      color,
      tamano,
      peso,
      ubicacion_encontrado,
      observaciones,
    } = req.body;

    if (!id_expediente || !numero_indicio || !nombre_objeto) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', id_expediente)
      .input('numero_indicio', numero_indicio)
      .input('nombre_objeto', nombre_objeto)
      .input('descripcion', descripcion || null)
      .input('color', color || null)
      .input('tamano', tamano || null)
      .input('peso', peso || null)
      .input('ubicacion_encontrado', ubicacion_encontrado || null)
      .input('observaciones', observaciones || null)
      .input('id_tecnico_registra', user!.id_usuario)
      .execute('sp_CrearIndicio');

    res.status(201).json({
      message: 'Indicio creado exitosamente',
      id_indicio: result.recordset[0].id_indicio,
    });
  } catch (error: any) {
    console.error('Error al crear indicio:', error);
    if (error.number === 2627) {
      res.status(409).json({ error: 'El número de indicio ya existe en este expediente' });
    } else {
      res.status(500).json({ error: 'Error al crear indicio' });
    }
  }
};

export const actualizarIndicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { id } = req.params;
    const {
      nombre_objeto,
      descripcion,
      color,
      tamano,
      peso,
      ubicacion_encontrado,
      observaciones,
    } = req.body;

    if (!nombre_objeto) {
      res.status(400).json({ error: 'El nombre del objeto es requerido' });
      return;
    }

    const pool = await getPool();
    await pool
      .request()
      .input('id_indicio', parseInt(id))
      .input('nombre_objeto', nombre_objeto)
      .input('descripcion', descripcion || null)
      .input('color', color || null)
      .input('tamano', tamano || null)
      .input('peso', peso || null)
      .input('ubicacion_encontrado', ubicacion_encontrado || null)
      .input('observaciones', observaciones || null)
      .input('id_usuario', user!.id_usuario)
      .execute('sp_ActualizarIndicio');

    res.json({ message: 'Indicio actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar indicio:', error);
    res.status(500).json({ error: 'Error al actualizar indicio' });
  }
};

export const eliminarIndicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { id } = req.params;

    const pool = await getPool();
    await pool
      .request()
      .input('id_indicio', parseInt(id))
      .input('id_usuario', user!.id_usuario)
      .execute('sp_EliminarIndicio');

    res.json({ message: 'Indicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar indicio:', error);
    res.status(500).json({ error: 'Error al eliminar indicio' });
  }
};
