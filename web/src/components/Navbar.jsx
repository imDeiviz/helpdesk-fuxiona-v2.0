import React from 'react';
import { Navbar as BsNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, User, LogOut, Menu as MenuIcon } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <BsNavbar bg="white" expand="lg" className="shadow-sm" style={{ zIndex: 1000 }}>
      <Container fluid>
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-link text-dark me-3 d-flex align-items-center" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <MenuIcon size={20} />
          </button>
          
          <BsNavbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center">
            <span style={{ color: '#b000e8', fontWeight: 'bold' }}>Helpdesk</span>
            <span className="ms-1 fw-light">Portal</span>
          </BsNavbar.Brand>
        </div>

        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/incidents/create" className="btn btn-primary text-white mx-2">
              Crear Incidencia
            </Nav.Link>
            
            <NavDropdown 
              title={
                <div className="d-inline-block">
                  <Bell size={18} className="me-1" />
                </div>
              } 
              id="notification-dropdown"
              align="end"
            >
              <NavDropdown.Item className="text-center">No hay notificaciones</NavDropdown.Item>
            </NavDropdown>
            
            <NavDropdown 
              title={
                <div className="d-inline-block">
                  <User size={18} className="me-1" />
                  <span>{user?.name || 'Usuario'}</span>
                </div>
              } 
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">Mi Perfil</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <LogOut size={16} className="me-2" />
                Cerrar Sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;