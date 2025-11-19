-- =============================================
-- Base de Datos: DICRI - Sistema de Gestión de Evidencias
-- Ministerio Público de Guatemala
-- =============================================

USE master;
GO

-- Crear base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'DICRI_DB')
BEGIN
    CREATE DATABASE DICRI_DB;
END
GO

USE DICRI_DB;
GO

-- =============================================
-- TABLA: Roles
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Roles] (
        [id_rol] INT IDENTITY(1,1) PRIMARY KEY,
        [nombre_rol] NVARCHAR(50) NOT NULL UNIQUE,
        [descripcion] NVARCHAR(255),
        [fecha_creacion] DATETIME DEFAULT GETDATE(),
        [activo] BIT DEFAULT 1
    );
END
GO

-- =============================================
-- TABLA: Usuarios
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Usuarios] (
        [id_usuario] INT IDENTITY(1,1) PRIMARY KEY,
        [nombre] NVARCHAR(100) NOT NULL,
        [apellido] NVARCHAR(100) NOT NULL,
        [email] NVARCHAR(255) NOT NULL UNIQUE,
        [username] NVARCHAR(50) NOT NULL UNIQUE,
        [password_hash] NVARCHAR(255) NOT NULL,
        [id_rol] INT NOT NULL,
        [fecha_creacion] DATETIME DEFAULT GETDATE(),
        [ultima_conexion] DATETIME,
        [activo] BIT DEFAULT 1,
        FOREIGN KEY ([id_rol]) REFERENCES [dbo].[Roles]([id_rol])
    );
END
GO

-- =============================================
-- TABLA: Estados de Expediente
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Estados_Expediente]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Estados_Expediente] (
        [id_estado] INT IDENTITY(1,1) PRIMARY KEY,
        [nombre_estado] NVARCHAR(50) NOT NULL UNIQUE,
        [descripcion] NVARCHAR(255),
        [color] NVARCHAR(20),
        [activo] BIT DEFAULT 1
    );
END
GO

-- =============================================
-- TABLA: Expedientes
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Expedientes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Expedientes] (
        [id_expediente] INT IDENTITY(1,1) PRIMARY KEY,
        [numero_expediente] NVARCHAR(50) NOT NULL UNIQUE,
        [titulo] NVARCHAR(255) NOT NULL,
        [descripcion] NVARCHAR(MAX),
        [fecha_incidente] DATETIME NOT NULL,
        [lugar_incidente] NVARCHAR(255),
        [id_tecnico_registra] INT NOT NULL,
        [id_estado] INT NOT NULL DEFAULT 1,
        [fecha_registro] DATETIME DEFAULT GETDATE(),
        [fecha_ultima_modificacion] DATETIME,
        [activo] BIT DEFAULT 1,
        FOREIGN KEY ([id_tecnico_registra]) REFERENCES [dbo].[Usuarios]([id_usuario]),
        FOREIGN KEY ([id_estado]) REFERENCES [dbo].[Estados_Expediente]([id_estado])
    );
END
GO

-- =============================================
-- TABLA: Indicios
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Indicios]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Indicios] (
        [id_indicio] INT IDENTITY(1,1) PRIMARY KEY,
        [id_expediente] INT NOT NULL,
        [numero_indicio] NVARCHAR(50) NOT NULL,
        [nombre_objeto] NVARCHAR(255) NOT NULL,
        [descripcion] NVARCHAR(MAX),
        [color] NVARCHAR(100),
        [tamano] NVARCHAR(100),
        [peso] NVARCHAR(100),
        [ubicacion_encontrado] NVARCHAR(255),
        [observaciones] NVARCHAR(MAX),
        [id_tecnico_registra] INT NOT NULL,
        [fecha_registro] DATETIME DEFAULT GETDATE(),
        [fecha_ultima_modificacion] DATETIME,
        [activo] BIT DEFAULT 1,
        FOREIGN KEY ([id_expediente]) REFERENCES [dbo].[Expedientes]([id_expediente]),
        FOREIGN KEY ([id_tecnico_registra]) REFERENCES [dbo].[Usuarios]([id_usuario]),
        CONSTRAINT UQ_Expediente_NumeroIndicio UNIQUE ([id_expediente], [numero_indicio])
    );
END
GO

-- =============================================
-- TABLA: Aprobaciones
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Aprobaciones]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Aprobaciones] (
        [id_aprobacion] INT IDENTITY(1,1) PRIMARY KEY,
        [id_expediente] INT NOT NULL,
        [id_coordinador] INT NOT NULL,
        [aprobado] BIT NOT NULL,
        [justificacion] NVARCHAR(MAX),
        [fecha_revision] DATETIME DEFAULT GETDATE(),
        FOREIGN KEY ([id_expediente]) REFERENCES [dbo].[Expedientes]([id_expediente]),
        FOREIGN KEY ([id_coordinador]) REFERENCES [dbo].[Usuarios]([id_usuario])
    );
END
GO

-- =============================================
-- TABLA: Auditoria
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auditoria]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Auditoria] (
        [id_auditoria] INT IDENTITY(1,1) PRIMARY KEY,
        [tabla_afectada] NVARCHAR(100) NOT NULL,
        [id_registro] INT NOT NULL,
        [accion] NVARCHAR(50) NOT NULL,
        [id_usuario] INT,
        [fecha_accion] DATETIME DEFAULT GETDATE(),
        [datos_anteriores] NVARCHAR(MAX),
        [datos_nuevos] NVARCHAR(MAX),
        FOREIGN KEY ([id_usuario]) REFERENCES [dbo].[Usuarios]([id_usuario])
    );
END
GO

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar Roles
IF NOT EXISTS (SELECT * FROM [dbo].[Roles])
BEGIN
    INSERT INTO [dbo].[Roles] ([nombre_rol], [descripcion]) VALUES
    ('Técnico', 'Personal técnico encargado del registro de expedientes e indicios'),
    ('Coordinador', 'Personal coordinador encargado de aprobar o rechazar expedientes'),
    ('Administrador', 'Administrador del sistema con acceso total');
END
GO

-- Insertar Estados de Expediente
IF NOT EXISTS (SELECT * FROM [dbo].[Estados_Expediente])
BEGIN
    INSERT INTO [dbo].[Estados_Expediente] ([nombre_estado], [descripcion], [color]) VALUES
    ('En Registro', 'Expediente en proceso de registro de indicios', '#FFA500'),
    ('En Revisión', 'Expediente completo, pendiente de aprobación', '#0000FF'),
    ('Aprobado', 'Expediente aprobado por coordinador', '#008000'),
    ('Rechazado', 'Expediente rechazado, requiere correcciones', '#FF0000');
END
GO

-- Insertar Usuarios de prueba
IF NOT EXISTS (SELECT * FROM [dbo].[Usuarios])
BEGIN
    -- Password por defecto para todos: 123456
    -- Hash bcrypt válido generado para "123456"
    INSERT INTO [dbo].[Usuarios] ([nombre], [apellido], [email], [username], [password_hash], [id_rol]) VALUES
    ('Juan', 'Pérez', 'juan.perez@mp.gob.gt', 'tecnico', '$2b$10$c4APzSJQm9dqhDyD.Qvmxu4hY7ThMhVtcxolnPo.K4SIM/RjTxsFW', 1),
    ('María', 'González', 'maria.gonzalez@mp.gob.gt', 'coordinador', '$2b$10$c4APzSJQm9dqhDyD.Qvmxu4hY7ThMhVtcxolnPo.K4SIM/RjTxsFW', 2),
    ('Carlos', 'Ramírez', 'carlos.ramirez@mp.gob.gt', 'admin', '$2b$10$c4APzSJQm9dqhDyD.Qvmxu4hY7ThMhVtcxolnPo.K4SIM/RjTxsFW', 3);
END
GO

PRINT 'Schema creado exitosamente';
