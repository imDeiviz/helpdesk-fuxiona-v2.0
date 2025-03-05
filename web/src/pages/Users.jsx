import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Row, Col, Badge, InputGroup } from 'react-bootstrap';
import { userService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  Mail, 
  Building,
  AlertTriangle,
  Trash // Importar el ícono de papelera
} from 'lucide-react';
import { OFFICE_OPTIONS, ROLE_OPTIONS } from '../config/constants';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    office: 'Malaga'
  });
  const [validated, setValidated] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getAllUsers();
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Error al cargar los usuarios. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        user.office.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      setCreating(true);
      const response = await userService.createUser(newUser);
      
      // Add the new user to the list
      setUsers(prev => [...prev, response.data.user]);
      
      // Reset form and close modal
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'user',
        office: 'Malaga'
      });
      setValidated(false);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Error al crear el usuario. Por favor, intenta de nuevo más tarde.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter(user => user.id !== id));
        setFilteredUsers(filteredUsers.filter(user => user.id !== id));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Error al eliminar el usuario. Por favor, intenta de nuevo más tarde.');
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <LoadingSpinner />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <UsersIcon size={28} className="me-2" />
          Usuarios
        </h1>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
        >
          <UserPlus size={18} className="me-1" />
          Nuevo Usuario
        </Button>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <Search size={18} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredUsers.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Correo Electrónico</th>
                    <th>Oficina</th>
                    <th>Rol</th>
                    <th>Acciones</th> {/* Nueva columna para acciones */}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.office}</td>
                      <td>
                        <Badge 
                          bg={
                            user.role === 'admin' ? 'danger' : 
                            user.role === 'tecnico' ? 'info' : 
                            'secondary'
                          }
                        >
                          {user.role === 'admin' ? 'Administrador' : 
                           user.role === 'tecnico' ? 'Técnico' : 
                           'Usuario'}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>
                          <Trash size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <AlertTriangle size={48} className="text-muted mb-3" />
              <h5>No se encontraron usuarios</h5>
              <p className="text-muted">Intenta con otra búsqueda o crea un nuevo usuario</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create User Modal */}
      <Modal 
        show={showCreateModal} 
        onHide={() => {
          setShowCreateModal(false);
          setValidated(false);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleCreateUser}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                placeholder="Ingresa el nombre completo"
                required
                disabled={creating}
              />
              <Form.Control.Feedback type="invalid">
                El nombre es obligatorio.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Correo Electrónico</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <Mail size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  required
                  disabled={creating}
                />
              </InputGroup>
              <Form.Control.Feedback type="invalid">
                Ingresa un correo electrónico válido.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={creating}
              />
              <Form.Text className="text-muted">
                La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                La contraseña es obligatoria.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formRole">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    disabled={creating}
                  >
                    {ROLE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formOffice">
                  <Form.Label>Oficina</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Building size={16} />
                    </InputGroup.Text>
                    <Form.Select
                      name="office"
                      value={newUser.office}
                      onChange={handleInputChange}
                      disabled={creating}
                    >
                      {OFFICE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => {
                  setShowCreateModal(false);
                  setValidated(false);
                }}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={creating}
              >
                {creating ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>Crear Usuario</>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Users;
