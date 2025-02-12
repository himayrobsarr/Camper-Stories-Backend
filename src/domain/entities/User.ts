export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentType: number;
  documentNumber: string;
  cityId: number;
  birthDate: Date;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User | null>;
  delete(id: number): Promise<boolean>;
  checkDocumentInCampus(documentNumber: string, campusId: number): Promise<boolean>;
} 