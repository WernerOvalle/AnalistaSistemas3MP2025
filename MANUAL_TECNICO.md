# Manual Técnico - Sistema DICRI
## Sistema de Gestión de Expedientes e Indicios Criminales

---

## Tabla de Contenidos
1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Instalación y Configuración](#3-instalación-y-configuración)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Base de Datos](#5-base-de-datos)
6. [Backend (API)](#6-backend-api)
7. [Frontend (Interfaz)](#7-frontend-interfaz)
8. [Guía de Desarrollo](#8-guía-de-desarrollo)
9. [Testing](#9-testing)
10. [Deployment](#10-deployment)
11. [Troubleshooting](#11-troubleshooting)
12. [Capturas de Pantalla](#12-capturas-de-pantalla)

---

## 1. Introducción

### 1.1 Descripción del Sistema
El Sistema DICRI es una aplicación web para la gestión de expedientes criminales e indicios para el Ministerio Público de Guatemala. Permite a los técnicos registrar expedientes y evidencias, y a los coordinadores aprobar o rechazar estos registros.

### 1.2 Tecnologías Utilizadas
- **Frontend**: React 19.2.0, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js 20, Express 5.1.0, TypeScript
- **Base de Datos**: SQL Server 2022
- **DevOps**: Docker, Docker Compose
- **Autenticación**: JWT (JSON Web Tokens)
- **Package Manager**: pnpm 10.22.0

### 1.3 Arquitectura
```
Cliente (Navegador) → Frontend (React) → Backend (Express) → SQL Server
                     Port 3002          Port 3001          Port 1434
```

---

## 2. Requisitos del Sistema

### 2.1 Hardware Mínimo
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disco**: 10 GB disponibles
- **Red**: Conexión a internet (para descargar imágenes Docker)

### 2.2 Software Requerido
- **Docker Desktop** (Windows/Mac) o **Docker Engine** (Linux)
  - Versión mínima: 20.10.x
- **Node.js** 20.x o superior (solo para desarrollo local sin Docker)
- **pnpm** (se instala via corepack)

### 2.3 Puertos Necesarios
Los siguientes puertos deben estar disponibles:
- `1434`: SQL Server
- `3001`: Backend API
- `3002`: Frontend

---

## 3. Instalación y Configuración

### 3.1 Clonar el Repositorio
```bash
git clone <repository-url>
cd proyecto-prueba-tecnica
```

### 3.2 Instalación de pnpm
```bash
# Habilitar corepack
corepack enable

# Instalar pnpm
corepack prepare pnpm@latest --activate

# Verificar instalación
pnpm --version
```

### 3.3 Configuración de Docker

#### 3.3.1 Estructura docker-compose.yml
```yaml
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - SA_PASSWORD=YourStrong@Password123
      - ACCEPT_EULA=Y
    ports:
      - "1434:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
      - ./backend/database:/scripts

  backend:
    build: ./backend
    ports:
      - "3001:3000"
    environment:
      - DB_SERVER=sqlserver
      - DB_PASSWORD=YourStrong@Password123
    depends_on:
      - sqlserver

  frontend:
    build: ./frontend
    ports:
      - "3002:5173"
    depends_on:
      - backend
```

### 3.4 Iniciar el Sistema
```bash
# Construir e iniciar todos los contenedores
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Verificar estado de contenedores
docker-compose ps
```

### 3.5 Verificar Instalación
1. **Frontend**: Navegar a http://localhost:3002
2. **Backend**: Navegar a http://localhost:3001/health
3. **Database**: Conectar con SQL Server Management Studio a `localhost:1434`

---

## 4. Estructura del Proyecto

### 4.1 Árbol de Directorios
```
proyecto-prueba-tecnica/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── expedienteController.ts
│   │   │   ├── indicioController.ts
│   │   │   ├── aprobacionController.ts
│   │   │   └── reporteController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── expedienteRoutes.ts
│   │   │   ├── indicioRoutes.ts
│   │   │   ├── aprobacionRoutes.ts
│   │   │   └── reporteRoutes.ts
│   │   └── server.ts
│   ├── database/
│   │   ├── schema.sql
│   │   ├── stored_procedures.sql
│   │   └── init-db.sh
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Expedientes.tsx
│   │   │   ├── ExpedienteDetalle.tsx
│   │   │   ├── NuevoExpediente.tsx
│   │   │   ├── Aprobaciones.tsx
│   │   │   └── Reportes.tsx
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── expedienteService.ts
│   │   │   ├── indicioService.ts
│   │   │   ├── aprobacionService.ts
│   │   │   └── reporteService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml
├── ARQUITECTURA.md
├── DIAGRAMA_ER.md
└── MANUAL_TECNICO.md
```

---

## 5. Base de Datos

### 5.1 Esquema de Tablas

#### Estructura de Roles
```sql
CREATE TABLE [dbo].[Roles] (
    [id_rol] INT IDENTITY(1,1) PRIMARY KEY,
    [nombre_rol] NVARCHAR(50) NOT NULL UNIQUE,
    [descripcion] NVARCHAR(255)
);
-- Datos: Técnico, Coordinador, Administrador
```

#### Estructura de Usuarios
```sql
CREATE TABLE [dbo].[Usuarios] (
    [id_usuario] INT IDENTITY(1,1) PRIMARY KEY,
    [nombre] NVARCHAR(100) NOT NULL,
    [username] NVARCHAR(50) NOT NULL UNIQUE,
    [password_hash] NVARCHAR(255) NOT NULL,
    [id_rol] INT FOREIGN KEY REFERENCES Roles(id_rol)
);
-- Usuario predeterminado: tecnico/123456
```

#### Estructura de Expedientes
```sql
CREATE TABLE [dbo].[Expedientes] (
    [id_expediente] INT IDENTITY(1,1) PRIMARY KEY,
    [numero_expediente] NVARCHAR(50) NOT NULL UNIQUE,
    [titulo] NVARCHAR(255) NOT NULL,
    [id_estado] INT FOREIGN KEY REFERENCES Estados_Expediente(id_estado),
    [id_tecnico_registra] INT FOREIGN KEY REFERENCES Usuarios(id_usuario)
);
```

### 5.2 Stored Procedures

#### Principales SPs y su función:
```sql
-- Autenticación
sp_AutenticarUsuario

-- Expedientes
sp_CrearExpediente
sp_ObtenerExpedientes
sp_ObtenerExpedientePorId
sp_ActualizarEstadoExpediente
sp_EnviarExpedienteARevision

-- Indicios
sp_CrearIndicio
sp_ObtenerIndiciosPorExpediente
sp_ActualizarIndicio
sp_EliminarIndicio

-- Aprobaciones
sp_CrearAprobacion
sp_ObtenerAprobacionesPorExpediente

-- Reportes
sp_ReporteExpedientesPorEstado
sp_ReporteAprobaciones
sp_EstadisticasGenerales
```

### 5.3 Stored Procedure - Crear Expediente

```sql
CREATE OR ALTER PROCEDURE sp_CrearExpediente
    @numero_expediente NVARCHAR(50),
    @titulo NVARCHAR(255),
    @id_tecnico_registra INT
AS
BEGIN
    INSERT INTO Expedientes (numero_expediente, titulo, id_tecnico_registra, id_estado)
    VALUES (@numero_expediente, @titulo, @id_tecnico_registra, 1);
    
    DECLARE @id INT = SCOPE_IDENTITY();
    INSERT INTO Auditoria (tabla_afectada, id_registro, accion, id_usuario)
    VALUES ('Expedientes', @id, 'INSERT', @id_tecnico_registra);
    
    SELECT @id AS id_expediente;
END
```

---

## 6. Backend (API)

### 6.1 Configuración de Database Connection

**Archivo**: `backend/src/config/database.ts`

```typescript
import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'DICRI_DB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}
```

### 6.2 Middleware de Autenticación

**Archivo**: `backend/src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id_usuario: number;
    username: string;
    nombre_rol: string;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Token inválido' });
      return;
    }
    (req as AuthRequest).user = user as any;
    next();
  });
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
    
    if (!user || !roles.includes(user.nombre_rol)) {
      res.status(403).json({ 
        error: 'No tienes permisos para esta acción' 
      });
      return;
    }
    next();
  };
};
```

### 6.3 Controller - Expedientes

**Archivo**: `backend/src/controllers/expedienteController.ts`

```typescript
import { Request, Response } from 'express';
import { getPool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const crearExpediente = async (
  req: Request, 
  res: Response
): Promise<void> => {
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

    res.status(201).json({
      message: 'Expediente creado exitosamente',
      id_expediente: result.recordset[0].id_expediente,
    });
  } catch (error: any) {
    console.error('Error al crear expediente:', error);
    res.status(500).json({ error: 'Error al crear expediente' });
  }
};
```

### 6.4 Routes - Definición de Endpoints

**Archivo**: `backend/src/routes/expedienteRoutes.ts`

```typescript
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
  '/:id/enviar-revision',
  authenticateToken,
  authorize('Técnico', 'Coordinador', 'Administrador'),
  expedienteController.enviarARevision
);

export default router;
```

### 6.5 Server Entry Point

**Archivo**: `backend/src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import expedienteRoutes from './routes/expedienteRoutes';
import indicioRoutes from './routes/indicioRoutes';
import aprobacionRoutes from './routes/aprobacionRoutes';
import reporteRoutes from './routes/reporteRoutes';
import { getPool } from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/indicios', indicioRoutes);
app.use('/api/aprobaciones', aprobacionRoutes);
app.use('/api/reportes', reporteRoutes);

// Database connection
getPool()
  .then(() => {
    console.log('✅ Conectado a SQL Server');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1);
  });
```

---

## 7. Frontend (Interfaz)

### 7.1 Configuración de Axios (API Client)

**Archivo**: `frontend/src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 7.2 Context API - Autenticación

**Archivo**: `frontend/src/context/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import type { Usuario } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsuario = localStorage.getItem('usuario');
    
    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const data = await authService.login(username, password);
    setToken(data.token);
    setUsuario(data.usuario);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const hasRole = (role: string) => {
    return usuario?.nombre_rol === role;
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 7.3 Página de Login

**Archivo**: `frontend/src/pages/Login.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema DICRI</h1>
          <p className="text-gray-600 mt-2">Gestión de Expedientes Criminales</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 7.4 Dashboard y Páginas Principales

**Dashboard** (`frontend/src/pages/Dashboard.tsx`):
- Muestra estadísticas: total expedientes, en revisión, aprobados, rechazados
- Gráficos con recharts para visualización de datos
- Cards con iconos de lucide-react

**Expedientes** (`frontend/src/pages/Expedientes.tsx`):
- Lista paginada de expedientes con filtros por estado
- Tabla con columnas: número, título, técnico, estado, fecha
- Botón para crear nuevo expediente

**Nuevo Expediente** (`frontend/src/pages/NuevoExpediente.tsx`):
```typescript
const crearExpediente = async (e: FormEvent) => {
  e.preventDefault();
  const data = { numero_expediente, titulo, descripcion, fecha_incidente, lugar_incidente };
  await expedienteService.crear(data);
  navigate('/expedientes');
};
```

**Detalle de Expediente** (`frontend/src/pages/ExpedienteDetalle.tsx`):
- Muestra información completa del expediente
- Lista de indicios asociados
- Modal para agregar nuevos indicios:
```typescript
const handleAgregarIndicio = async () => {
  await indicioService.crear(id, nuevoIndicio);
  setShowModal(false);
  cargarExpediente();
};
```
- Botón "Enviar a Revisión" para técnicos

**Aprobaciones** (`frontend/src/pages/Aprobaciones.tsx`):
- Lista de expedientes "En Revisión"
- Modal para aprobar/rechazar:
```typescript
const handleAprobar = async () => {
  await aprobacionService.aprobar(expediente.id_expediente);
};
const handleRechazar = async () => {
  await aprobacionService.rechazar(expediente.id_expediente, justificacion);
};
```

**Reportes** (`frontend/src/pages/Reportes.tsx`):
- Estadísticas generales con gráficos
- Filtros por rango de fechas
- Exportación de datos (futuro)

---

## 8. Guía de Desarrollo

### 8.1 Agregar Nueva Tabla

1. **Actualizar schema.sql**
```sql
CREATE TABLE [dbo].[NuevaTabla] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [campo] NVARCHAR(255) NOT NULL,
    [activo] BIT DEFAULT 1
);
```

2. **Crear Stored Procedures**
```sql
CREATE OR ALTER PROCEDURE sp_CrearNuevaTabla
    @campo NVARCHAR(255)
AS BEGIN
    INSERT INTO NuevaTabla (campo) VALUES (@campo);
    SELECT SCOPE_IDENTITY() AS id;
END
```

3. **Ejecutar en SQL Server**
```bash
docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Password123' \
  -d DICRI_DB -C -i /scripts/schema.sql
```

### 8.2 Agregar Nuevo Endpoint

1. **Crear Controller** (`backend/src/controllers/nuevaController.ts`)
```typescript
export const crear = async (req: Request, res: Response) => {
  // Lógica aquí
};
```

2. **Crear Route** (`backend/src/routes/nuevaRoutes.ts`)
```typescript
import express from 'express';
import * as nuevaController from '../controllers/nuevaController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
router.post('/', authenticateToken, nuevaController.crear);
export default router;
```

3. **Registrar en server.ts**
```typescript
import nuevaRoutes from './routes/nuevaRoutes';
app.use('/api/nueva', nuevaRoutes);
```

### 8.3 Agregar Nueva Página

1. **Crear Componente** (`frontend/src/pages/NuevaPagina.tsx`)
```typescript
export default function NuevaPagina() {
  return <div>Nueva Página</div>;
}
```

2. **Agregar Ruta** (`frontend/src/App.tsx`)
```typescript
<Route 
  path="/nueva" 
  element={<ProtectedRoute><NuevaPagina /></ProtectedRoute>} 
/>
```

3. **Crear Service** (`frontend/src/services/nuevaService.ts`)
```typescript
import api from './api';

export const nuevaService = {
  async crear(data: any) {
    const response = await api.post('/nueva', data);
    return response.data;
  }
};
```

---

## 9. Testing

### 9.1 Flujo de Pruebas Completo

**1. Login** (`tecnico` / `123456`)

**2. Crear Expediente**
```bash
POST /api/expedientes
{
  "numero_expediente": "EXP-2024-001",
  "titulo": "Caso Prueba",
  "fecha_incidente": "2024-11-19T10:00:00",
  "lugar_incidente": "Guatemala"
}
```

**3. Agregar Indicio**
```bash
POST /api/indicios
{
  "id_expediente": 1,
  "numero_indicio": "IND-001",
  "nombre_objeto": "Arma de fuego",
  "descripcion": "Pistola calibre 9mm"
}
```

**4. Enviar a Revisión**
```bash
PUT /api/expedientes/1/enviar-revision
```

**5. Login Coordinador** (`coordinador` / `123456`)

**6. Aprobar Expediente**
```bash
POST /api/aprobaciones/aprobar/1
```

### 9.2 Verificación con cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tecnico","password":"123456"}'

# Listar expedientes
curl http://localhost:3001/api/expedientes \
  -H "Authorization: Bearer TOKEN"
```

---

## 10. Deployment

### 10.1 Producción con Docker

1. **Crear docker-compose.prod.yml**
```yaml
version: '3.8'
services:
  sqlserver:
    restart: always
    environment:
      - SA_PASSWORD=${DB_PASSWORD}
  
  backend:
    restart: always
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
  
  frontend:
    restart: always
```

2. **Ejecutar en producción**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 10.2 Variables de Entorno

Crear archivo `.env` en la raíz:
```env
DB_SERVER=sqlserver
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourStrong@Password123
DB_NAME=DICRI_DB
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=production
```

### 10.3 Backup de Base de Datos

```bash
# Backup
docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Password123' \
  -Q "BACKUP DATABASE DICRI_DB TO DISK='/var/opt/mssql/backup/dicri_db.bak'"

# Copiar backup al host
docker cp dicri_sqlserver:/var/opt/mssql/backup/dicri_db.bak ./backup/

# Restaurar
docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Password123' \
  -Q "RESTORE DATABASE DICRI_DB FROM DISK='/var/opt/mssql/backup/dicri_db.bak' WITH REPLACE"
```

---

## 11. Troubleshooting

### 11.1 Problemas Comunes

#### Error: "Puerto en uso"
```bash
# Windows - Liberar puerto
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Cambiar puerto en docker-compose.yml
ports:
  - "3003:3000"  # Usar 3003 en lugar de 3001
```

#### Error: "Cannot connect to SQL Server"
```bash
# Verificar estado del contenedor
docker-compose ps

# Ver logs de SQL Server
docker-compose logs sqlserver

# Reiniciar SQL Server
docker-compose restart sqlserver
```

#### Error: "Token inválido"
```bash
# Limpiar localStorage en navegador
localStorage.clear()

# O hacer logout y login nuevamente
```

### 11.2 Logs y Debugging

```bash
# Ver todos los logs
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f sqlserver

# Logs con timestamp
docker-compose logs -f --timestamps backend
```

### 11.3 Reiniciar Sistema Completo

```bash
# Detener todo
docker-compose down

# Eliminar volúmenes (CUIDADO: borra la BD)
docker-compose down -v

# Reconstruir e iniciar
docker-compose up -d --build
```

---

## 12. Resumen de Comandos Esenciales

### Inicialización
```bash
# Clonar e iniciar
git clone <repo>
cd proyecto-prueba-tecnica
docker-compose up -d

# Verificar
docker-compose ps
docker-compose logs -f backend
```

### Desarrollo
```bash
# Ver logs
docker-compose logs -f [backend|frontend|sqlserver]

# Reiniciar servicio
docker-compose restart backend

# Reconstruir
docker-compose up -d --build

# Detener todo
docker-compose down
```

### Base de Datos
```bash
# Conectar a SQL Server
docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Password123' -d DICRI_DB -C

# Backup
docker-compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost \
  -U sa -P 'YourStrong@Password123' -C \
  -Q "BACKUP DATABASE DICRI_DB TO DISK='/var/opt/mssql/backup/dicri.bak'"

# Copiar backup
docker cp dicri_sqlserver:/var/opt/mssql/backup/dicri.bak ./
```

### Testing API
```bash
# PowerShell - Login
$body = @{username="tecnico"; password="123456"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
  -Method Post -Body $body -ContentType "application/json"
$token = $response.token

# Crear expediente
$headers = @{Authorization="Bearer $token"}
$exp = @{
  numero_expediente="EXP-TEST"
  titulo="Prueba"
  fecha_incidente="2024-11-19T10:00:00"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/expedientes" `
  -Method Post -Body $exp -Headers $headers -ContentType "application/json"
```

---

## Apéndices

### A. Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| tecnico | 123456 | Técnico |
| coordinador | 123456 | Coordinador |
| admin | 123456 | Administrador |

### B. Endpoints API

**Autenticación**
- POST `/api/auth/login` - Login

**Expedientes**
- GET `/api/expedientes` - Listar todos
- GET `/api/expedientes/:id` - Obtener por ID
- POST `/api/expedientes` - Crear nuevo
- PUT `/api/expedientes/:id/enviar-revision` - Enviar a revisión

**Indicios**
- GET `/api/indicios/expediente/:id` - Listar por expediente
- POST `/api/indicios` - Crear indicio
- PUT `/api/indicios/:id` - Actualizar
- DELETE `/api/indicios/:id` - Eliminar (soft delete)

**Aprobaciones**
- GET `/api/aprobaciones` - Listar expedientes en revisión
- POST `/api/aprobaciones/aprobar/:id` - Aprobar expediente
- POST `/api/aprobaciones/rechazar/:id` - Rechazar con justificación

**Reportes**
- GET `/api/reportes/estadisticas` - Estadísticas generales
- GET `/api/reportes/expedientes-estado` - Por estado
- GET `/api/reportes/aprobaciones` - Historial aprobaciones

### C. Tecnologías y Versiones

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Frontend | React | 19.2.0 |
| | Vite | 5.4.21 |
| | TypeScript | 5.9.3 |
| | Tailwind CSS | 3.4.18 |
| Backend | Node.js | 20-alpine |
| | Express | 5.1.0 |
| | mssql | 12.1.0 |
| Database | SQL Server | 2022 |
| DevOps | Docker Compose | 3.8 |
| Package Manager | pnpm | 10.22.0 |

### D. Estructura de Estados

**Estados de Expediente**:
1. En Registro (id=1) - Creación inicial
2. En Revisión (id=2) - Enviado por técnico
3. Aprobado (id=3) - Aprobado por coordinador
4. Rechazado (id=4) - Rechazado con justificación

**Flujo de Estados**:
```
Crear → En Registro → Enviar a Revisión → En Revisión
                                              ↓
                                         Aprobar / Rechazar
                                              ↓
                                    Aprobado / Rechazado
```

---

**Versión**: 1.0  
**Fecha**: Noviembre 2025  
**Sistema**: DICRI - Gestión de Expedientes Criminales  
**Ministerio Público de Guatemala**
