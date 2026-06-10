import Joi from "joi";

export const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  location: Joi.string().min(1).max(200).required(),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  location: Joi.string().min(1).max(200),
}).min(1);
