import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Index from './pages/admin/Index';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Index />
              </ProtectedRoute>
            }
          />
          {/* add other role routes here */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
