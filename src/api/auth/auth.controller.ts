import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponse, PublicUser } from 'src/models/user.models';
import { AuthService } from 'src/services/auth/auth.service';
import { AuthResponseDto, PublicUserDto } from 'src/swagger/schemas/auth.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Public endpoint. Returns user profile and JWT access token.',
  })
  @ApiCreatedResponse({ type: AuthResponseDto })
  register(@Body() body: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Public endpoint. Returns user profile and JWT access token.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() body: LoginDto): Promise<AuthResponse> {
    return this.authService.login(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ type: PublicUserDto })
  me(@CurrentUser() user: PublicUser): PublicUser {
    return user;
  }
}
