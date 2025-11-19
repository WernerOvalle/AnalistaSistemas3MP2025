import api from './api';
import type { Indicio, CrearIndicioRequest } from '@/types';

export const indicioService = {
  async getIndiciosPorExpediente(id_expediente: number): Promise<Indicio[]> {
    const { data } = await api.get(`/indicios/expediente/${id_expediente}`);
    return data;
  },

  async crearIndicio(id_expediente: number, indicio: CrearIndicioRequest): Promise<{ id_indicio: number }> {
    const { data} = await api.post('/indicios', { id_expediente, ...indicio });
    return data;
  },

  async actualizarIndicio(id: number, indicio: Partial<CrearIndicioRequest>): Promise<void> {
    await api.put(`/indicios/${id}`, indicio);
  },

  async eliminarIndicio(id: number): Promise<void> {
    await api.delete(`/indicios/${id}`);
  },
};
