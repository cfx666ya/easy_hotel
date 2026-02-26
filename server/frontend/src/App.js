import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MerchantHotels from './pages/MerchantHotels';
import HotelForm from './pages/HotelForm';
import AdminHotels from './pages/AdminHotels';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/dashboard" />;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/hotels" element={<PrivateRoute role="merchant"><MerchantHotels /></PrivateRoute>} />
          <Route path="/hotels/new" element={<PrivateRoute role="merchant"><HotelForm /></PrivateRoute>} />
          <Route path="/hotels/:id/edit" element={<PrivateRoute role="merchant"><HotelForm /></PrivateRoute>} />
          <Route path="/admin/hotels" element={<PrivateRoute role="admin"><AdminHotels /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
