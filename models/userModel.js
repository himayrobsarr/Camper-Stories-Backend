const db = require("../helpers/conexion"); // Conexión a la base de datos
const bcrypt = require('bcryptjs');

// Función para iniciar sesión
const login = async (email, password) => {
    try {
        const query = 'SELECT * FROM USER WHERE email = ?';
        const result = await db.query(query, [email]);
        
        if (!result.data.length) {
            throw new Error('Usuario no encontrado');
        }

        const user = result.data[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            throw new Error('Contraseña incorrecta');
        }

        return user;
    } catch (error) {
        throw error;
    }
}

// Obtener todos los usuarios (si es admin)
const getAllUsers = async () => {
    const query = "SELECT id, first_name, last_name, email, role FROM USER";
    return await db.query(query);
}

// Obtener un usuario por ID
const getUserById = async (id) => {
    const query = "SELECT id, first_name, last_name, email, role FROM USER WHERE id = ?";
    return await db.query(query, [id]);
}

// Crear un nuevo usuario
const createUser = async ({ first_name, last_name, email, password, role, document_id }) => {
    if (!['admin', 'camper'].includes(role)) {
        throw new Error("El rol debe ser 'admin' o 'camper'");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
        INSERT INTO USER (first_name, last_name, email, password, role, document_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    return await db.query(query, [
        first_name,
        last_name,
        email.toLowerCase(),
        hashedPassword,
        role,
        document_id // Usamos el document_id en lugar de document_number
    ]);
}


// Actualizar datos de un usuario
const updateUser = async (id, userData) => {
    const query = "UPDATE USER SET ? WHERE id = ?";
    return await db.query(query, [userData, id]);
}

// Eliminar un usuario
const deleteUser = async (id) => {
    const query = "DELETE FROM USER WHERE id = ?";
    return await db.query(query, [id]);
}

module.exports = {
    login,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
