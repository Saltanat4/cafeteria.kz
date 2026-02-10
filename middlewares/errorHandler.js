function notFound(req, res, next) {
	res.status(404);
	next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
	const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

	const payload = {
		message: err.message || "Internal Server Error",
	};

	if (process.env.NODE_ENV !== "production") {
		payload.stack = err.stack;
	}

	res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };
