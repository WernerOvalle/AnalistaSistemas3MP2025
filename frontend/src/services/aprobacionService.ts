import api from './api';
import type { Aprobacion, AprobacionRequest } from '@/types';

export const aprobacionService = {
  async aprobarExpediente(id_expediente: number, data: AprobacionRequest): Promise<void> {
    await api.post(`/aprobaciones/aprobar/${id_expediente}`, data);
  },

  async rechazarExpediente(id_expediente: number, data: AprobacionRequest): Promise<void> {
    await api.post(`/aprobaciones/rechazar/${id_expediente}`, data);
  },

  async getAprobacionesPorExpediente(id_expediente: number): Promise<Aprobacion[]> {
    const { data } = await api.get(`/aprobaciones/expediente/${id_expediente}`);
    return data;
  },
};
