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
  "first_name": "alejandra", 
  "last_name": "Díaz", 
  "email": "aleja98@gmail.com",
  "password": "1234", 
  "role": "camper"
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

```

## Actualizar un Camper

**Method** : PUT: 

**URL** : http://localhost:5000/campers/2

### Success Responses

**Code** : `200 OK`

```javascript

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

