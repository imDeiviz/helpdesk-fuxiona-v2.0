import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Building, Save } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/constants';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.patch(
        `${API_URL}/users/change-password`,
        passwordData,
        { withCredentials: true }
      );
      setSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al cambiar la contraseña. Por favor, intenta de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <LoadingSpinner />
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h1 className="mb-4">Mi Perfil</h1>

      {success && (
        <Alert variant="success" className="mb-4">
          Contraseña actualizada correctamente.
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-4">
              <div
                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ width: '120px', height: '120px' }}
              >
                <User size={60} className="text-primary" />
              </div>

              <h4 className="mb-1">{user?.name}</h4>
              <p className="text-muted mb-3">{user?.email}</p>

              <div className="d-flex justify-content-center align-items-center">
                <Building size={18} className="text-muted me-2" />
                <span>{user?.office}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-4">Informacion de Usuario</h5>

              <Form onSubmit={handleSubmit}>
<Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formName">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={user?.name}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="formEmail">
                      <Form.Label>Correo Electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        defaultValue={user?.email}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formOffice">
                      <Form.Label>Oficina</Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={user?.office}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="formRole">
                      <Form.Label>Rol</Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={user?.role || 'Usuario'}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <hr className="my-4" />
                
                <h5 className="mb-4">Cambiar Contraseña</h5>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formCurrentPassword">
                      <Form.Label>Contraseña Actual</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        placeholder="Inserta contraseña actual"
                        value={passwordData.currentPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group controlId="formNewPassword">
                      <Form.Label>Nueva Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        placeholder="Inserta nueva contraseña"
                        value={passwordData.newPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <>
                        <Save size={18} className="me-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
