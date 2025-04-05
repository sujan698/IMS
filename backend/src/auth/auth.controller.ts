import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';
import { Public } from 'src/helpers/public';
import { User } from '@prisma/client';
import { Request } from 'express';

interface AuthRequest extends Request {
  payload: User;
}

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  async getProfile(@Req() request: AuthRequest) {
    const userId = request.payload?.id;
    return this.authService.getProfile(userId);
  }
}
