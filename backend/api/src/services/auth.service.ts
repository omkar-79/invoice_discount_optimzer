import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../prisma.client';
import { config } from '../config';
import { AppError } from '../middleware/error.middleware';
import { User } from '../types/user.types';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  company?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  async register(registerDto: RegisterDto) {
    const { email, password, name, company } = registerDto;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        company,
      },
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
      },
      token,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
      },
    });

    return user;
  }
}
