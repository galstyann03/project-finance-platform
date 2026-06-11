import { Prisma } from "@prisma/client";
import { InvitationRepository } from "../repositories/invitation.repository.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { badInput, conflict, forbidden, notFound } from "../utils/AppError.js";

export class InvitationService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async invite(ownerId: number, projectId: number, email: string) {
    // 1. Only the project owner may invite.
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw notFound("Project not found");
    if (project.ownerId !== ownerId) {
      throw forbidden("Only the project owner can send invitations");
    }

    const invitee = await this.userRepository.findByEmail(email);
    if (!invitee) throw notFound("No user is registered with that email");
    if (invitee.id === ownerId) {
      throw badInput("You are the owner of this project");
    }

    const existing = await this.invitationRepository.findByProjectAndInvitee(
      projectId,
      invitee.id,
    );
    if (existing) {
      if (existing.status === "PENDING") {
        throw conflict("An active invitation already exists for this user");
      }
      if (existing.status === "ACCEPTED") {
        throw conflict("This user is already a member of the project");
      }
      return this.invitationRepository.reactivate(existing.id, ownerId);
    }

    try {
      return await this.invitationRepository.create({
        projectId,
        inviteeId: invitee.id,
        inviterId: ownerId,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw conflict("An active invitation already exists for this user");
      }
      throw e;
    }
  }

  listMine(userId: number) {
    return this.invitationRepository.listForInvitee(userId);
  }

  accept(userId: number, invitationId: number) {
    return this.transition(userId, invitationId, "ACCEPTED");
  }

  reject(userId: number, invitationId: number) {
    return this.transition(userId, invitationId, "REJECTED");
  }

  private async transition(
    userId: number,
    invitationId: number,
    status: "ACCEPTED" | "REJECTED",
  ) {
    const result = await this.invitationRepository.setStatusIfPending(
      invitationId,
      userId,
      status,
    );
    if (result.count === 0) {
      throw conflict("Invitation is not pending or does not belong to you");
    }
    return this.invitationRepository.findById(invitationId);
  }
}
