const { DataTypes } = require('sequelize');
const sequelize = require('../helpers/conexion'); // Configuración de tu base de datos

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sponsor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  camper_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Opcional
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'approved', 'declined', 'failed'),
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.ENUM('card', 'pse', 'nequi', 'cash'),
    defaultValue: 'card',
  },
  transaction_id: {
    type: DataTypes.STRING,
    unique: true,
  },
  wompi_reference: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'PAYMENT',
  timestamps: true,
  createdAt: 'payment_date',
  updatedAt: 'updated_at',
});

module.exports = Payment;
