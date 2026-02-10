const Joi = require("joi");

const registerSchema = Joi.object({
	body: Joi.object({
		username: Joi.string().min(3).max(30).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(8).max(64).required(),
	}).required(),
	params: Joi.object({}).required(),
	query: Joi.object({}).required(),
});

const loginSchema = Joi.object({
	body: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(8).max(64).required(),
	}).required(),
	params: Joi.object({}).required(),
	query: Joi.object({}).required(),
});

module.exports = { registerSchema, loginSchema };