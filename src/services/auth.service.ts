import { UserRepository } from "../repositories/user.repository.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { conflict, unauthenticated } from "../utils/AppError.js";

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(input: RegisterInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw conflict("Email is already registered");
    }

    const password = await hashPassword(input.password);
    const user = await this.userRepository.create({
      email: input.email,
      password,
      name: input.name,
    });

    const token = signToken({ userId: user.id });
    return { token, user };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !(await verifyPassword(input.password, user.password))) {
      throw unauthenticated("Invalid email or password");
    }

    const token = signToken({ userId: user.id });
    return { token, user };
  }
}
