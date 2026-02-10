const router = require("express").Router();
const controller = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { updateUserSchema } = require("../validators/userSchemas");

router.get("/me", protect, controller.getUser);

router.put("/me",protect,validate(updateUserSchema), controller.updateUser);

module.exports = router;