import api from './api';
import type { Estadisticas, ReporteEstado, ReporteAprobaciones } from '@/types';

export const reporteService = {
  async getEstadisticas(): Promise<Estadisticas> {
    const { data } = await api.get('/reportes/estadisticas');
    return data;
  },

  async getReportePorEstado(filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<ReporteEstado[]> {
    const { data } = await api.get('/reportes/expedientes-estado', { params: filtros });
    return data;
  },

  async getReporteAprobaciones(filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<ReporteAprobaciones[]> {
    const { data } = await api.get('/reportes/aprobaciones-rechazos', { params: filtros });
    return data;
  },
};
