const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/authSchemas");

const controller = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth");

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.get("/me", protect, controller.getInfo);

module.exports = router;
