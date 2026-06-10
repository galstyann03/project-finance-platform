import type { ObjectSchema } from "joi";
import { badInput } from "../utils/AppError.js";

export function validate<T>(schema: ObjectSchema<T>, data: unknown): T {
  const { value, error } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    throw badInput(error.details.map((d) => d.message).join(", "));
  }
  return value as T;
}
