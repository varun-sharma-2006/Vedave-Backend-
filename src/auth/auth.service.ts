import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
) {}

  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, phone, password } = registerDto;

    if (email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      throw new ConflictException('Phone already exists');
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : null;

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        passwordHash: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatched = await bcrypt.compare(
      password,
      user.passwordHash ?? '',
    );

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
  sub: user.id,
  email: user.email,
};

const accessToken = await this.jwtService.signAsync(payload);

return {
  success: true,
  message: 'Login successful',
  accessToken,
  data: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
  },
};
  }
}