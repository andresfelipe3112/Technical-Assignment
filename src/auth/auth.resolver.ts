
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './dto/auth-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  register(@Args('registerInput') registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Mutation(() => AuthResponse)
  login(@Args('loginInput') loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}