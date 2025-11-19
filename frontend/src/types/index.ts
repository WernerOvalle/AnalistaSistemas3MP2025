export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  id_rol: number;
  nombre_rol: string;
  activo: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Expediente {
  id_expediente: number;
  numero_expediente: string;
  titulo: string;
  descripcion: string;
  fecha_incidente: string;
  lugar_incidente: string;
  id_tecnico_registra: number;
  tecnico_nombre: string;
  id_estado: number;
  nombre_estado: string;
  estado_color: string;
  fecha_registro: string;
  fecha_ultima_modificacion?: string;
  total_indicios?: number;
}

export interface CrearExpedienteRequest {
  numero_expediente: string;
  titulo: string;
  descripcion: string;
  fecha_incidente: string;
  lugar_incidente: string;
}

export interface Indicio {
  id_indicio: number;
  id_expediente: number;
  numero_indicio: string;
  nombre_objeto: string;
  descripcion: string;
  color: string;
  tamano: string;
  peso: string;
  ubicacion_encontrado: string;
  observaciones: string;
  id_tecnico_registra: number;
  tecnico_nombre: string;
  fecha_registro: string;
  fecha_ultima_modificacion?: string;
}

export interface CrearIndicioRequest {
  numero_indicio: string;
  nombre_objeto: string;
  descripcion: string;
  color: string;
  tamano: string;
  peso: string;
  ubicacion_encontrado: string;
  observaciones: string;
}

export interface Aprobacion {
  id_aprobacion: number;
  id_expediente: number;
  id_coordinador: number;
  coordinador_nombre: string;
  aprobado: boolean;
  justificacion?: string;
  fecha_revision: string;
}

export interface AprobacionRequest {
  aprobado: boolean;
  justificacion?: string;
}

export interface Estadisticas {
  total_expedientes: number;
  total_indicios: number;
  total_tecnicos: number;
  total_coordinadores: number;
  expedientes_aprobados: number;
  expedientes_rechazados: number;
  expedientes_en_revision: number;
}

export interface ReporteEstado {
  nombre_estado: string;
  color: string;
  total_expedientes: number;
  tecnicos_involucrados: number;
}

export interface ReporteAprobaciones {
  resultado: string;
  total: number;
  coordinadores_involucrados: number;
  promedio_horas_revision: number;
}
