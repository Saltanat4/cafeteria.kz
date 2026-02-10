const router = require("express").Router();
const path = require("path");

const viewsPath = path.join(__dirname, "..", "views");

router.get("/", (req, res) => {
	res.sendFile(path.join(viewsPath, "index.html"));
});

router.get("/admin", (req, res) => {
	res.sendFile(path.join(viewsPath, "admin.html"));
});

router.get("/orders", (req, res) => {
	res.sendFile(path.join(viewsPath, "orders.html"));
});

router.get("/cart", (req, res) => {
	res.sendFile(path.join(viewsPath, "cart.html"));
});

router.get("/auth", (req, res) => {
	res.sendFile(path.join(viewsPath, "auth.html"));
});

module.exports = router;
