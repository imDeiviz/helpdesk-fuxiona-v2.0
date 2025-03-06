import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';


const Dashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusStats, setStatusStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    byPriority: {
      Alta: 0,
      Media: 0,
      Baja: 0
    }
  });

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const response = await incidentService.getAllIncidents();
        setIncidents(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const pending = response.data.filter(inc => inc.status === 'Pendiente').length;
        const inProgress = response.data.filter(inc => inc.status === 'En Progreso').length;
        const resolved = response.data.filter(inc => inc.status === 'Resuelto').length;
        const activeIncidents = response.data.filter(inc => inc.status === 'Pendiente' || inc.status === 'En Progreso');

        // Count by status
        const pendingCount = response.data.filter(inc => inc.status === 'Pendiente').length;
        const inProgressCount = response.data.filter(inc => inc.status === 'En Progreso').length;
        const resolvedCount = response.data.filter(inc => inc.status === 'Resuelto').length;

        setStatusStats({
          pending: pendingCount,
          inProgress: inProgressCount,
          resolved: resolvedCount
        });

        // Count by priority
        const byPriority = {
          Alta: activeIncidents.filter(inc => inc.priority === 'Alta').length,
          Media: activeIncidents.filter(inc => inc.priority === 'Media').length,
          Baja: activeIncidents.filter(inc => inc.priority === 'Baja').length
        };
        
        setStats({
          total,
          pending,
          inProgress,
          resolved,
          byPriority
        });
        
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError('Error al cargar las incidencias. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Prepare chart data
  const chartData = [
    { name: 'Alta', value: stats.byPriority.Alta, fill: '#dc3545' },
    { name: 'Media', value: stats.byPriority.Media, fill: '#fd7e14' },
    { name: 'Baja', value: stats.byPriority.Baja, fill: '#198754' }
  ];

  // Recent incidents (last 5)
  const recentIncidents = incidents.slice(0, 5);

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
        <h1 className="mb-0">Dashboard</h1>
        <div>
          <span className="text-muted me-2">Bienvenido,</span>
          <span className="fw-bold">{user?.name}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <FileText size={24} className="text-primary" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Incidencias</h6>
                <h3 className="mb-0">{stats.total}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <Clock size={24} className="text-warning" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Pendientes</h6>
                <h3 className="mb-0">{stats.pending}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <AlertTriangle size={24} className="text-info" />
              </div>
              <div>
                <h6 className="text-muted mb-1">En Progreso</h6>
                <h3 className="mb-0">{stats.inProgress}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm stat-card">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <CheckCircle size={24} className="text-success" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Resueltas</h6>
                <h3 className="mb-0">{stats.resolved}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts and Recent Incidents */}
      <Row className="g-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="card-title mb-0">Incidencias por Estado</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pendientes', value: (statusStats.pending / (statusStats.pending + statusStats.inProgress + statusStats.resolved)) * 100, fill: '#fd7e14' }, // Naranja
                        { name: 'En Progreso', value: (statusStats.inProgress / (statusStats.pending + statusStats.inProgress + statusStats.resolved)) * 100, fill: '#007bff' }, // Azul
                        { name: 'Resueltas', value: (statusStats.resolved / (statusStats.pending + statusStats.inProgress + statusStats.resolved)) * 100, fill: '#28a745' } // Verde
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ percent }) => `${(percent * 100).toFixed(2)}%`}
                      labelLine={false}

                    />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">
                  <BarChart3 size={20} className="me-2" />
                  Incidencias por Prioridad
                </h5>
              </div>
              
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#b000e8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Incidencias Recientes</h5>
                <Link to="/incidents" className="btn btn-sm btn-outline-primary">Ver todas</Link>
              </div>
              
              {recentIncidents.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentIncidents.map(incident => (
                    <Link 
                      key={incident._id} 
                      to={`/incidents/${incident._id}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-0 py-3 border-bottom"
                    >
                      <div>
                        <h6 className="mb-1">{incident.title}</h6>
                        <small className="text-muted">
                          {new Date(incident.createdAt).toLocaleDateString()} - {incident.office}
                        </small>
                      </div>
                      <Badge 
                        bg={
                          incident.priority === 'Alta' ? 'danger' : 
                          incident.priority === 'Media' ? 'warning' : 
                          'success'
                        }
                      >
                        {incident.priority}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No hay incidencias recientes</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
