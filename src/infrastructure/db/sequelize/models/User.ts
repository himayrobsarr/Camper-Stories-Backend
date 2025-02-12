import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'USER',
  timestamps: true
})
export class UserModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    field: 'first_name',
    allowNull: false
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    field: 'last_name',
    allowNull: false
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.INTEGER,
    field: 'document_type_id',
    allowNull: false
  })
  documentType!: number;

  @Column({
    type: DataType.STRING,
    field: 'document_number',
    unique: true,
    allowNull: false
  })
  documentNumber!: string;

  @Column({
    type: DataType.INTEGER,
    field: 'city_id'
  })
  cityId!: number;

  @Column({
    type: DataType.DATE,
    field: 'birth_date'
  })
  birthDate!: Date;

  @Column({
    type: DataType.STRING,
    defaultValue: 'camper'
  })
  role!: string;
} 