import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { expedienteService } from '@/services/expedienteService';
import type { Expediente } from '@/types';
import { FileText, Plus, Search, Filter, ArrowLeft, Eye } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

export default function Expedientes() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<number | ''>('');

  useEffect(() => {
    loadExpedientes();
  }, []);

  const loadExpedientes = async () => {
    try {
      setLoading(true);
      const data = await expedienteService.getExpedientes();
      setExpedientes(data);
    } catch (error) {
      console.error('Error al cargar expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const expedientesFiltrados = expedientes.filter((exp) => {
    const matchBusqueda =
      exp.numero_expediente.toLowerCase().includes(busqueda.toLowerCase()) ||
      exp.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = estadoFiltro === '' || exp.id_estado === estadoFiltro;
    return matchBusqueda && matchEstado;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
                <p className="text-sm text-gray-600">
                  {usuario?.nombre} {usuario?.apellido} - {usuario?.nombre_rol}
                </p>
              </div>
            </div>
            {usuario?.nombre_rol === 'Técnico' && (
              <button
                onClick={() => navigate('/expedientes/nuevo')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Nuevo Expediente
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por número o título..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Todos los estados</option>
                <option value="1">En Registro</option>
                <option value="2">En Revisión</option>
                <option value="3">Aprobado</option>
                <option value="4">Rechazado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Expedientes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {expedientesFiltrados.length} Expedientes encontrados
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Expediente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indicios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expedientesFiltrados.map((expediente) => (
                  <tr key={expediente.id_expediente} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expediente.numero_expediente}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {expediente.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {expediente.tecnico_nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: `${expediente.estado_color}20`,
                          color: expediente.estado_color,
                        }}
                      >
                        {expediente.nombre_estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expediente.total_indicios || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(expediente.fecha_registro)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/expedientes/${expediente.id_expediente}`)}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
