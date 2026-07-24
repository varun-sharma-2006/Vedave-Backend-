import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return {
      message: 'Registration endpoint is working!',
      data: registerDto,
    };
  }
}