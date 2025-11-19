import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { expedienteService } from '@/services/expedienteService';
import { indicioService } from '@/services/indicioService';
import type { Expediente, Indicio } from '@/types';
import { ArrowLeft, FileText, MapPin, Calendar, User, Plus, Send, X } from 'lucide-react';
import { formatDateTime } from '@/utils/helpers';

export default function ExpedienteDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [indicios, setIndicios] = useState<Indicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviandoRevision, setEnviandoRevision] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [guardandoIndicio, setGuardandoIndicio] = useState(false);
  const [formIndicio, setFormIndicio] = useState({
    numero_indicio: '',
    nombre_objeto: '',
    descripcion: '',
    color: '',
    tamano: '',
    peso: '',
    ubicacion_encontrado: '',
    observaciones: '',
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando expediente ID:', id);
      const [expData, indiciosData] = await Promise.all([
        expedienteService.getExpedienteById(Number(id)),
        indicioService.getIndiciosPorExpediente(Number(id)),
      ]);
      console.log('✅ Expediente cargado:', expData);
      console.log('✅ Indicios cargados:', indiciosData);
      setExpediente(expData);
      setIndicios(indiciosData);
    } catch (error) {
      console.error('❌ Error al cargar expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarRevision = async () => {
    if (!expediente || !id) return;
    
    try {
      setEnviandoRevision(true);
      await expedienteService.enviarARevision(Number(id));
      alert('Expediente enviado a revisión exitosamente');
      loadData(); // Recargar datos para actualizar el estado
    } catch (error) {
      console.error('Error al enviar a revisión:', error);
      alert('Error al enviar el expediente a revisión');
    } finally {
      setEnviandoRevision(false);
    }
  };

  const handleChangeIndicio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormIndicio({
      ...formIndicio,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitIndicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setGuardandoIndicio(true);
      await indicioService.crearIndicio(Number(id), formIndicio);
      setShowModal(false);
      setFormIndicio({
        numero_indicio: '',
        nombre_objeto: '',
        descripcion: '',
        color: '',
        tamano: '',
        peso: '',
        ubicacion_encontrado: '',
        observaciones: '',
      });
      loadData(); // Recargar indicios
      alert('Indicio agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar indicio:', error);
      alert('Error al agregar el indicio');
    } finally {
      setGuardandoIndicio(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!expediente) {
    return <div>Expediente no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/expedientes')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {expediente.numero_expediente}
                </h1>
                <p className="text-sm text-gray-600">{expediente.titulo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {usuario?.nombre_rol === 'Técnico' && expediente.id_estado === 1 && (
                <button
                  onClick={handleEnviarRevision}
                  disabled={enviandoRevision}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                  {enviandoRevision ? 'Enviando...' : 'Enviar a Revisión'}
                </button>
              )}
              <span
                className="inline-flex px-4 py-2 text-sm font-semibold rounded-full"
                style={{
                  backgroundColor: `${expediente.estado_color}20`,
                  color: expediente.estado_color,
                }}
              >
                {expediente.nombre_estado}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del Expediente */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={FileText}
              label="Descripción"
              value={expediente.descripcion}
            />
            <InfoItem
              icon={Calendar}
              label="Fecha del Incidente"
              value={formatDateTime(expediente.fecha_incidente)}
            />
            <InfoItem
              icon={MapPin}
              label="Lugar del Incidente"
              value={expediente.lugar_incidente}
            />
            <InfoItem
              icon={User}
              label="Técnico Registrador"
              value={expediente.tecnico_nombre}
            />
            <InfoItem
              icon={Calendar}
              label="Fecha de Registro"
              value={formatDateTime(expediente.fecha_registro)}
            />
          </div>
        </div>

        {/* Indicios */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Indicios Registrados ({indicios.length})
            </h2>
            {usuario?.nombre_rol === 'Técnico' && expediente.id_estado === 1 && (
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Agregar Indicio
              </button>
            )}
          </div>
          <div className="p-6">
            {indicios.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay indicios registrados
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {indicios.map((indicio) => (
                  <div
                    key={indicio.id_indicio}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {indicio.numero_indicio} - {indicio.nombre_objeto}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(indicio.fecha_registro)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {indicio.descripcion}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Color:</span>{' '}
                        <span className="text-gray-900">{indicio.color}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tamaño:</span>{' '}
                        <span className="text-gray-900">{indicio.tamano}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Peso:</span>{' '}
                        <span className="text-gray-900">{indicio.peso}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Ubicación:</span>{' '}
                      <span className="text-gray-900">{indicio.ubicacion_encontrado}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Agregar Indicio */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Agregar Indicio</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitIndicio} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Indicio *
                  </label>
                  <input
                    type="text"
                    name="numero_indicio"
                    required
                    value={formIndicio.numero_indicio}
                    onChange={handleChangeIndicio}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: IND-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Objeto *
                  </label>
                  <input
                    type="text"
                    name="nombre_objeto"
                    required
                    value={formIndicio.nombre_objeto}
                    onChange={handleChangeIndicio}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Arma de fuego"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  required
                  rows={3}
                  value={formIndicio.descripcion}
                  onChange={handleChangeIndicio}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Descripción detallada del indicio..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formIndicio.color}
                    onChange={handleChangeIndicio}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Negro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamaño
                  </label>
                  <input
                    type="text"
                    name="tamano"
                    value={formIndicio.tamano}
                    onChange={handleChangeIndicio}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: 20cm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso
                  </label>
                  <input
                    type="text"
                    name="peso"
                    value={formIndicio.peso}
                    onChange={handleChangeIndicio}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: 500g"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación donde fue encontrado
                </label>
                <input
                  type="text"
                  name="ubicacion_encontrado"
                  value={formIndicio.ubicacion_encontrado}
                  onChange={handleChangeIndicio}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: Sala principal, esquina izquierda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  rows={3}
                  value={formIndicio.observaciones}
                  onChange={handleChangeIndicio}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoIndicio}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardandoIndicio ? 'Guardando...' : 'Agregar Indicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-primary-50 rounded-lg">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
}
