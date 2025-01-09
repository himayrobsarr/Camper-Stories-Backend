# CampuStories

## Obtener todos los Sponsors



**Method** : GET: 

**URL** : http://localhost:5000/sponsors/

### Success Responses

**Code** : `200 OK`

```javascript
[
  {
    "id": 2,
    "user_id": 1,
    "message": "Looking forward to sponsoring your event!",
    "first_name": "Johny",
    "last_name": "Doe",
    "email": "johndoe@example.com",
    "phone": "1234567890"
  }
]
```

## Obtener todos los Sponsors por ID

**Method** : GET: 

**URL** : http://localhost:5000/sponsors/3

### Success Responses

**Code** : `200 OK`

```javascript
{
  "id": 3,
  "user_id": 1,
  "message": "Looking forward to sponsoring your event!",
  "first_name": "Johny",
  "last_name": "Doe",
  "email": "johndoe@example.com",
  "phone": "1234567890"
}
```

## Agregar un nuevo Sponsor

**Method** : POST: 

**URL** : http://localhost:5000/sponsors/

### Success Responses

**Code** : `200 OK`

```javascript
{
  "user_id": 1,
  "message": "Looking forward to sponsoring your event!",
  "first_name": "Johny",
  "last_name": "Doe",
  "email": "johndoe@example.com",
  "phone": "1234567890"
}
```

```javascript
{
  "message": "Sponsor registrado exitosamente"
}
```

## Actualizar un Sponsor

**Method** : PUT: 

**URL** : http://localhost:5000/sponsors/2

### Success Responses

**Code** : `200 OK`

```javascript
{
	 "first_name": "Johny"
}
```



```javascript
{
  "message": "Información del sponsor actualizada"
}
```

## Eliminar un Sponsor

**Method** : DELETE: 

**URL** : http://localhost:5000/sponsors/2

### Success Responses

**Code** : `200 OK`

```javascript
{
  "message": "Sponsor eliminado"
}
```

## Obtener todos los Users 

**Method** : GET: 

**URL** : http://localhost:5000/users/

### Success Responses

**Code** : `200 OK`

```javascript

```



## Obtener todos los Users por ID desde el Admin

**Method** : GET: 

**URL** : http://localhost:5000/users/admin/11

### Success Responses

**Code** : `200 OK`

```javascript
{
  "id": 11,
  "first_name": "José",
  "last_name": "Díaz",
  "email": "pauldiazguillermo02@gmail.com",
  "role": "admin"
}
```



## Obtener todos los Users por ID desde el camper

**Method** : GET: 

**URL** : http://localhost:5000/users/camper/11

### Success Responses

**Code** : `200 OK`

```javascript
{
  "id": 11,
  "first_name": "santiago",
  "last_name": "giraldo",
  "email": "dbsa@hotmail.es",
  "role": "camper"
}
```



## Registrar un nuevo User

**Method** : POST: 

**URL** : http://localhost:5000/users/registrer

### Success Responses

**Code** : `200 OK`

```javascript
{
  "first_name": "Tony",
  "last_name": "Díaz",
  "email": "tony9@gmail.com",
  "password": "1234",
  "role": "camper",
  "document_number": "123456789",
  "birth_date": "1990-05-15",
  "city": "Medellín"
}
```

## LoginUser

**Method** : POST: 

**URL** : http://localhost:5000/campers/1

### Success Responses

**Code** : `200 OK`

```javascript
{
    "email": "pauldiazGuillermo02@gmail.com",
    "password": "pauldiazjose123"
}
```

```javascript
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImVtYWlsIjoicGF1bGRpYXpndWlsbGVybW8wMkBnbWFpbC5jb20iLCJpYXQiOjE3MzUzMzEyNjQsImV4cCI6MTczNTQxNzY2NH0.9lZTyueQNx_VNTN56TkQ3CN_U0pCkXfp_lNFR9fRiPc",
  "user": {
    "id": 11,
    "email": "pauldiazguillermo02@gmail.com"
  }
}
```



## Obtener todos los Campers

**Method** : GET: 

**URL** : http://localhost:5000/campers/

### Success Responses

**Code** : `200 OK`

```javascript
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Fullstack Software Developer",
    "description": "Apasionada por la tecnología y desarrollo de soluciones innovadoras.",
    "about": "Con más de 2 años de experiencia, especializada en desarrollo FullStack.",
    "image": "/images/natalia.jpg",
    "main_video_url": "https://www.youtube.com/embed/example1"
  },
  {
    "id": 2,
    "user_id": 2,
    "title": "Fullstack Software Developer",
    "description": "Desarrollador enfocado en construir aplicaciones eficientes.",
    "about": "Siempre aprendiendo y aplicando nuevas tecnologías.",
    "image": "/images/cristopher.jpg",
    "main_video_url": "https://www.youtube.com/embed/example2"
  },
	...
]
```

## Obtener todos los Campers por ID

**Method** : GET: 

**URL** : http://localhost:5000/campers/1

### Success Responses

**Code** : `200 OK`

```javascript
{
  "id": 1,
  "user_id": 1,
  "title": "Fullstack Software Developer",
  "description": "Apasionada por la tecnología y desarrollo de soluciones innovadoras.",
  "about": "Con más de 2 años de experiencia, especializada en desarrollo FullStack.",
  "image": "/images/natalia.jpg",
  "main_video_url": "https://www.youtube.com/embed/example1"
}
```

## Agregar un nuevo Camper

**Method** : POST: 

**URL** : http://localhost:5000/campers/

### Success Responses

**Code** : `200 OK`

```javascript
  {
  "user_id": 3,
  "title": "Nuevo Camper",
  "description": "Descripción del camper",
  "about": "Información adicional sobre el camper",
  "image": "https://example.com/imagen.jpg",
  "main_video_url": "https://example.com/video.mp4",
  "document_number_id": 5,
  "full_name": "Nombre Completo",
  "age": 25,
  "city_id": 2,
  "profile_picture": "https://example.com/foto_perfil.jpg"
}

```

``` javascript
  {
    "message": "Camper creado",
    "id": 7
  }
```

## Actualizar un Camper

**Method** : PUT: 

**URL** : http://localhost:5000/campers/2

### Success Responses

**Code** : `200 OK`

```javascript
  {
    "title": "Nuevo Camper"
  }
```

```javascript
  {
    "message": "Camper actualizado"
  }
```

## Eliminar un Sponsor

**Method** : DELETE: 

**URL** : http://localhost:5000/sponsors/2

### Success Responses

**Code** : `200 OK`

```javascript
{
  "message": "Camper eliminado"
}
```

## Logout acount

**Method** : POST: 

**URL** : http://localhost:5000/users/logout

### Success Responses

**Code** : `200 OK`

```javascript
{
  "message": "Sesión cerrada exitosamente"
}
```

## Obtener todos los Méritos

**Method** : GET

**URL** : `http://localhost:5000/merits/`

### Success Responses

**Code** : `200 OK`

```javascript
[
  {
    "id": 1,
    "name": "Espíritu Guerrero",
    "icon": "⚔"
  },
  {
    "id": 2,
    "name": "Nuevos horizontes",
    "icon": "🌅"
  },
  {
    "id": 3,
    "name": "Trota mundos",
    "icon": "🌎"
  }
  ...
]
```

------

## Obtener los Méritos de un Usuario

**Method** : GET

**URL** : `http://localhost:5000/merits/:userId`

### URL Params

- **userId** : ID del usuario cuyos méritos se desean obtener.

### Success Responses

**Code** : `200 OK`

```javascript
javascriptCopiar código[
  {
    "id": 2,
    "name": "Nuevos horizontes",
    "icon": "🌅"
  },
  {
    "id": 4,
    "name": "Primer programador",
    "icon": "💻"
  }
]
```

**Code** : `403 Forbidden`

```javascript
{
  "message": "No tienes permiso para acceder a estos méritos"
}
```

------

## Asignar un Mérito a un Usuario

**Method** : POST

**URL** : `http://localhost:5000/merits/`

### Request Body

```javascript
{
  "user_id": 7,
  "merit_id": 2
}
```

### Success Responses

**Code** : `201 Created`

```javascript
{
  "message": "Mérito asignado exitosamente",
  "id": 5
}
```

**Code** : `403 Forbidden`

```javascript
{
  "message": "No tienes permiso para asignar méritos a otros usuarios."
}
```

------

## Actualizar un Mérito Asignado

**Method** : PUT

**URL** : `http://localhost:5000/merits/`

### Request Body

```javascript
{
  "user_id": 7,
  "merit_id": 3
}
```

### Success Responses

**Code** : `200 OK`

```javascript
{
  "message": "Mérito actualizado exitosamente"
}
```

**Code** : `403 Forbidden`

```javascript
{
  "message": "No tienes permiso para actualizar méritos de otros usuarios."
}
```