const express = require("express");
const router = express.Router();

const controller = require("../controllers/cart.controller");

const { protect } = require("../middlewares/auth");
const { authorizeRoles } = require("../middlewares/authorize");


router.use(protect, authorizeRoles("user", "admin"));

router.get("/",controller.getAllItems);
router.post("/",controller.addItem);
router.put("/:id",controller.updateItemQuantity);
router.delete("/:id",controller.removeItem);
router.delete("/",controller.clearCart);

module.exports = router;
