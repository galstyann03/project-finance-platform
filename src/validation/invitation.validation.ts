import Joi from "joi";

export const inviteSchema = Joi.object({
  projectId: Joi.string().required(),
  email: Joi.string().email().required(),
});
