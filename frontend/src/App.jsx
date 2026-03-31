import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import Messages from './pages/Messages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
          <Route path="/add-item" element={<><Navbar /><AddItem /></>} />
          <Route path="/messages/:receiverId" element={<><Navbar /><Messages /></>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;