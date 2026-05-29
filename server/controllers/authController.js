import User from '../models/User.js';
import { comparePassword, generatePassword, hashPassword } from '../utils/password.js';
import { signToken, verifyToken } from '../utils/jwt.js';

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    rollNumber: user.rollNumber,
    email: user.email,
    role: user.role,
    course: user.course,
    semester: user.semester,
    profileImage: user.profileImage,
    mustChangePassword: user.mustChangePassword
  };
}

export async function login(req, res, next) {
  try {
      console.log("LOGIN BODY:", req.body);
    const { userId, password } = req.body;
    const user = await User.findOne({ $or: [{ rollNumber: userId }, { email: userId }] });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.userStatus !== 'active') return res.status(403).json({ message: 'Account is inactive' });

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user._id.toString(), role: user.role, rollNumber: user.rollNumber });

    res.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return res.status(401).json({ message: 'No token provided' });

    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Token user not found' });
    if (user.userStatus !== 'active') return res.status(403).json({ message: 'Account is inactive' });

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.json({ message: 'Logged out' });
}

export async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.userStatus !== 'active') return res.status(403).json({ message: 'Account is inactive' });

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = await hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function createAdminSeedPassword() {
  return hashPassword(generatePassword());
}