function authorizeRoles(...roles) {
	return (req, res, next) => {
		if (!req.user) {
		res.status(401);
		return next(new Error("Not authorized"));
		}

		const userRole = req.user.role || (req.user.isAdmin ? "admin" : "user");

		if (!roles.includes(userRole)) {
		res.status(403);
		return next(new Error("Forbidden: insufficient permissions"));
		}

		next();
	};
}

module.exports = { authorizeRoles };