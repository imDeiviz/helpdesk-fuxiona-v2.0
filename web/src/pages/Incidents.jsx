import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { incidentService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Plus, Filter, FileText } from 'lucide-react';
import { PRIORITY_OPTIONS } from '../config/constants';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: '',
    office: '',
    status: ''
  });

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const response = await incidentService.getAllIncidents({
          params: {
            // Add any necessary query parameters here
          }
        });
        setIncidents(response.data);
        setFilteredIncidents(response.data);
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError('Error al cargar las incidencias. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = incidents;
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(incident => 
        incident.title.toLowerCase().includes(term) || 
        incident.description.toLowerCase().includes(term) ||
        incident.name.toLowerCase().includes(term) ||
        incident.email.toLowerCase().includes(term)
      );
    }
    
    // Apply filters
    if (filters.priority) {
      result = result.filter(incident => incident.priority === filters.priority);
    }
    
    if (filters.office) {
      result = result.filter(incident => incident.office === filters.office);
    }
    
    if (filters.status) {
      result = result.filter(incident => incident.status === filters.status);
    }
    
    setFilteredIncidents(result); // Ensure we set the filtered incidents correctly

  }, [searchTerm, filters, incidents]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await incidentService.updateIncident(id, { status: newStatus });
      // refrescar las incidencias
      fetchIncidents();
    } catch (error) {
      console.error('Error updating incident status:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      priority: '',
      office: '',
      status: ''
    });
    setSearchTerm('');
  };

  // Get unique offices for filter
  const offices = [...new Set(incidents.map(incident => incident.office))];

  if (loading) {
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
          <FileText size={28} className="me-2" />
          Incidencias
        </h1>
        <Link to="/incidents/create" className="btn btn-primary">
          <Plus size={18} className="me-1" />
          Nueva Incidencia
        </Link>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar incidencias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={6} lg={8}>
              <div className="d-flex gap-2 flex-wrap">
                <Form.Select 
                  name="priority" 
                  value={filters.priority} 
                  onChange={handleFilterChange}
                  className="w-auto"
                >
                  <option value="">Todas las prioridades</option>
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
                
                <Form.Select 
                  name="office" 
                  value={filters.office} 
                  onChange={handleFilterChange}
                  className="w-auto"
                >
                  <option value="">Todas las oficinas</option>
                  {offices.map(office => (
                    <option key={office} value={office}>
                      {office}
                    </option>
                  ))}
                </Form.Select>
                
                <Form.Select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange}
                  className="w-auto"
                >
                  <option value="">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Resuelto">Resuelto</option>
                </Form.Select>
                
                <Button variant="outline-secondary" onClick={clearFilters}>
                  Limpiar
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredIncidents.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Título</th>
                    <th>Oficina</th>
                    <th>Solicitante</th>
                    <th>Fecha</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map(incident => (
                    <tr key={incident._id}>
                      <td>
                        <Link to={`/incidents/${incident._id}`} className="text-decoration-none">
                          {incident.title}
                        </Link>
                      </td>
                      <td>{incident.office}</td>
                      <td>{incident.name}</td>
                      <td>{new Date(incident.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Badge 
                          bg={
                            incident.priority === 'Alta' ? 'danger' : 
                            incident.priority === 'Media' ? 'warning' : 
                            'success'
                          }
                        >
                          {incident.priority}
                        </Badge>
                      </td>
                      <td onClick={() => handleStatusChange(incident._id, 'En Progreso')}>
                        <Badge 
                          bg={
                            incident.status === 'Pendiente' ? 'secondary' : 
                            incident.status === 'En Progreso' ? 'info' : 
                            'success'
                          }
                        >
                          {incident.status || 'Pendiente'}
                        </Badge>
                      </td>
                      <td>
                        <Link 
                          to={`/incidents/${incident._id}`} 
                          className="btn btn-sm btn-outline-primary"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <Filter size={48} className="text-muted mb-3" />
              <h5>No se encontraron incidencias</h5>
              <p className="text-muted">Intenta con otros filtros o crea una nueva incidencia</p>
              <Link to="/incidents/create" className="btn btn-primary mt-2">
                <Plus size={18} className="me-1" />
                Nueva Incidencia
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Incidents;
