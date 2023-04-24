import Joi from "joi";

export const transactionsSchemas = Joi.object({
    type: Joi.string().valid("entrada", "saida"),
    value: Joi.string(),
    description: Joi.string().max(30),
    date: Joi.string(),
  });