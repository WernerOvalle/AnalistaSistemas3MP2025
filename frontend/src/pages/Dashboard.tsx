import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reporteService } from '@/services/reporteService';
import type { Estadisticas } from '@/types';
import { BarChart3, FileText, Users, CheckCircle, XCircle, Clock, Plus, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await reporteService.getEstadisticas();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard DICRI</h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {usuario?.nombre} {usuario?.apellido} - {usuario?.nombre_rol}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Expedientes"
            value={stats?.total_expedientes || 0}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Total Indicios"
            value={stats?.total_indicios || 0}
            icon={BarChart3}
            color="purple"
          />
          <StatCard
            title="Aprobados"
            value={stats?.expedientes_aprobados || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="En Revisión"
            value={stats?.expedientes_en_revision || 0}
            icon={Clock}
            color="yellow"
          />
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              title="Nuevo Expediente"
              description="Registrar un nuevo expediente"
              icon={Plus}
              onClick={() => navigate('/expedientes/nuevo')}
              disabled={usuario?.nombre_rol === 'Coordinador'}
            />
            <ActionButton
              title="Ver Expedientes"
              description="Ver todos los expedientes"
              icon={FileText}
              onClick={() => navigate('/expedientes')}
            />
            <ActionButton
              title="Reportes"
              description="Generar reportes y estadísticas"
              icon={BarChart3}
              onClick={() => navigate('/reportes')}
            />
            {usuario?.nombre_rol === 'Coordinador' && (
              <ActionButton
                title="Aprobaciones"
                description="Revisar expedientes pendientes"
                icon={CheckCircle}
                onClick={() => navigate('/aprobaciones')}
              />
            )}
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
    <div className="bg-white rounded-lg shadow p-6 animate-fade-in">
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

interface ActionButtonProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  disabled?: boolean;
}

function ActionButton({ title, description, icon: Icon, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
    >
      <div className="p-2 bg-primary-100 rounded-lg">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </button>
  );
}
