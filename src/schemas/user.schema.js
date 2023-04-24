import Joi from "joi";

export const userSchemas = Joi.object({
    name: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(3),
  });