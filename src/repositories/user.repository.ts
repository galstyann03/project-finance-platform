import { prisma } from "../utils/prisma.js";

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: { email: string; password: string; name?: string }) {
    return prisma.user.create({ data });
  }
}
