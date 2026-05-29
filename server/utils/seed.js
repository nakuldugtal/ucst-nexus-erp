import User from '../models/User.js';
import { hashPassword } from './password.js';

const defaultAdmin = {
  name: 'UCST Admin',
  rollNumber: 'UCST/ADMIN/001',
  email: 'admin@ucst.edu',
  role: 'admin',
  course: 'Administration',
  semester: 'Control Center',
  profileImage: '',
  password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345!',
  mustChangePassword: false
};

const demoStudents = [
  {
    name: 'Aarav Sharma',
    rollNumber: 'UCST/BCA/401',
    email: 'aarav.sharma@ucst.edu',
    course: 'Bachelor of Computer Application (BCA)',
    semester: 'Semester 4',
    password: 'BCA@12345'
  },
  {
    name: 'Ananya Singh',
    rollNumber: 'UCST/BMLT/202',
    email: 'ananya.singh@ucst.edu',
    course: 'B.Sc Medical Lab Technology (BMLT)',
    semester: 'Semester 2',
    password: 'BMLT@12345'
  },
  {
    name: 'Rohan Verma',
    rollNumber: 'UCST/BBA/303',
    email: 'rohan.verma@ucst.edu',
    course: 'Bachelor of Business Administration (BBA)',
    semester: 'Semester 3',
    password: 'BBA@12345'
  },
  {
    name: 'Nisha Kumari',
    rollNumber: 'UCST/BMRIT/104',
    email: 'nisha.kumari@ucst.edu',
    course: 'Bachelor of Medical Radio & Imaging Technology (BMRIT)',
    semester: 'Semester 1',
    password: 'BMRIT@12345'
  }
];

async function ensureUserAccount(seed) {
  const existingUser = await User.findOne({ $or: [{ email: seed.email }, { rollNumber: seed.rollNumber }] });

  if (existingUser) {
    return { user: existingUser, created: false };
  }

  const hashedPassword = await hashPassword(seed.password);
  const user = await User.create({
    name: seed.name,
    rollNumber: seed.rollNumber,
    email: seed.email,
    password: hashedPassword,
    role: seed.role || 'student',
    course: seed.course,
    semester: seed.semester,
    profileImage: seed.profileImage || '',
    mustChangePassword: seed.mustChangePassword ?? true
  });

  return { user, created: true };
}

export async function seedDefaultAccounts() {
  const createdAccounts = [];

  const adminResult = await ensureUserAccount(defaultAdmin);
  if (adminResult.created) {
    createdAccounts.push({ label: 'admin', userId: defaultAdmin.rollNumber, password: defaultAdmin.password });
  }

  for (const student of demoStudents) {
    const result = await ensureUserAccount(student);
    if (result.created) {
      createdAccounts.push({ label: 'student', userId: student.rollNumber, password: student.password });
    }
  }

  if (createdAccounts.length > 0) {
    console.log('Seeded UCST Nexus ERP demo accounts:');
    for (const account of createdAccounts) {
      console.log(`- ${account.label}: ${account.userId} / ${account.password}`);
    }
  }
}