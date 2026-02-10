const Joi = require("joi");

exports.updateUserSchema = Joi.object({
	body: Joi.object({
		username: Joi.string().min(2).max(30),
		email: Joi.string().email(),
		password: Joi.string().min(8).max(64),
	}).min(1),
	params: Joi.object({}),
	query: Joi.object({}),
});
