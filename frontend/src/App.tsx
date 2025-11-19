import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Expedientes from '@/pages/Expedientes'
import ExpedienteDetalle from '@/pages/ExpedienteDetalle'
import NuevoExpediente from '@/pages/NuevoExpediente'
import Aprobaciones from '@/pages/Aprobaciones'
import Reportes from '@/pages/Reportes'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/expedientes"
            element={
              <ProtectedRoute>
                <Expedientes />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/expedientes/nuevo"
            element={
              <ProtectedRoute>
                <NuevoExpediente />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/expedientes/:id"
            element={
              <ProtectedRoute>
                <ExpedienteDetalle />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/aprobaciones"
            element={
              <ProtectedRoute roles={['Coordinador']}>
                <Aprobaciones />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <Reportes />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
