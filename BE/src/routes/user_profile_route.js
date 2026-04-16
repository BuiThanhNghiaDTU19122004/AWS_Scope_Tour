const express = require("express");
const UserController = require("../controllers/user_controller");
const upload = require("../middlewares/uploadImage");
const router = express.Router();

router.get("/:userId", UserController.getProfileById);
router.put("/:userId", upload.single("image"), UserController.updateProfile);

// Legacy endpoints for backward compatibility.
router.post("/load", UserController.getProfileById);
router.post("/update", upload.single("image"), UserController.updateProfile);

module.exports = router;