const Joi = require("joi");

const idParamSchema = Joi.object({
	body: Joi.object({}).required(),
	params: Joi.object({
		id: Joi.string().length(24).hex().required(),
	}).required(),
	query: Joi.object({}).required(),
});

module.exports = { idParamSchema };
