import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getPool } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';

// Rutas
import authRoutes from './routes/authRoutes';
import expedienteRoutes from './routes/expedienteRoutes';
import indicioRoutes from './routes/indicioRoutes';
import aprobacionRoutes from './routes/aprobacionRoutes';
import reporteRoutes from './routes/reporteRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'DICRI API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/indicios', indicioRoutes);
app.use('/api/aprobaciones', aprobacionRoutes);
app.use('/api/reportes', reporteRoutes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await getPool();
    console.log('✅ Conexión a base de datos establecida');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
