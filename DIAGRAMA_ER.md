# Diagrama ER - Sistema DICRI

## 1. Modelo Entidad-Relación

```
┌─────────────────────────┐
│        Roles            │
│─────────────────────────│
│ PK id_rol              │
│    nombre_rol (UNIQUE) │
│    descripcion         │
│    activo              │
└───────────┬─────────────┘
            │
            │ 1:N
            │
┌───────────▼─────────────┐         ┌────────────────────────┐
│       Usuarios          │    N:1  │  Estados_Expediente    │
│─────────────────────────│◄────────┤────────────────────────│
│ PK id_usuario          │         │ PK id_estado           │
│ FK id_rol              │         │    nombre_estado       │
│    nombre              │         │    descripcion         │
│    apellido            │         │    color               │
│    email (UNIQUE)      │         │    activo              │
│    username (UNIQUE)   │         └────────┬───────────────┘
│    password_hash       │                  │
│    activo              │                  │ 1:N
│    fecha_creacion      │                  │
└───────────┬─────────────┘         ┌────────▼───────────────┐
            │                       │    Expedientes         │
            │ 1:N                   │────────────────────────│
            │ (técnico_registra)    │ PK id_expediente       │
            └───────────────────────┤ FK id_tecnico_registra │
                                    │ FK id_estado           │
                        ┌───────────┤    numero_expediente   │
                        │           │    titulo              │
                        │           │    descripcion         │
                        │           │    fecha_incidente     │
                        │           │    lugar_incidente     │
                        │           │    fecha_registro      │
                        │           │    fecha_ult_modif     │
                        │           │    activo              │
                        │           └────────┬───────────────┘
                        │                    │
                        │ 1:N                │ 1:N
                        │                    │
         ┌──────────────▼───────┐   ┌───────▼───────────────┐
         │    Aprobaciones      │   │      Indicios         │
         │──────────────────────│   │───────────────────────│
         │ PK id_aprobacion     │   │ PK id_indicio         │
         │ FK id_expediente     │   │ FK id_expediente      │
         │ FK id_coordinador    │   │ FK id_tecnico_registra│
         │    aprobado          │   │    numero_indicio     │
         │    justificacion     │   │    nombre_objeto      │
         │    fecha_aprobacion  │   │    descripcion        │
         └──────────────────────┘   │    color              │
                                    │    tamano             │
                                    │    peso               │
                                    │    ubicacion_encontr  │
                                    │    observaciones      │
                                    │    fecha_registro     │
                                    │    activo             │
                                    └───────────────────────┘

┌─────────────────────────────────┐
│         Auditoria               │
│─────────────────────────────────│
│ PK id_auditoria                 │
│    tabla_afectada               │
│    id_registro                  │
│    accion (INSERT/UPDATE/DELETE)│
│ FK id_usuario                   │
│    fecha_accion                 │
│    datos_anteriores             │
│    datos_nuevos                 │
└─────────────────────────────────┘
```

## 2. Explicación del Modelo Relacional

### 2.1 Tabla: Roles
**Propósito**: Catálogo de roles del sistema (Técnico, Coordinador, Administrador)

**Columnas**:
- `id_rol` (INT, PK, IDENTITY): Identificador único
- `nombre_rol` (NVARCHAR(50), UNIQUE, NOT NULL): Nombre del rol
- `descripcion` (NVARCHAR(255)): Descripción del rol
- `activo` (BIT, DEFAULT 1): Indica si el rol está activo

**Relaciones**:
- **1:N** con Usuarios (Un rol puede tener muchos usuarios)

**Datos semilla**:
```sql
1, 'Técnico', 'Personal técnico de campo'
2, 'Coordinador', 'Coordinador de área'
3, 'Administrador', 'Administrador del sistema'
```

---

### 2.2 Tabla: Usuarios
**Propósito**: Almacena información de usuarios del sistema

**Columnas**:
- `id_usuario` (INT, PK, IDENTITY): Identificador único
- `id_rol` (INT, FK → Roles, NOT NULL): Rol del usuario
- `nombre` (NVARCHAR(100), NOT NULL): Nombre
- `apellido` (NVARCHAR(100), NOT NULL): Apellido
- `email` (NVARCHAR(255), UNIQUE, NOT NULL): Correo electrónico
- `username` (NVARCHAR(50), UNIQUE, NOT NULL): Usuario para login
- `password_hash` (NVARCHAR(255), NOT NULL): Contraseña hasheada con bcrypt
- `activo` (BIT, DEFAULT 1): Usuario activo
- `fecha_creacion` (DATETIME, DEFAULT GETDATE()): Fecha de creación

**Relaciones**:
- **N:1** con Roles (Muchos usuarios pertenecen a un rol)
- **1:N** con Expedientes (Un técnico registra muchos expedientes)
- **1:N** con Indicios (Un técnico registra muchos indicios)
- **1:N** con Aprobaciones (Un coordinador aprueba muchos expedientes)

**Constraints**:
- Email único por usuario
- Username único por usuario
- Clave foránea con Roles (ON DELETE NO ACTION)

**Datos semilla**:
```sql
Juan Pérez (jperez) - Técnico
María González (mgonzalez) - Coordinador
Carlos Ramírez (cramirez) - Técnico
Ana Martínez (amartinez) - Administrador
```

---

### 2.3 Tabla: Estados_Expediente
**Propósito**: Catálogo de estados posibles de un expediente

**Columnas**:
- `id_estado` (INT, PK, IDENTITY): Identificador único
- `nombre_estado` (NVARCHAR(50), UNIQUE, NOT NULL): Nombre del estado
- `descripcion` (NVARCHAR(255)): Descripción del estado
- `color` (NVARCHAR(20)): Color para UI (hex code)
- `activo` (BIT, DEFAULT 1): Estado activo

**Relaciones**:
- **1:N** con Expedientes (Un estado puede aplicar a muchos expedientes)

**Datos semilla**:
```sql
1, 'En Registro', 'Expediente en proceso de registro', '#FFA500'
2, 'En Revisión', 'Expediente enviado a revisión', '#0000FF'
3, 'Aprobado', 'Expediente aprobado', '#008000'
4, 'Rechazado', 'Expediente rechazado', '#FF0000'
```

**Flujo de estados**:
```
En Registro → En Revisión → Aprobado/Rechazado
```

---

### 2.4 Tabla: Expedientes
**Propósito**: Almacena los expedientes de investigación criminal

**Columnas**:
- `id_expediente` (INT, PK, IDENTITY): Identificador único
- `numero_expediente` (NVARCHAR(50), UNIQUE, NOT NULL): Número de expediente
- `titulo` (NVARCHAR(255), NOT NULL): Título descriptivo
- `descripcion` (NVARCHAR(MAX)): Descripción detallada
- `fecha_incidente` (DATETIME, NOT NULL): Fecha del incidente
- `lugar_incidente` (NVARCHAR(255)): Lugar del incidente
- `id_tecnico_registra` (INT, FK → Usuarios, NOT NULL): Técnico que registra
- `id_estado` (INT, FK → Estados_Expediente, DEFAULT 1): Estado actual
- `fecha_registro` (DATETIME, DEFAULT GETDATE()): Fecha de creación
- `fecha_ultima_modificacion` (DATETIME): Última modificación
- `activo` (BIT, DEFAULT 1): Registro activo (soft delete)

**Relaciones**:
- **N:1** con Usuarios (Muchos expedientes registrados por un técnico)
- **N:1** con Estados_Expediente (Muchos expedientes en un estado)
- **1:N** con Indicios (Un expediente tiene muchos indicios)
- **1:N** con Aprobaciones (Un expediente tiene muchas aprobaciones)

**Constraints**:
- Número de expediente único
- Clave foránea con Usuarios (técnico_registra)
- Clave foránea con Estados_Expediente

**Índices**:
- PK en id_expediente
- UNIQUE en numero_expediente
- INDEX en id_estado (queries frecuentes por estado)
- INDEX en id_tecnico_registra

---

### 2.5 Tabla: Indicios
**Propósito**: Almacena los indicios/evidencias asociados a expedientes

**Columnas**:
- `id_indicio` (INT, PK, IDENTITY): Identificador único
- `id_expediente` (INT, FK → Expedientes, NOT NULL): Expediente asociado
- `numero_indicio` (NVARCHAR(50), NOT NULL): Número de indicio
- `nombre_objeto` (NVARCHAR(255), NOT NULL): Nombre del objeto
- `descripcion` (NVARCHAR(MAX)): Descripción detallada
- `color` (NVARCHAR(50)): Color del objeto
- `tamano` (NVARCHAR(50)): Tamaño
- `peso` (NVARCHAR(50)): Peso
- `ubicacion_encontrado` (NVARCHAR(255)): Ubicación donde se encontró
- `observaciones` (NVARCHAR(MAX)): Observaciones adicionales
- `id_tecnico_registra` (INT, FK → Usuarios, NOT NULL): Técnico que registra
- `fecha_registro` (DATETIME, DEFAULT GETDATE()): Fecha de registro
- `activo` (BIT, DEFAULT 1): Registro activo

**Relaciones**:
- **N:1** con Expedientes (Muchos indicios pertenecen a un expediente)
- **N:1** con Usuarios (Muchos indicios registrados por un técnico)

**Constraints**:
- Constraint único: (id_expediente, numero_indicio) → No duplicados
- Clave foránea con Expedientes (ON DELETE CASCADE)
- Clave foránea con Usuarios

**Índices**:
- PK en id_indicio
- UNIQUE en (id_expediente, numero_indicio)
- INDEX en id_expediente

---

### 2.6 Tabla: Aprobaciones
**Propósito**: Registra las aprobaciones/rechazos de expedientes por coordinadores

**Columnas**:
- `id_aprobacion` (INT, PK, IDENTITY): Identificador único
- `id_expediente` (INT, FK → Expedientes, NOT NULL): Expediente aprobado/rechazado
- `id_coordinador` (INT, FK → Usuarios, NOT NULL): Coordinador que aprueba
- `aprobado` (BIT, NOT NULL): TRUE=Aprobado, FALSE=Rechazado
- `justificacion` (NVARCHAR(MAX)): Justificación (obligatoria si rechazado)
- `fecha_aprobacion` (DATETIME, DEFAULT GETDATE()): Fecha de decisión

**Relaciones**:
- **N:1** con Expedientes (Muchas aprobaciones para un expediente - historial)
- **N:1** con Usuarios (Muchas aprobaciones por un coordinador)

**Constraints**:
- Clave foránea con Expedientes
- Clave foránea con Usuarios (coordinador)

**Reglas de negocio**:
- Si `aprobado = FALSE`, `justificacion` es obligatoria
- Cambia estado del expediente a "Aprobado" (3) o "Rechazado" (4)
- Se registra en tabla de Auditoría

**Índices**:
- PK en id_aprobacion
- INDEX en id_expediente
- INDEX en id_coordinador

---

### 2.7 Tabla: Auditoria
**Propósito**: Registro de todas las operaciones en el sistema (audit trail)

**Columnas**:
- `id_auditoria` (INT, PK, IDENTITY): Identificador único
- `tabla_afectada` (NVARCHAR(50), NOT NULL): Tabla modificada
- `id_registro` (INT): ID del registro afectado
- `accion` (NVARCHAR(20), NOT NULL): INSERT, UPDATE, DELETE, etc.
- `id_usuario` (INT, FK → Usuarios): Usuario que realizó la acción
- `fecha_accion` (DATETIME, DEFAULT GETDATE()): Timestamp de la acción
- `datos_anteriores` (NVARCHAR(MAX)): JSON de datos previos (UPDATE/DELETE)
- `datos_nuevos` (NVARCHAR(MAX)): JSON de datos nuevos (INSERT/UPDATE)

**Relaciones**:
- **N:1** con Usuarios (Muchos registros de auditoría por usuario)

**Uso**:
- Rastreo completo de cambios
- Compliance y seguridad
- Recuperación de datos
- Investigación de incidentes

**Índices**:
- PK en id_auditoria
- INDEX en tabla_afectada
- INDEX en fecha_accion
- INDEX en id_usuario
