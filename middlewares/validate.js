function validate(schema) {
	return (req, res, next) => {
		const { error, value } = schema.validate(
		{ body: req.body, params: req.params, query: req.query },
		{ abortEarly: false, stripUnknown: true }
		);

		if (error) {
		res.status(400);
		return next(new Error(error.details.map((d) => d.message).join(", ")));
		}

		req.body = value.body;
		req.params = value.params;
		req.query = value.query;

		next();
	};
}

module.exports = validate;
