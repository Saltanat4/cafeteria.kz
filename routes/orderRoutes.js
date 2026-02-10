const express = require("express");
const router = express.Router();

const controller = require("../controllers/order.controller");

const { protect } = require("../middlewares/auth");
const { authorizeRoles } = require("../middlewares/authorize");

router.use(protect, authorizeRoles("user", "admin"));

router.get("/",controller.getAllOrders);
router.get("/:id/items",controller.getOrderItems);
router.get("/:id",controller.getOrderByID);
router.post("/",controller.createOrder);
router.put("/:id",controller.updateOrder);

module.exports = router;