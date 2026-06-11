import { InvitationRepository } from "../repositories/invitation.repository.js";
import { InvitationService } from "../services/invitation.service.js";
import { projectRepository } from "./project.container.js";
import { userRepository } from "./auth.container.js";

export const invitationRepository = new InvitationRepository();
export const invitationService = new InvitationService(
  invitationRepository,
  projectRepository,
  userRepository,
);
