# Documentación del Proyecto

Este documento describe en detalle todos los aspectos del proyecto, incluyendo objetivos, tecnologías utilizadas y consideraciones generales. Se divide en dos secciones principales: la documentación de la API y la documentación de la Web.

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Documentación de la API](#documentación-de-la-api)
  - [Endpoints](#endpoints)
  - [Métodos HTTP](#métodos-http)
  - [Parámetros y Respuestas](#parámetros-y-respuestas)
  - [Autenticación y Seguridad](#autenticación-y-seguridad)
  - [Manejo de Errores](#manejo-de-errores)
- [Documentación de la Web](#documentación-de-la-web)
  - [Arquitectura y Estructura](#arquitectura-y-estructura)
  - [Rutas y Componentes](#rutas-y-componentes)
  - [Estética y Diseño](#estética-y-diseño)
  - [Guías de Uso y Funcionalidades](#guías-de-uso-y-funcionalidades)
- [Estructura del Proyecto](#estructura-del-proyecto)
  - [Estructura de la API](#estructura-de-la-api)
  - [Estructura de la Web](#estructura-de-la-web)
- [Consideraciones Finales](#consideraciones-finales)

## Descripción General

Este proyecto es una aplicación de gestión de incidencias que permite a los usuarios crear, actualizar y eliminar incidencias, así como gestionar archivos adjuntos. La aplicación está dividida en un backend construido con Node.js y Express, y un frontend desarrollado con React.

### Objetivos

- Proporcionar una interfaz intuitiva para la gestión de incidencias.
- Permitir la carga y gestión de archivos adjuntos.
- Implementar un sistema de autenticación y autorización para proteger los datos.

### Tecnologías Utilizadas

- **Backend**: Node.js, Express, MongoDB, Cloudinary (para almacenamiento de archivos).
- **Frontend**: React, React Router, Bootstrap.
- **Otros**: Axios (para las solicitudes HTTP), Lucide React (para los íconos).

## Documentación de la API

### Endpoints

- **GET /incidents**: Obtiene todas las incidencias.
  - **Descripción**: Los administradores ven todas las incidencias, mientras que los usuarios ven solo las de su oficina.
  - **Ejemplo de uso**:
    ```bash
    curl -X GET http://localhost:3000/incidents
    ```

- **POST /incidents**: Crea una nueva incidencia.
  - **Descripción**: Se requiere título y descripción.
  - **Ejemplo de uso**:
    ```bash
    curl -X POST http://localhost:3000/incidents -H "Content-Type: application/json" -d '{"title": "Incidencia 1", "description": "Descripción de la incidencia"}'
    ```

- **PATCH /incidents/:id**: Actualiza una incidencia existente.
  - **Ejemplo de uso**:
    ```bash
    curl -X PATCH http://localhost:3000/incidents/12345 -H "Content-Type: application/json" -d '{"status": "Resuelto"}'
    ```

- **DELETE /incidents/:id**: Elimina una incidencia.
  - **Ejemplo de uso**:
    ```bash
    curl -X DELETE http://localhost:3000/incidents/12345
    ```

- **GET /incidents/:id**: Obtiene los detalles de una incidencia específica.
  - **Ejemplo de uso**:
    ```bash
    curl -X GET http://localhost:3000/incidents/12345
    ```

- **PATCH /incidents/:id/files**: Añade archivos a una incidencia.
  - **Ejemplo de uso**:
    ```bash
    curl -X PATCH http://localhost:3000/incidents/12345/files -F "files=@/path/to/file.pdf"
    ```

- **DELETE /incidents/:id/files**: Elimina un archivo de una incidencia.
  - **Ejemplo de uso**:
    ```bash
    curl -X DELETE http://localhost:3000/incidents/12345/files -H "Content-Type: application/json" -d '{"public_id": "file_public_id"}'
    ```

### Métodos HTTP

- **GET**: Utilizado para obtener datos.
- **POST**: Utilizado para crear nuevos recursos.
- **PATCH**: Utilizado para actualizar recursos existentes.
- **DELETE**: Utilizado para eliminar recursos.

### Parámetros y Respuestas

- **GET /incidents**: 
  - Respuesta: JSON con la lista de incidencias.
- **POST /incidents**: 
  - Parámetros: `title`, `description`, `priority`, `status`.
  - Respuesta: JSON con la incidencia creada.
- **PATCH /incidents/:id**: 
  - Parámetros: `title`, `description`, `priority`, `status`.
  - Respuesta: JSON con la incidencia actualizada.
- **DELETE /incidents/:id**: 
  - Respuesta: Mensaje de confirmación de eliminación.

### Autenticación y Seguridad

Se utiliza un middleware de sesión para verificar la autenticación del usuario antes de permitir el acceso a los endpoints. Se requiere un token de sesión válido en las cabeceras de las solicitudes.

### Manejo de Errores

Se manejan errores comunes como:
- 400: Solicitud incorrecta (falta de parámetros).
- 404: No encontrado (incidencia no existe).
- 500: Error interno del servidor.

## Documentación de la Web

### Arquitectura y Estructura

La aplicación web está construida con React y utiliza React Router para la navegación. Se organiza en componentes reutilizables y páginas, lo que permite una fácil escalabilidad y mantenimiento.

### Rutas y Componentes

- **IncidentDetail**: Muestra los detalles de una incidencia, permite editar y eliminar incidencias, y gestionar archivos adjuntos.
- **Dashboard**: Muestra un resumen de las incidencias y permite la navegación a otras secciones.

### Estética y Diseño

La interfaz utiliza Bootstrap para el diseño responsivo y una paleta de colores coherente para una mejor experiencia de usuario. Se han utilizado íconos de Lucide React para mejorar la usabilidad.

### Guías de Uso y Funcionalidades

Los usuarios pueden:
- Ver detalles de una incidencia.
- Editar la información de la incidencia.
- Subir y eliminar archivos adjuntos.
- Filtrar y buscar incidencias en el dashboard.

## Estructura del Proyecto

### Estructura de la API

```
api/
├── .env                  # Variables de entorno
├── .env.template         # Plantilla de variables de entorno
├── .gitignore            # Archivos y carpetas a ignorar por Git
├── app.js                # Archivo principal de la aplicación
├── config/               # Configuraciones de la aplicación
├── controllers/          # Controladores de la API
├── middlewares/          # Middleware para autenticación y validación
├── models/               # Modelos de datos
├── node_modules/         # Dependencias del proyecto
├── package-lock.json     # Bloqueo de versiones de dependencias
├── package.json          # Información del proyecto y dependencias
└── routes/               # Rutas de la API
```

### Estructura de la Web

```
web/
├── eslint.config.js      # Configuración de ESLint
├── index.html            # Archivo HTML principal
├── node_modules/         # Dependencias del proyecto
├── package-lock.json     # Bloqueo de versiones de dependencias
├── package.json          # Información del proyecto y dependencias
├── postcss.config.js     # Configuración de PostCSS
├── src/                  # Código fuente de la aplicación
├── tailwind.config.js     # Configuración de Tailwind CSS
└── vite.config.js        # Configuración de Vite
```

## Consideraciones Finales

Incluye recomendaciones adicionales, pautas para el mantenimiento futuro y cualquier otra información relevante para el correcto uso y evolución del proyecto.
