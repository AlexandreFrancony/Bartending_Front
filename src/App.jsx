import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Admin from './pages/Admin';

// Check if user is admin (username === "Bloster")
const isAdmin = () => localStorage.getItem('username') === 'Bloster';

// Check if user has set username
const hasUsername = () => !!localStorage.getItem('username');

// Protected route for admin pages
function AdminRoute({ children }) {
  if (!hasUsername()) {
    return <Navigate to="/welcome" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Protected route requiring username
function ProtectedRoute({ children }) {
  if (!hasUsername()) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <AdminRoute>
            <Orders />
          </AdminRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
