import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { incidentService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Upload, ArrowLeft } from 'lucide-react';
import { PRIORITY_OPTIONS } from '../config/constants';

const CreateIncident = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Baja'
  });
  const [files, setFiles] = useState([]);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('priority', formData.priority);
      
      if (files.length > 0) {
        files.forEach(file => {
          data.append('files', file);
        });
      }
      
      const response = await incidentService.createIncident(data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate(`/incidents/${response.data.id}`);
    } catch (err) {
      console.error('Error creating incident:', err);
      setError(err.response?.data?.message || 'Error al crear la incidencia. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="link" 
          className="p-0 me-3" 
          onClick={() => navigate('/incidents')}
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="mb-0">
          <FileText size={28} className="me-2" />
          Nueva Incidencia
        </h1>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ingresa un título descriptivo"
                    required
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    El título es obligatorio.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formPriority">
                  <Form.Label>Prioridad</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    {PRIORITY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-4" controlId="formDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe detalladamente la incidencia"
                required
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                La descripción es obligatoria.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group controlId="formFiles" className="mb-4">
              <Form.Label>Archivos Adjuntos (Opcional)</Form.Label>
              <Form.Control 
                type="file" 
                multiple 
                onChange={handleFileChange}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Formatos permitidos: jpg, png, pdf, doc, docx, xls, xlsx, txt, zip, rar
              </Form.Text>
            </Form.Group>
            
            {files.length > 0 && (
              <div className="mb-4">
                <h6>Archivos seleccionados:</h6>
                <ul className="list-unstyled">
                  {files.map((file, index) => (
                    <li key={index} className="mb-1">
                      <Upload size={16} className="me-2 text-primary" />
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/incidents')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>Crear Incidencia</>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateIncident;
