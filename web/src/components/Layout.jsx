import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Container, Row, Col } from 'react-bootstrap';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <Container fluid className="flex-grow-1">
        <Row className="h-100">
          {/* Sidebar */}
          <Col 
            md={sidebarOpen ? 3 : 1} 
            lg={sidebarOpen ? 2 : 1} 
            className="px-0 bg-dark sidebar-container"
            style={{ 
              transition: 'all 0.3s ease',
              height: 'calc(100vh - 56px)',
              position: 'sticky',
              top: '56px'
            }}
          >
            <Sidebar isOpen={sidebarOpen} />
          </Col>
          
          {/* Main Content */}
          <Col 
            md={sidebarOpen ? 9 : 11} 
            lg={sidebarOpen ? 10 : 11} 
            className="py-4 px-md-4"
            style={{ transition: 'all 0.3s ease' }}
          >
            <div className="slide-in">
              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Layout;