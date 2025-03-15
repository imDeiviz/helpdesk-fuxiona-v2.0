# Documentación del Proyecto

## Descripción General
Este proyecto tiene como objetivo proporcionar un sistema de gestión de incidencias que permite a los usuarios reportar, rastrear y gestionar incidencias de manera eficiente. Está diseñado para ser utilizado por equipos de soporte técnico y usuarios finales, facilitando la comunicación y la resolución de problemas.

## Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Uso y Funcionalidades](#uso-y-funcionalidades)
- [Documentación de Archivos](#documentación-de-archivos)
- [Pruebas con Postman](#pruebas-con-postman)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Tecnologías Utilizadas
- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express**: Framework para construir aplicaciones web y APIs.
- **React**: Biblioteca para construir interfaces de usuario.
- **MongoDB**: Base de datos NoSQL para almacenar datos de incidencias.
- **Bootstrap**: Framework CSS para un diseño responsivo y atractivo.

## Arquitectura del Proyecto
La estructura del proyecto se organiza de la siguiente manera:
- **Backend (API)**: 
  - `api/`: Contiene la lógica del servidor, controladores, modelos y rutas.
- **Frontend (Web)**: 
  - `web/`: Contiene la aplicación React, incluyendo componentes, páginas y servicios.

## Estructura del Proyecto
```
api/
├── .env
├── .env.template
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
├── config/
│   ├── cloudinary.config.js
│   ├── db.config.js
│   └── routes.config.js
├── controllers/
│   ├── incidents.controller.js
│   ├── sessions.controller.js
│   └── users.controller.js
├── middlewares/
│   ├── checkUserRole.middleware.js
│   ├── cors.middleware.js
│   ├── session.middleware.js
│   └── upload.middleware.js
└── models/
    ├── incident.model.js
    ├── session.model.js
    └── user.model.js
└── routes/
    ├── incidents.routes.js
    ├── sessions.routes.js
    └── users.routes.js
```

## Documentación de Archivos

### CreateIncident.jsx
- **Descripción**: Este componente permite a los usuarios crear una nueva incidencia. Incluye un formulario que solicita un título, una descripción, una prioridad y la opción de adjuntar archivos.
- **Funcionalidades**:
  - Validación de campos obligatorios (título y descripción).
  - Manejo de archivos adjuntos con soporte para múltiples formatos.
  - Navegación a la lista de incidencias después de la creación exitosa.

### incidents.controller.js
- **Descripción**: Este controlador maneja las operaciones relacionadas con las incidencias, incluyendo la creación, obtención, actualización y eliminación de incidencias.
- **Funcionalidades**:
  - `getAll`: Recupera todas las incidencias o solo las de la oficina del usuario autenticado, dependiendo de su rol.
  - `create`: Crea una nueva incidencia, validando que se proporcionen un título y una descripción, y permite la carga de archivos.
  - `removeFile`: Elimina un archivo adjunto de una incidencia.
  - `addFiles`: Añade archivos a una incidencia existente.
  - `downloadFile`: Permite descargar un archivo adjunto de una incidencia.
  - `getDetail`: Recupera los detalles de una incidencia específica, verificando los permisos del usuario.
  - `update`: Actualiza los campos de una incidencia existente.
  - `delete`: Elimina una incidencia y sus archivos adjuntos de Cloudinary.

### IncidentDetail.jsx
- **Descripción**: Este componente muestra los detalles de una incidencia específica, permitiendo a los usuarios editar la incidencia, eliminarla o subir archivos adjuntos.
- **Funcionalidades**:
  - Carga de los detalles de la incidencia al montarse el componente.
  - Permite editar el título, la descripción, la prioridad y el estado de la incidencia.
  - Opción para eliminar la incidencia y sus archivos adjuntos.
  - Opción para subir nuevos archivos adjuntos a la incidencia existente.
  - Manejo de errores y estados de carga para mejorar la experiencia del usuario.

### incidents.routes.js
- **Descripción**: Este archivo define las rutas para la gestión de incidencias en la API.
- **Rutas**:
  - `GET /`: Recupera todas las incidencias (solo para usuarios autenticados).
  - `POST /`: Crea una nueva incidencia, permitiendo la carga de archivos adjuntos (solo para usuarios autenticados).
  - `PATCH /:id/files`: Añade archivos a una incidencia existente (solo para usuarios autenticados).
  - `DELETE /:id/files`: Elimina un archivo adjunto de una incidencia (solo para usuarios autenticados).
  - `GET /:id`: Recupera los detalles de una incidencia específica (solo para usuarios autenticados).
  - `PATCH /:id`: Actualiza una incidencia existente (solo para usuarios autenticados y con verificación de rol).
  - `DELETE /:id`: Elimina una incidencia (solo para usuarios autenticados).

- **app.js**: Archivo principal que configura y arranca el servidor Express.
- **config/**: Contiene archivos de configuración para la base de datos y rutas.
- **controllers/**: Contiene la lógica de negocio para manejar las solicitudes y respuestas de la API.
  - **incidents.controller.js**: Controlador para gestionar incidencias.
  - **sessions.controller.js**: Controlador para gestionar sesiones de usuario.
  - **users.controller.js**: Controlador para gestionar usuarios.
- **middlewares/**: Contiene middlewares para manejar la autenticación, autorización y otras funciones intermedias.
- **models/**: Contiene los modelos de datos que representan las entidades en la base de datos.
- **routes/**: Contiene las definiciones de rutas para la API.

## Pruebas con Postman
### Endpoints de la API

#### 1. Crear una nueva incidencia
- **Método**: POST
- **URL**: `/incidents`
- **Cuerpo**:
  ```json
  {
    "title": "Título de la incidencia",
    "description": "Descripción de la incidencia",
    "status": "abierto"
  }
  ```
- **Respuesta Esperada**:
  - **Código**: 201 Created
  - **Cuerpo**:
    ```json
    {
      "message": "Incidencia creada con éxito",
      "incident": {
        "id": "12345",
        "title": "Título de la incidencia",
        "description": "Descripción de la incidencia",
        "status": "abierto"
      }
    }
    ```

#### 2. Obtener todas las incidencias
- **Método**: GET
- **URL**: `/incidents`
- **Respuesta Esperada**:
  - **Código**: 200 OK
  - **Cuerpo**:
    ```json
    [
      {
        "id": "12345",
        "title": "Título de la incidencia",
        "description": "Descripción de la incidencia",
        "status": "abierto"
      },
      ...
    ]
    ```

#### 3. Obtener una incidencia específica
- **Método**: GET
- **URL**: `/incidents/:id`
- **Respuesta Esperada**:
  - **Código**: 200 OK
  - **Cuerpo**:
    ```json
    {
      "id": "12345",
      "title": "Título de la incidencia",
      "description": "Descripción de la incidencia",
      "status": "abierto"
    }
    ```

#### 4. Actualizar una incidencia
- **Método**: PUT
- **URL**: `/incidents/:id`
- **Cuerpo**:
  ```json
  {
    "status": "cerrado"
  }
  ```
- **Respuesta Esperada**:
  - **Código**: 200 OK
  - **Cuerpo**:
    ```json
    {
      "message": "Incidencia actualizada con éxito"
    }
    ```

#### 5. Eliminar una incidencia
- **Método**: DELETE
- **URL**: `/incidents/:id`
- **Respuesta Esperada**:
  - **Código**: 204 No Content

#### 6. Iniciar sesión
- **Método**: POST
- **URL**: `/sessions`
- **Cuerpo**:
  ```json
  {
    "username": "usuario",
    "password": "contraseña"
  }
  ```
- **Respuesta Esperada**:
  - **Código**: 200 OK
  - **Cuerpo**:
    ```json
    {
      "message": "Inicio de sesión exitoso",
      "token": "jwt-token"
    }
    ```

#### 7. Obtener información del usuario
- **Método**: GET
- **URL**: `/users/:id`
- **Respuesta Esperada**:
  - **Código**: 200 OK
  - **Cuerpo**:
    ```json
    {
      "id": "123",
      "username": "usuario",
      "role": "admin"
    }
    ```

#### 8. Crear un nuevo usuario
- **Método**: POST
- **URL**: `/users`
- **Cuerpo**:
  ```json
  {
    "username": "nuevoUsuario",
    "password": "contraseña",
    "role": "usuario"
  }
  ```
- **Respuesta Esperada**:
  - **Código**: 201 Created
  - **Cuerpo**:
    ```json
    {
      "message": "Usuario creado con éxito"
    }
    ```

#### 9. Actualizar un usuario
- **Método**: PUT
- **URL**: `/users/:id`
- **Cuerpo**:
  ```json
  {
    "role": "admin"
  }
  ```
- **Respuesta Esperada**:
  - **Código**: 200 OK
  - **Cuerpo**:
    ```json
    {
      "message": "Usuario actualizado con éxito"
    }
    ```

#### 10. Eliminar un usuario
- **Método**: DELETE
- **URL**: `/users/:id`
- **Respuesta Esperada**:
  - **Código**: 204 No Content

## Contribución
Si desea contribuir al proyecto, siga estas pautas:
- Mantenga un estilo de código limpio y consistente.
- Realice cambios en una rama separada y envíe un pull request para revisión.

## Licencia
Este proyecto está bajo la licencia MIT.
