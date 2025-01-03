-- Crear base de datos
CREATE DATABASE Campuslands;
USE Campuslands;

-- Tabla USER para manejar la autenticación y los datos generales de usuarios
CREATE TABLE USER (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Contraseña cifrada
    role ENUM('admin', 'camper', 'sponsor') DEFAULT 'camper',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla CAMPER para el perfil específico de campers
CREATE TABLE CAMPER (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Relación uno a uno con USER
    title VARCHAR(100) NOT NULL, -- Título como "Fullstack Developer"
    description TEXT NOT NULL,
    about TEXT,
    image VARCHAR(500), -- Imagen del perfil
    main_video_url VARCHAR(500), -- Video principal del camper
    FOREIGN KEY (user_id) REFERENCES USER(id) ON DELETE CASCADE
);

-- Tabla TECHNOLOGY para registrar tecnologías
CREATE TABLE TECHNOLOGY (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Beginner'
);

-- Tabla intermedia para CAMPER y TECHNOLOGY (muchos a muchos)
CREATE TABLE CAMPER_TECHNOLOGY (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camper_id INT NOT NULL,
    technology_id INT NOT NULL,
    FOREIGN KEY (camper_id) REFERENCES CAMPER(id) ON DELETE CASCADE,
    FOREIGN KEY (technology_id) REFERENCES TECHNOLOGY(id) ON DELETE CASCADE
);

-- Tabla PROJECT para proyectos de campers
CREATE TABLE PROJECT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(500), -- Imagen asociada al proyecto
    code_url VARCHAR(500), -- URL del repositorio del código
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia para CAMPER y PROJECT (muchos a muchos)
CREATE TABLE CAMPER_PROJECT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camper_id INT NOT NULL,
    project_id INT NOT NULL,
    FOREIGN KEY (camper_id) REFERENCES CAMPER(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES PROJECT(id) ON DELETE CASCADE
);

-- Tabla TRAINING_VIDEO para videos de formación de campers
CREATE TABLE TRAINING_VIDEO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camper_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (camper_id) REFERENCES CAMPER(id) ON DELETE CASCADE
);

-- Tabla SPONSOR para gestionar patrocinadores
CREATE TABLE SPONSOR (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Relación con USER
    message TEXT, -- Mensaje opcional del patrocinador
    FOREIGN KEY (user_id) REFERENCES USER(id) ON DELETE CASCADE
);

-- Tabla PAYMENT para registrar pagos de patrocinadores
CREATE TABLE PAYMENT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sponsor_id INT NOT NULL,
    camper_id INT, -- Relación opcional si el pago está dirigido a un camper específico
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sponsor_id) REFERENCES SPONSOR(id) ON DELETE CASCADE,
    FOREIGN KEY (camper_id) REFERENCES CAMPER(id) ON DELETE CASCADE
);

CREATE TABLE SPONSOR_CAMPER (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sponsor_id INT NOT NULL, -- Relación con la tabla SPONSOR
    camper_id INT NOT NULL,  -- Relación con la tabla CAMPER
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha de inicio
    end_date TIMESTAMP NULL, -- Fecha de finalización (opcional)
    status ENUM('active', 'completed', 'canceled') DEFAULT 'active', -- Estado del patrocinio
    FOREIGN KEY (sponsor_id) REFERENCES SPONSOR(id) ON DELETE CASCADE,
    FOREIGN KEY (camper_id) REFERENCES CAMPER(id) ON DELETE CASCADE
);

DELIMITER //

CREATE TRIGGER after_user_insert
AFTER INSERT ON USER
FOR EACH ROW
BEGIN
    IF NEW.role = 'camper' THEN
        INSERT INTO CAMPER (user_id, title, description, about, image, main_video_url)
        VALUES (NEW.id, 'Título predeterminado', 'Descripción predeterminada', 'Acerca del camper predeterminado', NULL, NULL);
    END IF;
END//

DELIMITER ;


-- Crear tabla MERIT
CREATE TABLE MERIT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    icon VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
);

-- Crear tabla intermedia CAMPER_MERIT
CREATE TABLE CAMPER_MERIT (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camper_id INT NOT NULL,
    merit_id INT NOT NULL,
    FOREIGN KEY (camper_id) REFERENCES CAMPER(id) ON DELETE CASCADE,
    FOREIGN KEY (merit_id) REFERENCES MERIT(id) ON DELETE CASCADE
);

