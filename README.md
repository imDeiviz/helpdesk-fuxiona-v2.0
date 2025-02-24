# helpdesk-fuxiona-2

## Documentación de la Carpeta `api/`

### Gestión de Incidencias

#### Endpoints

1. **Crear Incidencia**
   - **Método:** `POST`
   - **Ruta:** `/api/v1/incidencias`
   - **Cuerpo de la Solicitud:**
     ```json
     {
       "titulo": "Título de la incidencia",
       "descripcion": "Descripción de la incidencia"
     }
     ```
   - **Respuesta Exitosa:**
     ```json
     {
       "message": "Incidencia creada exitosamente",
       "incidencia": {
         "titulo": "Título de la incidencia",
         "descripcion": "Descripción de la incidencia",
         "estado": "Pendiente",
         "createdAt": "2023-01-01T00:00:00.000Z",
         "updatedAt": "2023-01-01T00:00:00.000Z"
       }
     }
     ```

2. **Obtener Detalle de Incidencia**
   - **Método:** `GET`
   - **Ruta:** `/api/v1/incidencias/:id`
   - **Respuesta Exitosa:**
     ```json
     {
       "titulo": "Título de la incidencia",
       "descripcion": "Descripción de la incidencia",
       "estado": "Pendiente",
       "createdAt": "2023-01-01T00:00:00.000Z",
       "updatedAt": "2023-01-01T00:00:00.000Z"
     }
     ```

3. **Actualizar Incidencia**
   - **Método:** `PATCH`
   - **Ruta:** `/api/v1/incidencias/:id`
   - **Cuerpo de la Solicitud (puede incluir título, descripción y estado):**
     ```json
     {
       "titulo": "Nuevo título",
       "descripcion": "Nueva descripción",
       "estado": "Resuelta" // Este campo es opcional
     }
     ```
   - **Respuesta Exitosa:**
     ```json
     {
       "message": "Incidencia actualizada exitosamente",
       "incidencia": {
         "titulo": "Nuevo título",
         "descripcion": "Nueva descripción",
         "estado": "Resuelta",
         "createdAt": "2023-01-01T00:00:00.000Z",
         "updatedAt": "2023-01-02T00:00:00.000Z"
       }
     }
     ```

4. **Eliminar Incidencia**
   - **Método:** `DELETE`
   - **Ruta:** `/api/v1/incidencias/:id`
   - **Respuesta Exitosa:**
     ```json
     {
       "message": "Incidencia eliminada exitosamente"
     }
     ```

#### Notas
- Todos los endpoints requieren autenticación a través del middleware de sesión.

### Descripción Detallada de Cada Archivo

- **app.js**: Configura la aplicación Express, inicializa la conexión a MongoDB y define los middlewares y rutas.
- **package.json**: Contiene las dependencias y scripts del proyecto.
- **config/db.config.js**: Maneja la conexión a la base de datos MongoDB.
- **controllers/users.controller.js**: Gestiona las operaciones relacionadas con los usuarios.
- **controllers/sessions.controller.js**: Maneja las operaciones de inicio y cierre de sesión.
- **middlewares/session.middleware.js**: Verifica la autenticación del usuario.
- **models/user.model.js**: Define el esquema del modelo de usuario.
- **routes/users.routes.js**: Define las rutas para las operaciones de usuario.
- **routes/sessions.routes.js**: Define las rutas para las operaciones de sesión.

### Cómo Ejecutar Pruebas con Postman

1. **Iniciar el Servidor**: Asegúrate de que el servidor esté en funcionamiento ejecutando el siguiente comando en la terminal:
   ```bash
   npm run dev
   ```

2. **Probar las Rutas**:
   - **Crear Usuario**: Envía una solicitud POST a `http://localhost:3000/api/v1/users` con el cuerpo en formato JSON:
     ```json
     {
       "name": "Nombre",
       "email": "correo@example.com",
       "password": "contraseña",
       "office": "Oficina"
     }
     ```

   - **Iniciar Sesión**: Envía una solicitud POST a `http://localhost:3000/api/v1/sessions` con el cuerpo en formato JSON:
     ```json
     {
       "email": "correo@example.com",
       "password": "contraseña"
     }
     ```

   - **Obtener Perfil**: Envía una solicitud GET a `http://localhost:3000/api/v1/users/me` con el token de sesión en las cookies.

### Conclusión
Esta documentación está diseñada para ser clara y comprensible, orientada tanto a nuevos desarrolladores como a aquellos que requieran un conocimiento profundo del API.
