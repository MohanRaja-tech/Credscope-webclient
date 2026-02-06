import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import FileDetail from './pages/FileDetail';
import Search from './pages/Search';
import Process from './pages/Process';
import Config from './pages/Config';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <Router>
          <Routes>
            {/* User Routes - Direct Access, No Login Required */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Search />} />
              <Route path="details/:id" element={<FileDetail />} />
            </Route>

            {/* Admin Login Route */}
            <Route path="/admin/login" element={<Login />} />

            {/* Admin Routes - Requires Authentication */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="files" element={<Files />} />
              <Route path="files/:id" element={<FileDetail />} />
              <Route path="search" element={<Search />} />
              <Route path="process" element={<Process />} />
              <Route path="config" element={<Config />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;
