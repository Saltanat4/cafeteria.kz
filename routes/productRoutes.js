const express = require("express");
const router = express.Router();

const controller = require("../controllers/product.controller");

const { protect } = require("../middlewares/auth");
const { authorizeRoles } = require("../middlewares/authorize");

router.get("/", controller.getAllProducts);
router.get("/:id", controller.getProductByID);

router.post("/",protect,authorizeRoles("admin"),controller.createProduct);

router.put("/:id",protect,authorizeRoles("admin"),controller.updateProduct);

router.delete("/:id",protect,authorizeRoles("admin"),controller.deleteProduct);

module.exports = router;