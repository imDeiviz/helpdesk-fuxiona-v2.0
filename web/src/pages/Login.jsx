import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    const success = await login(email, password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Container fluid className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="border-0 shadow-lg fade-in">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold" style={{ color: '#b000e8' }}>Helpdesk Portal</h2>
                <p className="text-muted">Inicia sesión para acceder al sistema</p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa un correo electrónico válido.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu contraseña.
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <LogIn size={18} className="me-2" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  ¿No tienes una cuenta? Contacta con el administrador.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;