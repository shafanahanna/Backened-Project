const Joi = require("joi");

const joiUserSchema = Joi.object({
  name: Joi.string(),
  username: Joi.string().alphanum().min(3).max(20),
  phonenumber: Joi.number().min(10),
  email: Joi.string().email(),
  password: Joi.string().required(),
});

const joiProductSchema = Joi.object({
  id: Joi.string(),
  title: Joi.string(),
  description: Joi.string(),
  price: Joi.number().positive(),
  image: Joi.string(),
  category: Joi.string(),
});

module.exports = { joiUserSchema, joiProductSchema };
