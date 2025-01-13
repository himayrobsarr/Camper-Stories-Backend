
### Rutas de Ciudad (`routes/cityRoutes.js`)
- `GET /cities` - Obtener todas las ciudades.

### Rutas de Usuario (`routes/userRoutes.js`)
- `POST /users/login` - Iniciar sesión.
- `POST /users/register` - Registrar un nuevo usuario.
- `POST /users` - Ruta alternativa para registro.
- `POST /users/logout` - Cerrar sesión.
- `GET /users/:id` - Obtener usuario por ID (protegido).
- `PUT /users/:id` - Actualizar usuario (protegido).
- `DELETE /users/:id` - Eliminar usuario (protegido).

### Rutas de Sueños (`routes/dreamRoutes.js`)
- `GET /dreams` - Obtener todos los sueños (público).
- `GET /dreams/:id` - Obtener un sueño por ID (público).
- `POST /dreams` - Crear un nuevo sueño (protegido).
- `PUT /dreams/:id` - Actualizar un sueño (protegido).
- `DELETE /dreams/:id` - Eliminar un sueño (protegido).

### Rutas de Méritos (`routes/meritRoutes.js`)
- `GET /merits` - Obtener todos los méritos (público).
- `GET /merits/:userId` - Obtener méritos por usuario (protegido).
- `POST /merits/:camperId` - Asignar un mérito (protegido).

### Rutas de Campers (`routes/camperRoutes.js`)
- `GET /campers/graduates` - Obtener graduados.
- `GET /campers/trainees` - Obtener aprendices.
- `GET /campers/:id/dreams` - Obtener sueños por ID de campista.
- `POST /campers/:id/dreams` - Agregar sueño a campista (protegido).
- `DELETE /campers/:id/dreams/:dream_id` - Eliminar sueño de campista (protegido).
- `GET /campers` - Obtener todos los campistas (público).
- `GET /campers/:id` - Obtener campista por ID (protegido).
- `GET /campers/:camperId/videos` - Obtener videos por ID de campista.
- `POST /campers/:id/videos` - Agregar video de entrenamiento (protegido).
- `DELETE /campers/:id/videos/:video_id` - Eliminar video de entrenamiento (protegido).
- `GET /campers/:id/proyects` - Obtener proyectos por ID de campista.
- `POST /campers/:id/proyects` - Agregar proyecto a campista (protegido).
- `DELETE /campers/:id/proyects/:proyect_id` - Eliminar proyecto de campista (protegido).
- `PATCH /campers/:id/status` - Actualizar estado de campista (protegido).
- `POST /campers` - Crear un nuevo camper (protegido).
- `PUT /campers/:id` - Actualizar camper (protegido).
- `DELETE /campers/:id` - Eliminar camper (protegido).

### Rutas de Proyectos (`routes/projectRoutes.js`)
- `GET /projects/:camperid` - Obtener proyectos por ID de camper (público).
- `POST /projects` - Crear un nuevo proyecto (protegido).
- `PUT /projects/:id` - Actualizar un proyecto existente (protegido).

### Rutas de Patrocinadores (`routes/sponsorRoutes.js`)
- `GET /sponsors` - Obtener todos los patrocinadores (público).
- `GET /sponsors/:id` - Obtener un patrocinador por ID (público).
- `POST /sponsors` - Crear un nuevo patrocinador (público).
- `PUT /sponsors/:id` - Actualizar un patrocinador existente (público).
- `DELETE /sponsors/:id` - Eliminar un patrocinador (público).

### Rutas de Carga (`routes/uploadRoutes.js`)
- `POST /upload` - Subir una imagen.

### Rutas de Tecnología (`routes/technologyRoutes.js`)
- `GET /technology` - Obtener todas las tecnologías (público).


### Estructura 

CamperModel
{
  "id": 1,
  "user_id": 2,
  "title": "Camper Destacado",
  "history": "Historia de vida inspiradora.",
  "about": "Apasionado por la tecnología.",
  "image": "https://example.com/image.jpg",
  "main_video_url": "https://youtube.com/video",
  "document_number_id": 3,
  "full_name": "Juan Pérez",
  "age": 25,
  "city_id": 1,
  "profile_picture": "https://example.com/profile.jpg",
  "status": "formacion"
}

CityModel
{
  "id": 1,
  "name": "Ciudad de México"
}

DocumentModel
{
  "id": 1,
  "document_number": "ABC123456"
}

DreamModel
{
  "id": 1,
  "title": "Crear mi startup",
  "description": "Quiero desarrollar una aplicación innovadora.",
  "image_url": "https://example.com/dream.jpg",
  "user_id": 2
}

MeritModel
{
  "id": 1,
  "name": "Estrella de Excelencia",
  "description": "Otorgado por desempeño destacado en el programa."
}

paymentModel (fase beta)

{
  "id": 1,
  "sponsor_id": 3,
  "camper_id": 2,
  "amount": 150.00,
  "payment_status": "approved",
  "payment_method": "card",
  "transaction_id": "TRX123456",
  "wompi_reference": "WOMPI-REF-1234"
}

ProjectModel
{
  "id": 1,
  "title": "Aplicación Web para Gestión",
  "description": "Desarrollo de una app para gestionar proyectos.",
  "image": "https://example.com/project.jpg",
  "code_url": "https://github.com/user/project",
  "camper_id": 2
}

SponsorModel
{
  "id": 1,
  "contribution": 500.00,
  "first_name": "María",
  "last_name": "Gómez",
  "email": "maria.gomez@example.com",
  "phone": "+521234567890",
  "message": "Me alegra apoyar a los campers."
}

technologyModel
{
  "id": 1,
  "name": "JavaScript"
}

userModel
{
  "id": 1,
  "first_name": "Luis",
  "last_name": "Rodríguez",
  "email": "luis.rodriguez@example.com",
  "password": "hashed_password",
  "role": "camper",
  "document_type_id": 1,
  "document_number": "DOC123456",
  "city_id": 2,
  "birth_date": "1998-05-20",
  "created_at": "2025-01-13",
  "camper": {
    "id": 2,
    "title": "Nuevo Camper",
    "history": "Bienvenido a mi perfil de Camper.",
    "about": "Apasionado por aprender.",
    "image": null,
    "main_video_url": null,
    "full_name": "Luis Rodríguez",
    "profile_picture": "https://example.com/default.jpg",
    "status": "formacion"
  }
}








