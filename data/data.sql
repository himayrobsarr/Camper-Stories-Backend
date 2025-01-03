-- Insertar usuarios iniciales
INSERT INTO USER (first_name, last_name, email, password, role) VALUES
('Natalia', 'Diaz Suarez', 'natalia@example.com', 'hashed_password1', 'camper'),
('Cristopher', 'Buitrago', 'cristopher@example.com', 'hashed_password2', 'camper'),
('Silvia', 'Angarita', 'silvia@example.com', 'hashed_password3', 'camper'),
('Admin', 'Admin', 'admin@example.com', 'hashed_password4', 'admin');

-- Insertar perfiles de campers
INSERT INTO CAMPER (user_id, title, description, about, image, main_video_url) VALUES
(1, 'Fullstack Software Developer', 'Apasionada por la tecnología y desarrollo de soluciones innovadoras.', 'Con más de 2 años de experiencia, especializada en desarrollo FullStack.', '/images/natalia.jpg', 'https://www.youtube.com/embed/example1'),
(2, 'Fullstack Software Developer', 'Desarrollador enfocado en construir aplicaciones eficientes.', 'Siempre aprendiendo y aplicando nuevas tecnologías.', '/images/cristopher.jpg', 'https://www.youtube.com/embed/example2'),
(3, 'Backend Engineer', 'Enfocada en la arquitectura y diseño de sistemas robustos.', 'Disfruto trabajar en proyectos que optimicen procesos.', '/images/silvia.jpg', 'https://www.youtube.com/embed/example3');

-- Insertar tecnologías iniciales
INSERT INTO TECHNOLOGY (name, level) VALUES
('TypeScript', 'Advanced'),
('JavaScript', 'Advanced'),
('ReactJS', 'Advanced'),
('Node.js', 'Intermediate'),
('PostgreSQL', 'Intermediate'),
('MongoDB', 'Intermediate'),
('HTML/CSS', 'Expert');

-- Relacionar campers con tecnologías (CAMPER_TECHNOLOGY)
INSERT INTO CAMPER_TECHNOLOGY (camper_id, technology_id) VALUES
(1, 1), -- Natalia -> TypeScript
(1, 2), -- Natalia -> JavaScript
(1, 3), -- Natalia -> ReactJS
(2, 2), -- Cristopher -> JavaScript
(2, 4), -- Cristopher -> Node.js
(3, 5), -- Silvia -> PostgreSQL
(3, 6); -- Silvia -> MongoDB

-- Insertar proyectos iniciales
INSERT INTO PROJECT (title, description, image, code_url) VALUES
('E-commerce Platform', 'Plataforma de comercio electrónico con carrito de compras y pagos.', '/images/project1.jpg', 'https://github.com/example/e-commerce'),
('Task Manager App', 'Aplicación de gestión de tareas con colaboración en tiempo real.', '/images/project2.jpg', 'https://github.com/example/task-manager'),
('Weather Forecast Dashboard', 'Dashboard interactivo que muestra pronósticos del tiempo.', '/images/project3.jpg', 'https://github.com/example/weather-dashboard');

-- Relacionar campers con proyectos (CAMPER_PROJECT)
INSERT INTO CAMPER_PROJECT (camper_id, project_id) VALUES
(1, 1), -- Natalia -> E-commerce Platform
(2, 2), -- Cristopher -> Task Manager App
(3, 3); -- Silvia -> Weather Forecast Dashboard

-- Insertar videos de formación (TRAINING_VIDEO)
INSERT INTO TRAINING_VIDEO (camper_id, title, video_url) VALUES
(1, 'Video 1: Introducción a TypeScript', 'https://www.youtube.com/embed/example1'),
(1, 'Video 2: Fundamentos de ReactJS', 'https://www.youtube.com/embed/example2'),
(2, 'Video 1: JavaScript Avanzado', 'https://www.youtube.com/embed/example3'),
(3, 'Video 1: Diseño de Bases de Datos', 'https://www.youtube.com/embed/example4');

-- Insertar patrocinadores iniciales
INSERT INTO SPONSOR (id, first_name, last_name, email, phone, message) VALUES
(1, 'John', 'Doe', 'john@example.com', '+123456789', 'Estoy encantado de apoyar a los talentosos desarrolladores de Campuslands.');

-- Insertar pagos realizados por patrocinadores (PAYMENT)
INSERT INTO PAYMENT (sponsor_id, camper_id, amount, payment_date) VALUES
(1, 1, 150.00, NOW()), -- John patrocina a Natalia
(1, 2, 100.00, NOW()); -- John patrocina a Cristopher
