import { prisma } from "../utils/prisma.js";

const withProject = { project: { include: { owner: true } } } as const;

export class InvitationRepository {
  findByProjectAndInvitee(projectId: number, inviteeId: number) {
    return prisma.invitation.findUnique({
      where: { projectId_inviteeId: { projectId, inviteeId } },
    });
  }

  findById(id: number) {
    return prisma.invitation.findUnique({ where: { id }, include: withProject });
  }

  create(data: { projectId: number; inviteeId: number; inviterId: number }) {
    return prisma.invitation.create({
      data: { ...data, status: "PENDING" },
      include: withProject,
    });
  }

  reactivate(id: number, inviterId: number) {
    return prisma.invitation.update({
      where: { id },
      data: { status: "PENDING", inviterId },
      include: withProject,
    });
  }

  listForInvitee(inviteeId: number) {
    return prisma.invitation.findMany({
      where: { inviteeId },
      include: withProject,
      orderBy: { createdAt: "desc" },
    });
  }

  setStatusIfPending(
    id: number,
    inviteeId: number,
    status: "ACCEPTED" | "REJECTED",
  ) {
    return prisma.invitation.updateMany({
      where: { id, inviteeId, status: "PENDING" },
      data: { status },
    });
  }
}
