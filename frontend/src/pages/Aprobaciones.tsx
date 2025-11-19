import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { expedienteService } from '@/services/expedienteService';
import { aprobacionService } from '@/services/aprobacionService';
import type { Expediente } from '@/types';
import { ArrowLeft, CheckCircle, XCircle, Eye } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

export default function Aprobaciones() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
  const [accion, setAccion] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [justificacion, setJustificacion] = useState('');

  useEffect(() => {
    loadExpedientes();
  }, []);

  const loadExpedientes = async () => {
    try {
      setLoading(true);
      const data = await expedienteService.getExpedientes({ id_estado: 2 }); // En Revisión
      setExpedientes(data);
    } catch (error) {
      console.error('Error al cargar expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = (expediente: Expediente) => {
    setSelectedExpediente(expediente);
    setAccion('aprobar');
    setJustificacion('');
    setShowModal(true);
  };

  const handleRechazar = (expediente: Expediente) => {
    setSelectedExpediente(expediente);
    setAccion('rechazar');
    setJustificacion('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedExpediente) return;
    
    try {
      const data = {
        aprobado: accion === 'aprobar',
        justificacion: justificacion || undefined,
      };

      if (accion === 'aprobar') {
        await aprobacionService.aprobarExpediente(selectedExpediente.id_expediente, data);
      } else {
        await aprobacionService.rechazarExpediente(selectedExpediente.id_expediente, data);
      }

      setShowModal(false);
      loadExpedientes();
    } catch (error) {
      console.error('Error al procesar aprobación:', error);
    }
  };

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aprobaciones Pendientes</h1>
              <p className="text-sm text-gray-600">
                {usuario?.nombre} {usuario?.apellido} - {usuario?.nombre_rol}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {expedientes.length} Expedientes en revisión
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
                {expedientes.map((expediente) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expediente.total_indicios || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(expediente.fecha_registro)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => navigate(`/expedientes/${expediente.id_expediente}`)}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </button>
                      <button
                        onClick={() => handleAprobar(expediente)}
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(expediente)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedExpediente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {accion === 'aprobar' ? 'Aprobar' : 'Rechazar'} Expediente
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Expediente: {selectedExpediente.numero_expediente}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justificación {accion === 'rechazar' && '*'}
              </label>
              <textarea
                rows={4}
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                required={accion === 'rechazar'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ingrese una justificación..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={accion === 'rechazar' && !justificacion.trim()}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  accion === 'aprobar'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
