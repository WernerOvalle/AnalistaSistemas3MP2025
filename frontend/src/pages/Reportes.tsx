import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { reporteService } from '@/services/reporteService';
import type { Estadisticas, ReporteEstado, ReporteAprobaciones } from '@/types';
import { BarChart3, FileText, TrendingUp, Calendar, Download, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reportes() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [reporteEstados, setReporteEstados] = useState<ReporteEstado[]>([]);
  const [reporteAprobaciones, setReporteAprobaciones] = useState<ReporteAprobaciones[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, estados, aprobaciones] = await Promise.all([
        reporteService.getEstadisticas(),
        reporteService.getReportePorEstado(),
        reporteService.getReporteAprobaciones(),
      ]);
      setEstadisticas(stats);
      setReporteEstados(estados);
      setReporteAprobaciones(aprobaciones);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      const filtros = {
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
      };
      const [estados, aprobaciones] = await Promise.all([
        reporteService.getReportePorEstado(filtros),
        reporteService.getReporteAprobaciones(filtros),
      ]);
      setReporteEstados(estados);
      setReporteAprobaciones(aprobaciones);
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

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
                <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                <p className="text-sm text-gray-600">
                  {usuario?.nombre} {usuario?.apellido} - {usuario?.nombre_rol}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Fecha
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={aplicarFiltros}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Expedientes"
            value={estadisticas?.total_expedientes || 0}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Total Indicios"
            value={estadisticas?.total_indicios || 0}
            icon={BarChart3}
            color="purple"
          />
          <StatCard
            title="Aprobados"
            value={estadisticas?.expedientes_aprobados || 0}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="En Revisión"
            value={estadisticas?.expedientes_en_revision || 0}
            icon={FileText}
            color="yellow"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expedientes por Estado */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Expedientes por Estado
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reporteEstados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre_estado" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_expedientes" fill="#3b82f6" name="Expedientes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Aprobaciones vs Rechazos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aprobaciones vs Rechazos
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reporteAprobaciones}
                  dataKey="total"
                  nameKey="resultado"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {reporteAprobaciones.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Detalle */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Detalle por Estado
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Expedientes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Técnicos Involucrados
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reporteEstados.map((estado, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full"
                        style={{ backgroundColor: `${estado.color}20`, color: estado.color }}
                      >
                        {estado.nombre_estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estado.total_expedientes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estado.tecnicos_involucrados}
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

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'purple' | 'green' | 'yellow';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
