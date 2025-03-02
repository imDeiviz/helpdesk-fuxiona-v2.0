import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Modal, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Calendar, 
  User, 
  MapPin, 
  FileText, 
  Paperclip, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  AlertTriangle,
  Upload
} from 'lucide-react';
import { PRIORITY_OPTIONS } from '../config/constants';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedIncident, setEditedIncident] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        const response = await incidentService.getIncidentById(id);
        setIncident(response.data.incident);
        setEditedIncident({
          title: response.data.incident.title,
          description: response.data.incident.description,
          priority: response.data.incident.priority,
          status: response.data.incident.status || 'Pendiente'
        });
      } catch (err) {
        console.error('Error fetching incident:', err);
        setError('Error al cargar la incidencia. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing) {
      setEditedIncident({
        title: incident.title,
        description: incident.description,
        priority: incident.priority,
        status: incident.status || 'Pendiente'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedIncident(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const response = await incidentService.updateIncident(id, {
        ...editedIncident,
        files: incident.files // Ensure existing files are included
      });
      setIncident(response.data.incident);
      setEditing(false);
    } catch (err) {
      console.error('Error updating incident:', err);
      setError('Error al actualizar la incidencia. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncident = async () => {
    try {
      setLoading(true);
      await incidentService.deleteIncident(id);
      navigate('/incidents');
    } catch (err) {
      console.error('Error deleting incident:', err);
      setError('Error al eliminar la incidencia. Por favor, intenta de nuevo más tarde.');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUploadFiles = async () => {
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await incidentService.addFiles(id, formData);
      setIncident(response.data.incident);
      setShowUploadModal(false);
      setFiles([]);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Error al subir los archivos. Por favor, intenta de nuevo más tarde.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteFileId) return;
    
    try {
      setLoading(true);
      const response = await incidentService.removeFile(id, deleteFileId);
      setIncident(prev => ({
        ...prev,
        files: prev.files.filter(file => file.public_id !== deleteFileId) // Update the incident state to remove the deleted file
      }));
      setIncident(response.data.incident);
      setShowDeleteFileModal(false);
      setDeleteFileId(null);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Error al eliminar el archivo. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !incident) {
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

  if (!incident) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">Incidencia no encontrada</div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FileText size={28} className="me-2" />
          Detalle de Incidencia
        </h1>
        <div>
          {editing ? (
            <>
              <Button 
                variant="success" 
                className="me-2" 
                onClick={handleSaveChanges}
                disabled={loading}
              >
                <Save size={18} className="me-1" />
                Guardar
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={handleEditToggle}
              >
                <X size={18} className="me-1" />
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="primary" 
                className="me-2" 
                onClick={handleEditToggle}
              >
                <Edit size={18} className="me-1" />
                Editar
              </Button>
              <Button 
                variant="danger" 
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={18} className="me-1" />
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              {editing ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={editedIncident.title}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="description"
                      value={editedIncident.description}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Prioridad</Form.Label>
                        <Form.Select
                          name="priority"
                          value={editedIncident.priority}
                          onChange={handleInputChange}
                        >
                          {PRIORITY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Estado</Form.Label>
                        <Form.Select
                          name="status"
                          value={editedIncident.status}
                          onChange={handleInputChange}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Progreso">En Progreso</option>
                          <option value="Resuelto">Resuelto</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              ) : (
                <>
                  <div className="d-flex justify-content-between mb-3">
                    <h3 className="mb-0">{incident.title}</h3>
                    <div>
                      <Badge 
                        bg={
                          incident.priority === 'Alta' ? 'danger' : 
                          incident.priority === 'Media' ? 'warning' : 
                          'success'
                        }
                        className="me-2"
                      >
                        {incident.priority}
                      </Badge>
                      <Badge 
                        bg={
                          incident.status === 'Pendiente' ? 'secondary' : 
                          incident.status === 'En Progreso' ? 'info' : 
                          'success'
                        }
                      >
                        {incident.status || 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex mb-2">
                      <Calendar size={18} className="text-muted me-2" />
                      <span className="text-muted">
                        Creado el {new Date(incident.createdAt).toLocaleDateString('es-ES')} a las {new Date(incident.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="d-flex mb-2">
                      <User size={18} className="text-muted me-2" />
                      <span className="text-muted">
                        Solicitante: {incident.name} ({incident.email})
                      </span>
                    </div>
                    
                    <div className="d-flex">
                      <MapPin size={18} className="text-muted me-2" />
                      <span className="text-muted">
                        Oficina: {incident.office}
                      </span>
                    </div>
                  </div>
                  
                  <h5 className="mb-3">Descripción</h5>
                    <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                      {incident.description}
                    </p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <Paperclip size={18} className="me-2" />
                  Archivos Adjuntos
                </h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload size={16} className="me-1" />
                  Subir
                </Button>
              </div>
              
              {incident.files && incident.files.length > 0 ? (
                <ListGroup variant="flush">
                  {incident.files.map((file, index) => (
                    <ListGroup.Item 
                      key={index}
                      className="d-flex justify-content-between align-items-center px-0 py-2 border-bottom"
                    >
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-decoration-none text-truncate"
                        style={{ maxWidth: '80%' }}
                      >
                        {file.public_id.split('/').pop()}
                      </a>
                      <Button 
                        variant="link" 
                        className="text-danger p-0"
                        onClick={() => {
                          setDeleteFileId(file.public_id);
                          setShowDeleteFileModal(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No hay archivos adjuntos</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Incident Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <AlertTriangle size={48} className="text-danger mb-3" />
            <h5>¿Estás seguro de eliminar esta incidencia?</h5>
            <p className="text-muted">Esta acción no se puede deshacer.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteIncident}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload Files Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Subir Archivos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formFiles" className="mb-3">
            <Form.Label>Selecciona los archivos</Form.Label>
            <Form.Control 
              type="file" 
              multiple 
              onChange={handleFileChange}
              disabled={uploading}
            />
            <Form.Text className="text-muted">
              Formatos permitidos: jpg, png, pdf, doc, docx, xls, xlsx, txt, zip, rar
            </Form.Text>
          </Form.Group>
          
          {files.length > 0 && (
            <div className="mt-3">
              <h6>Archivos seleccionados:</h6>
              <ListGroup variant="flush">
                {files.map((file, index) => (
                  <ListGroup.Item key={index} className="px-0 py-1 border-0">
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUploadFiles}
            disabled={uploading || files.length === 0}
          >
            {uploading ? <LoadingSpinner size="small" /> : 'Subir'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete File Modal */}
      <Modal show={showDeleteFileModal} onHide={() => setShowDeleteFileModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <AlertTriangle size={48} className="text-danger mb-3" />
            <h5>¿Estás seguro de eliminar este archivo?</h5>
            <p className="text-muted">Esta acción no se puede deshacer.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteFileModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteFile}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IncidentDetail;
