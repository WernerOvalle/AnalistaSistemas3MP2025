# Arquitectura del Sistema DICRI

## 1. Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Navegador)                      │
│                     http://localhost:3002                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • React 19.2.0 + TypeScript                             │  │
│  │  • Vite 5.4.21 (Build Tool & Dev Server)                 │  │
│  │  • Tailwind CSS 3.4.18 (Estilos)                         │  │
│  │  • React Router DOM 7.9.6 (Navegación)                   │  │
│  │  • Axios (HTTP Client)                                    │  │
│  │  • Lucide React (Iconos)                                  │  │
│  │  • Recharts (Gráficos)                                    │  │
│  │  • Context API (Estado Global)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                    Puerto: 3002 (externo)                        │
│                    Puerto: 5173 (interno)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API
                             │ JSON
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    BACKEND API (Node.js)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Node.js 20 (Alpine)                                    │  │
│  │  • Express 5.1.0 (Framework)                              │  │
│  │  • TypeScript 5.9.3                                       │  │
│  │  • JWT (Autenticación)                                    │  │
│  │  • bcryptjs (Hash de contraseñas)                         │  │
│  │  • mssql 12.1.0 (Driver SQL Server)                       │  │
│  │  • CORS (Seguridad)                                       │  │
│  │  • Nodemon (Hot Reload)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                    Puerto: 3001 (externo)                        │
│                    Puerto: 3000 (interno)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ T-SQL / Stored Procedures
                             │ TDS Protocol
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                 BASE DE DATOS (SQL Server 2022)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • SQL Server 2022 Express                                │  │
│  │  • Base de Datos: DICRI_DB                                │  │
│  │  • 8 Tablas principales                                   │  │
│  │  • 20+ Stored Procedures                                  │  │
│  │  • Triggers para auditoría                                │  │
│  │  • Índices y constraints                                  │  │
│  │  • Volumen persistente                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                    Puerto: 1434 (externo)                        │
│                    Puerto: 1433 (interno)                        │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
                      DOCKER INFRASTRUCTURE
═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose (v3.8)                         │
│                    Network: dicri_network                        │
│                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐  │
│  │   Container   │  │   Container   │  │    Container      │  │
│  │   Frontend    │  │   Backend     │  │   SQL Server      │  │
│  │               │  │               │  │                   │  │
│  │  • Vite Dev   │  │  • Express    │  │  • MSSQL 2022     │  │
│  │  • Hot Reload │  │  • Nodemon    │  │  • Health Check   │  │
│  │  • Volume:    │  │  • Volume:    │  │  • Volume:        │  │
│  │    ./frontend │  │    ./backend  │  │    sqlserver_data │  │
│  └───────────────┘  └───────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```
