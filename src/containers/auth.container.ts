import { UserRepository } from "../repositories/user.repository.js";
import { AuthService } from "../services/auth.service.js";

export const userRepository = new UserRepository();
export const authService = new AuthService(userRepository);
