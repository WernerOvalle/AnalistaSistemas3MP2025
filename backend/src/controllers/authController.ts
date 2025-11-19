import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
      return;
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('username', username)
      .execute('sp_AutenticarUsuario');

    if (result.recordset.length === 0) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const user = result.recordset[0];

    if (!user.activo) {
      res.status(401).json({ error: 'Usuario inactivo' });
      return;
    }

    // Validar password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Generar token JWT
    const tokenPayload = {
      id_usuario: user.id_usuario,
      username: user.username,
      id_rol: user.id_rol,
      nombre_rol: user.nombre_rol,
    };

    const secret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(tokenPayload, secret, { expiresIn: '24h' });

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        username: user.username,
        rol: user.nombre_rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, email, username, password, id_rol } = req.body;

    if (!nombre || !apellido || !email || !username || !password || !id_rol) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const pool = await getPool();
    const result = await pool
      .request()
      .input('nombre', nombre)
      .input('apellido', apellido)
      .input('email', email)
      .input('username', username)
      .input('password_hash', password_hash)
      .input('id_rol', id_rol)
      .execute('sp_CrearUsuario');

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      id_usuario: result.recordset[0].id_usuario,
    });
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    if (error.number === 2627) {
      res.status(409).json({ error: 'Usuario o email ya existe' });
    } else {
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    
    if (!user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};
