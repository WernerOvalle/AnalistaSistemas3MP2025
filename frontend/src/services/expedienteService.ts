import api from './api';
import type { Expediente, CrearExpedienteRequest } from '@/types';

export const expedienteService = {
  async getExpedientes(filtros?: {
    id_estado?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<Expediente[]> {
    const { data } = await api.get('/expedientes', { params: filtros });
    return data;
  },

  async getExpedienteById(id: number): Promise<Expediente> {
    const { data } = await api.get(`/expedientes/${id}`);
    return data;
  },

  async crearExpediente(expediente: CrearExpedienteRequest): Promise<{ id_expediente: number }> {
    const { data } = await api.post('/expedientes', expediente);
    return data;
  },

  async enviarARevision(id: number): Promise<void> {
    await api.put(`/expedientes/${id}/enviar-revision`);
  },
};
