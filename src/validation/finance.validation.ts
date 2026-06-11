import Joi from "joi";

export const createRecordSchema = Joi.object({
  projectId: Joi.string().required(),
  name: Joi.string().min(1).max(200).required(),
  amount: Joi.number().positive().required(),
});

export const updateRecordSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  amount: Joi.number().positive(),
}).min(1);
