import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  getUsers() {
    return this.authService.getUsers();
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }

  @Post('register/options/:username')
  getRegistrationOptions(@Param('username') username: string) {
    return this.authService.generateRegistrationOptions(username);
  }

  @Post('register/verify/:username')
  verifyRegistration(@Param('username') username: string, @Body() body: any) {
    return this.authService.verifyRegistration(username, body);
  }

  @Post('login/options/:username')
  getAuthenticationOptions(@Param('username') username: string) {
    return this.authService.generateAuthenticationOptions(username);
  }

  @Post('login/verify/:username')
  verifyAuthentication(@Param('username') username: string, @Body() body: any) {
    return this.authService.verifyAuthentication(username, body);
  }
}
