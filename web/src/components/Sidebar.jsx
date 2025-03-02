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

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isTechnician = user?.role === 'tecnico';

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      access: true // Everyone has access
    },
    {
      path: '/incidents',
      name: 'Incidencias',
      icon: <FileText size={18} />,
      access: true // Everyone has access
    },
    {
      path: '/users',
      name: 'Usuarios',
      icon: <Users size={18} />,
      access: isAdmin // Only admin has access
    },
    {
      path: '/offices',
      name: 'Oficinas',
      icon: <Building size={18} />,
      access: isAdmin || isTechnician
    }
  ];

  return (
    <div className="bg-dark text-white h-100 d-flex flex-column">
      <div className="p-3">
        {isOpen && (
          <h5 className="text-white-50 mb-3 px-2">Menú Principal</h5>
        )}
        <Nav className="flex-column">
          {menuItems.map((item) => (
            item.access && (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                className={`mb-2 d-flex align-items-center ${
                  location.pathname === item.path ? 'active bg-primary bg-opacity-25 text-white' : 'text-white-50'
                }`}
                style={{ 
                  borderRadius: '8px',
                  padding: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <span className="me-3">{item.icon}</span>
                {isOpen && <span>{item.name}</span>}
              </Nav.Link>
            )
          ))}
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