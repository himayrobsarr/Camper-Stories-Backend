# Tareas y Notas para Mejorar el Proyecto

## Cambios en la Tabla `PAYMENT`
- Cambiar `camper_id` por `user_id`.
  - **Nota**: Esto requerirá actualizar el modelo y las consultas asociadas.

---

## Tabla `CAMPER`

### **Columnas a Revisar y Discutir**
1. **`document_number`**:
   - ¿Es obligatorio? ¿Debe ser único?
2. **`document_type`**:
   - ¿Qué valores posibles tiene? ¿Debe ser un ENUM?
3. **`full_name`**:
   - Si ya se tiene `title` y `description`, ¿es redundante?
4. **`age`**:
   - ¿Es necesario o puede calcularse dinámicamente a partir de la fecha de nacimiento (si se agrega)?
5. **`city`**:
   - ¿Debería relacionarse con una tabla de ciudades?
6. **`profile_picture`**:
   - ¿Debería ser opcional? Validar formato de URL.
7. **`city_id`**:
   - **Nota**: Parece redundante con `city`. Confirmar cuál mantener.
8. **`document_number`**:
   - Aparece listado dos veces. ¿Error o intencional?

### **Faltantes**
- Actualizar el modelo del controlador para reflejar estos cambios.
- Agregar lógica para relacionar los méritos (`MERIT`) con un camper.

---

## API para Proyectos de Campers

### **Estructura del Proyecto**
- Campos: `id`, `title`, `description`, `image`, `code_url`, `created_at`.
  - **Nota**: ¿Qué significa `created_at`? Confirmar si es la fecha de creación del proyecto o un campo de auditoría.

### **Faltantes**
- Crear la API para subir proyectos a la página.
- Pensar en cómo relacionar las tecnologías (`TECHNOLOGY`) con los proyectos.

---

## Tabla `TECHNOLOGY`

### **Estructura**
- Campos: `id`, `name`, `level`.
  - **Nota**: ¿Cómo se determinará `level`? ¿Será un ENUM o un valor numérico?

### **Faltantes**
- Crear la API para que el administrador pueda agregar tecnologías.
- Relacionar tecnologías con proyectos.

---

## Tabla `TRAINING_VIDEO`

### **Estructura**
- Campos: `id`, `camper_id`, `title`, `video_url`, `platform`.
  - **Nota**: Confirmar si `platform` se refiere a una plataforma como YouTube, Vimeo, etc.

### **Faltantes**
- Crear la API para que un camper pueda subir videos de entrenamiento.

---

## Tabla `USER`

### **Estructura**
- Campos: `id`, `first_name`, `last_name`, `email`, `password`, `role`, `document_number`, `created_at`.
  - **Nota**: ¿Cómo se manejará `document_number`? ¿Será único? ¿Es obligatorio?

### **Faltantes**
- Actualizar la lógica del controlador POST `USER` para incluir los campos `document_number` y `created_at`.

---

## Tabla `WEBHOOK_LOG`

### **Estructura**
- Campos: `id`, `payment_id`, `event_type`, `payload`, `received_at`.
  - **Nota**: ¿Qué eventos posibles puede registrar `event_type`? ¿Qué estructura tiene `payload`?

### **Faltantes**
- Crear la API para manejar los registros de `WEBHOOK_LOG`.

---

## Resumen de Tareas Prioritarias

1. Cambiar `camper_id` a `user_id` en la tabla `PAYMENT` y actualizar el modelo.
2. Revisar y actualizar la tabla `CAMPER` y su lógica.
3. Diseñar y desarrollar la API para manejar proyectos y relacionarlos con tecnologías.
4. Crear lógica y API para gestionar videos de entrenamiento.
5. Actualizar la lógica del controlador `USER` para manejar los nuevos campos.
6. Crear la API para manejar `WEBHOOK_LOG`.

---

Confírmame por dónde prefieres comenzar o si necesitas un plan más detallado para algún punto específico.