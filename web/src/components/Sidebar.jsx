import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Building
} from 'lucide-react';

// Componente Sidebar que muestra un menú de navegación
const Sidebar = ({ isOpen }) => {
  const location = useLocation(); // Obtiene la ubicación actual
  const { user } = useAuth(); // Obtiene la información del usuario autenticado

  // Verifica los roles del usuario
  const isAdmin = user?.role === 'admin';
  const isTechnician = user?.role === 'tecnico';

  // Elementos del menú con sus respectivas rutas, nombres, íconos y accesos
  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      access: true // Todos tienen acceso
    },
    {
      path: '/incidents',
      name: 'Incidencias',
      icon: <FileText size={18} />,
      access: true // Todos tienen acceso
    },
    {
      path: '/users',
      name: 'Usuarios',
      icon: <Users size={18} />,
      access: isAdmin // Solo el admin tiene acceso
    },
    {
      path: '/offices',
      name: 'Oficinas',
      icon: <Building size={18} />,
      access: isAdmin // Acceso para admin
    }
  ];

  // Función para renderizar cada elemento del menú
  const renderMenuItem = (item) => (
    item.access && (
      <Nav.Link
        key={item.path}
        as={Link}
        to={item.path}
        className={`mb-2 d-flex align-items-center ${location.pathname === item.path ? 'active bg-primary bg-opacity-25 text-white' : 'text-white'}`}
        style={{
          borderRadius: '8px',
          padding: '10px',
          transition: 'all 0.2s'
        }}
      >
        <span className="me-3 position-relative" style={{ zIndex: 1 }}>{item.icon}</span>
        {isOpen && <span className="text-white position-relative" style={{ zIndex: 1 }}>{item.name}</span>}
      </Nav.Link>
    )
  );

  return (
    <div className="bg-dark text-white h-100 d-flex flex-column">
      <div className="p-3">
        {isOpen && (
          <h5 className="text-white-50 mb-3 px-2">Menú Principal</h5>
        )}
        <Nav className="flex-column">
          {menuItems.map(renderMenuItem)}
        </Nav>
      </div>

      <div className="mt-auto p-3">
        {isOpen && (
          <h5 className="text-white-50 mb-3 px-2">Soporte</h5>
        )}
        <Nav className="flex-column">
          <Nav.Link
            href="#help"
            className="mb-2 d-flex align-items-center text-white-50"
            style={{
              borderRadius: '8px',
              padding: '10px',
              transition: 'all 0.2s'
            }}
          >
            <span className="me-3"><HelpCircle size={18} /></span>
            {isOpen && <span>Ayuda</span>}
          </Nav.Link>
          <Nav.Link
            href="#settings"
            className="mb-2 d-flex align-items-center text-white-50"
            style={{
              borderRadius: '8px',
              padding: '10px',
              transition: 'all 0.2s'
            }}
          >
            <span className="me-3"><Settings size={18} /></span>
            {isOpen && <span>Configuración</span>}
          </Nav.Link>
        </Nav>

        {isOpen && (
          <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded">
            <p className="small text-white-50 mb-1">Oficina actual</p>
            <p className="mb-0 text-white">{user?.office || 'No asignada'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
