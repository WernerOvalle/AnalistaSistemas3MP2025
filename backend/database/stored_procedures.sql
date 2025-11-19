-- =============================================
-- PROCEDIMIENTOS ALMACENADOS
-- Sistema de Gestión de Evidencias - DICRI
-- =============================================

USE DICRI_DB;
GO

-- =============================================
-- USUARIOS
-- =============================================

-- SP: Autenticar Usuario
CREATE OR ALTER PROCEDURE sp_AutenticarUsuario
    @username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email,
        u.username,
        u.password_hash,
        u.id_rol,
        r.nombre_rol,
        u.activo
    FROM [dbo].[Usuarios] u
    INNER JOIN [dbo].[Roles] r ON u.id_rol = r.id_rol
    WHERE u.username = @username AND u.activo = 1;
END
GO

-- SP: Crear Usuario
CREATE OR ALTER PROCEDURE sp_CrearUsuario
    @nombre NVARCHAR(100),
    @apellido NVARCHAR(100),
    @email NVARCHAR(255),
    @username NVARCHAR(50),
    @password_hash NVARCHAR(255),
    @id_rol INT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO [dbo].[Usuarios] 
        ([nombre], [apellido], [email], [username], [password_hash], [id_rol])
    VALUES 
        (@nombre, @apellido, @email, @username, @password_hash, @id_rol);
    
    SELECT SCOPE_IDENTITY() AS id_usuario;
END
GO

-- SP: Obtener Todos los Usuarios
CREATE OR ALTER PROCEDURE sp_ObtenerUsuarios
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email,
        u.username,
        u.id_rol,
        r.nombre_rol,
        u.fecha_creacion,
        u.ultima_conexion,
        u.activo
    FROM [dbo].[Usuarios] u
    INNER JOIN [dbo].[Roles] r ON u.id_rol = r.id_rol
    WHERE u.activo = 1
    ORDER BY u.nombre, u.apellido;
END
GO

-- =============================================
-- EXPEDIENTES
-- =============================================

-- SP: Crear Expediente
CREATE OR ALTER PROCEDURE sp_CrearExpediente
    @numero_expediente NVARCHAR(50),
    @titulo NVARCHAR(255),
    @descripcion NVARCHAR(MAX),
    @fecha_incidente DATETIME,
    @lugar_incidente NVARCHAR(255),
    @id_tecnico_registra INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO [dbo].[Expedientes] 
            ([numero_expediente], [titulo], [descripcion], [fecha_incidente], 
             [lugar_incidente], [id_tecnico_registra], [id_estado])
        VALUES 
            (@numero_expediente, @titulo, @descripcion, @fecha_incidente, 
             @lugar_incidente, @id_tecnico_registra, 1);
        
        DECLARE @id_expediente INT = SCOPE_IDENTITY();
        
        -- Registrar en auditoría
        INSERT INTO [dbo].[Auditoria] 
            ([tabla_afectada], [id_registro], [accion], [id_usuario], [datos_nuevos])
        VALUES 
            ('Expedientes', @id_expediente, 'INSERT', @id_tecnico_registra, 
             CONCAT('Expediente: ', @numero_expediente));
        
        COMMIT TRANSACTION;
        
        SELECT @id_expediente AS id_expediente;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- SP: Obtener Expedientes con filtros
CREATE OR ALTER PROCEDURE sp_ObtenerExpedientes
    @id_estado INT = NULL,
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL,
    @id_tecnico INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        e.id_expediente,
        e.numero_expediente,
        e.titulo,
        e.descripcion,
        e.fecha_incidente,
        e.lugar_incidente,
        e.id_tecnico_registra,
        CONCAT(u.nombre, ' ', u.apellido) AS tecnico_nombre,
        e.id_estado,
        est.nombre_estado,
        est.color AS estado_color,
        e.fecha_registro,
        e.fecha_ultima_modificacion,
        (SELECT COUNT(*) FROM [dbo].[Indicios] WHERE id_expediente = e.id_expediente AND activo = 1) AS total_indicios
    FROM [dbo].[Expedientes] e
    INNER JOIN [dbo].[Usuarios] u ON e.id_tecnico_registra = u.id_usuario
    INNER JOIN [dbo].[Estados_Expediente] est ON e.id_estado = est.id_estado
    WHERE 
        e.activo = 1
        AND (@id_estado IS NULL OR e.id_estado = @id_estado)
        AND (@fecha_inicio IS NULL OR e.fecha_registro >= @fecha_inicio)
        AND (@fecha_fin IS NULL OR e.fecha_registro <= @fecha_fin)
        AND (@id_tecnico IS NULL OR e.id_tecnico_registra = @id_tecnico)
    ORDER BY e.fecha_registro DESC;
END
GO

-- SP: Obtener Expediente por ID
CREATE OR ALTER PROCEDURE sp_ObtenerExpedientePorId
    @id_expediente INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        e.id_expediente,
        e.numero_expediente,
        e.titulo,
        e.descripcion,
        e.fecha_incidente,
        e.lugar_incidente,
        e.id_tecnico_registra,
        CONCAT(u.nombre, ' ', u.apellido) AS tecnico_nombre,
        u.email AS tecnico_email,
        e.id_estado,
        est.nombre_estado,
        est.color AS estado_color,
        e.fecha_registro,
        e.fecha_ultima_modificacion
    FROM [dbo].[Expedientes] e
    INNER JOIN [dbo].[Usuarios] u ON e.id_tecnico_registra = u.id_usuario
    INNER JOIN [dbo].[Estados_Expediente] est ON e.id_estado = est.id_estado
    WHERE e.id_expediente = @id_expediente AND e.activo = 1;
END
GO

-- SP: Actualizar Estado de Expediente
CREATE OR ALTER PROCEDURE sp_ActualizarEstadoExpediente
    @id_expediente INT,
    @id_estado INT,
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @estado_anterior INT;
        SELECT @estado_anterior = id_estado FROM [dbo].[Expedientes] WHERE id_expediente = @id_expediente;
        
        UPDATE [dbo].[Expedientes]
        SET 
            [id_estado] = @id_estado,
            [fecha_ultima_modificacion] = GETDATE()
        WHERE [id_expediente] = @id_expediente;
        
        -- Registrar en auditoría
        INSERT INTO [dbo].[Auditoria] 
            ([tabla_afectada], [id_registro], [accion], [id_usuario], [datos_anteriores], [datos_nuevos])
        VALUES 
            ('Expedientes', @id_expediente, 'UPDATE_ESTADO', @id_usuario, 
             CAST(@estado_anterior AS NVARCHAR), CAST(@id_estado AS NVARCHAR));
        
        COMMIT TRANSACTION;
        
        SELECT 1 AS resultado;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- INDICIOS
-- =============================================

-- SP: Crear Indicio
CREATE OR ALTER PROCEDURE sp_CrearIndicio
    @id_expediente INT,
    @numero_indicio NVARCHAR(50),
    @nombre_objeto NVARCHAR(255),
    @descripcion NVARCHAR(MAX),
    @color NVARCHAR(100),
    @tamano NVARCHAR(100),
    @peso NVARCHAR(100),
    @ubicacion_encontrado NVARCHAR(255),
    @observaciones NVARCHAR(MAX),
    @id_tecnico_registra INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO [dbo].[Indicios]
            ([id_expediente], [numero_indicio], [nombre_objeto], [descripcion], 
             [color], [tamano], [peso], [ubicacion_encontrado], [observaciones], [id_tecnico_registra])
        VALUES
            (@id_expediente, @numero_indicio, @nombre_objeto, @descripcion, 
             @color, @tamano, @peso, @ubicacion_encontrado, @observaciones, @id_tecnico_registra);
        
        DECLARE @id_indicio INT = SCOPE_IDENTITY();
        
        -- Registrar en auditoría
        INSERT INTO [dbo].[Auditoria]
            ([tabla_afectada], [id_registro], [accion], [id_usuario], [datos_nuevos])
        VALUES
            ('Indicios', @id_indicio, 'INSERT', @id_tecnico_registra, 
             CONCAT('Indicio: ', @numero_indicio, ' - Expediente: ', @id_expediente));
        
        COMMIT TRANSACTION;
        
        SELECT 1 AS resultado;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- SP: Enviar Expediente a Revisión
CREATE OR ALTER PROCEDURE sp_EnviarExpedienteARevision
    @id_expediente INT,
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Cambiar estado a "En Revisión" (id_estado = 2)
        UPDATE [dbo].[Expedientes]
        SET 
            [id_estado] = 2,
            [fecha_ultima_modificacion] = GETDATE()
        WHERE [id_expediente] = @id_expediente AND [id_estado] = 1;
        
        -- Registrar en auditoría
        INSERT INTO [dbo].[Auditoria] 
            ([tabla_afectada], [id_registro], [accion], [id_usuario], [datos_nuevos])
        VALUES 
            ('Expedientes', @id_expediente, 'ENVIAR_REVISION', @id_usuario, 
             'Estado cambiado a En Revisión');
        
        COMMIT TRANSACTION;
        
        SELECT 1 AS resultado;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- SP: Obtener Indicios por Expediente
CREATE OR ALTER PROCEDURE sp_ObtenerIndiciosPorExpediente
    @id_expediente INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        i.id_indicio,
        i.id_expediente,
        i.numero_indicio,
        i.nombre_objeto,
        i.descripcion,
        i.color,
        i.tamano,
        i.peso,
        i.ubicacion_encontrado,
        i.observaciones,
        i.id_tecnico_registra,
        CONCAT(u.nombre, ' ', u.apellido) AS tecnico_nombre,
        i.fecha_registro,
        i.fecha_ultima_modificacion
    FROM [dbo].[Indicios] i
    INNER JOIN [dbo].[Usuarios] u ON i.id_tecnico_registra = u.id_usuario
    WHERE i.id_expediente = @id_expediente AND i.activo = 1
    ORDER BY i.numero_indicio;
END
GO

-- SP: Actualizar Indicio
CREATE OR ALTER PROCEDURE sp_ActualizarIndicio
    @id_indicio INT,
    @nombre_objeto NVARCHAR(255),
    @descripcion NVARCHAR(MAX),
    @color NVARCHAR(100),
    @tamano NVARCHAR(100),
    @peso NVARCHAR(100),
    @ubicacion_encontrado NVARCHAR(255),
    @observaciones NVARCHAR(MAX),
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[Indicios]
    SET 
        [nombre_objeto] = @nombre_objeto,
        [descripcion] = @descripcion,
        [color] = @color,
        [tamano] = @tamano,
        [peso] = @peso,
        [ubicacion_encontrado] = @ubicacion_encontrado,
        [observaciones] = @observaciones,
        [fecha_ultima_modificacion] = GETDATE()
    WHERE [id_indicio] = @id_indicio;
    
    SELECT 1 AS resultado;
END
GO

-- SP: Eliminar Indicio (soft delete)
CREATE OR ALTER PROCEDURE sp_EliminarIndicio
    @id_indicio INT,
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[Indicios]
    SET [activo] = 0
    WHERE [id_indicio] = @id_indicio;
    
    -- Registrar en auditoría
    INSERT INTO [dbo].[Auditoria]
        ([tabla_afectada], [id_registro], [accion], [id_usuario])
    VALUES
        ('Indicios', @id_indicio, 'DELETE', @id_usuario);
    
    SELECT 1 AS resultado;
END
GO

-- =============================================
-- APROBACIONES
-- =============================================

-- SP: Crear Aprobación/Rechazo
CREATE OR ALTER PROCEDURE sp_CrearAprobacion
    @id_expediente INT,
    @id_coordinador INT,
    @aprobado BIT,
    @justificacion NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insertar aprobación
        INSERT INTO [dbo].[Aprobaciones]
            ([id_expediente], [id_coordinador], [aprobado], [justificacion])
        VALUES
            (@id_expediente, @id_coordinador, @aprobado, @justificacion);
        
        DECLARE @id_aprobacion INT = SCOPE_IDENTITY();
        
        -- Actualizar estado del expediente
        DECLARE @nuevo_estado INT = CASE WHEN @aprobado = 1 THEN 3 ELSE 4 END;
        
        UPDATE [dbo].[Expedientes]
        SET 
            [id_estado] = @nuevo_estado,
            [fecha_ultima_modificacion] = GETDATE()
        WHERE [id_expediente] = @id_expediente;
        
        -- Registrar en auditoría
        INSERT INTO [dbo].[Auditoria]
            ([tabla_afectada], [id_registro], [accion], [id_usuario], [datos_nuevos])
        VALUES
            ('Aprobaciones', @id_aprobacion, 'INSERT', @id_coordinador, 
             CONCAT('Expediente: ', @id_expediente, ' - Aprobado: ', @aprobado));
        
        COMMIT TRANSACTION;
        
        SELECT @id_aprobacion AS id_aprobacion;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- SP: Obtener Aprobaciones por Expediente
CREATE OR ALTER PROCEDURE sp_ObtenerAprobacionesPorExpediente
    @id_expediente INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        a.id_aprobacion,
        a.id_expediente,
        a.id_coordinador,
        CONCAT(u.nombre, ' ', u.apellido) AS coordinador_nombre,
        a.aprobado,
        a.justificacion,
        a.fecha_revision
    FROM [dbo].[Aprobaciones] a
    INNER JOIN [dbo].[Usuarios] u ON a.id_coordinador = u.id_usuario
    WHERE a.id_expediente = @id_expediente
    ORDER BY a.fecha_revision DESC;
END
GO

-- =============================================
-- REPORTES Y ESTADÍSTICAS
-- =============================================

-- SP: Reporte de Expedientes por Estado
CREATE OR ALTER PROCEDURE sp_ReporteExpedientesPorEstado
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        est.nombre_estado,
        est.color,
        COUNT(e.id_expediente) AS total_expedientes,
        COUNT(DISTINCT e.id_tecnico_registra) AS tecnicos_involucrados
    FROM [dbo].[Estados_Expediente] est
    LEFT JOIN [dbo].[Expedientes] e ON est.id_estado = e.id_estado 
        AND e.activo = 1
        AND (@fecha_inicio IS NULL OR e.fecha_registro >= @fecha_inicio)
        AND (@fecha_fin IS NULL OR e.fecha_registro <= @fecha_fin)
    WHERE est.activo = 1
    GROUP BY est.id_estado, est.nombre_estado, est.color
    ORDER BY est.id_estado;
END
GO

-- SP: Reporte de Aprobaciones y Rechazos
CREATE OR ALTER PROCEDURE sp_ReporteAprobacionesRechazos
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        CASE WHEN a.aprobado = 1 THEN 'Aprobado' ELSE 'Rechazado' END AS resultado,
        COUNT(*) AS total,
        COUNT(DISTINCT a.id_coordinador) AS coordinadores_involucrados,
        AVG(DATEDIFF(HOUR, e.fecha_registro, a.fecha_revision)) AS promedio_horas_revision
    FROM [dbo].[Aprobaciones] a
    INNER JOIN [dbo].[Expedientes] e ON a.id_expediente = e.id_expediente
    WHERE 
        (@fecha_inicio IS NULL OR a.fecha_revision >= @fecha_inicio)
        AND (@fecha_fin IS NULL OR a.fecha_revision <= @fecha_fin)
    GROUP BY a.aprobado;
END
GO

-- SP: Estadísticas Generales
CREATE OR ALTER PROCEDURE sp_EstadisticasGenerales
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        (SELECT COUNT(*) FROM [dbo].[Expedientes] WHERE activo = 1) AS total_expedientes,
        (SELECT COUNT(*) FROM [dbo].[Indicios] WHERE activo = 1) AS total_indicios,
        (SELECT COUNT(*) FROM [dbo].[Usuarios] WHERE activo = 1 AND id_rol = 1) AS total_tecnicos,
        (SELECT COUNT(*) FROM [dbo].[Usuarios] WHERE activo = 1 AND id_rol = 2) AS total_coordinadores,
        (SELECT COUNT(*) FROM [dbo].[Expedientes] WHERE id_estado = 3 AND activo = 1) AS expedientes_aprobados,
        (SELECT COUNT(*) FROM [dbo].[Expedientes] WHERE id_estado = 4 AND activo = 1) AS expedientes_rechazados,
        (SELECT COUNT(*) FROM [dbo].[Expedientes] WHERE id_estado = 2 AND activo = 1) AS expedientes_en_revision;
END
GO

PRINT 'Procedimientos almacenados creados exitosamente';
