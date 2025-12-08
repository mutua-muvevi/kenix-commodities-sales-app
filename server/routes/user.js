// imports
const express = require("express");
const router = express.Router();

// controllers
const { registerJWT } = require("../controllers/user/register/register");
const { loginJWT } = require("../controllers/user/login/login");
const { editUser } = require("../controllers/user/edit/edit");
const { deleteManyUsers } = require("../controllers/user/delete/delete-many");
const { deleteSingleUser } = require("../controllers/user/delete/delete-one");
const { resetPassword } = require("../controllers/user/password/reset");
const { verifyOtp } = require("../controllers/user/password/otp");
const { updatePassword } = require("../controllers/user/password/new");
const { banUser } = require("../controllers/user/ban/ban");
const { fetchMe } = require("../controllers/user/fetch/me");
const { fetchAllUsers } = require("../controllers/user/fetch/all");

// middleware
const { authenticationMiddleware } = require("../middleware/auth/authentication");
const { getMe } = require("../middleware/user/me");
const { fetchUsersAsTheyType } = require("../controllers/user/fetch/typing");

// routes
router.post("/register", registerJWT);
router.post("/login", loginJWT);
router.post("/reset/password", resetPassword);

router.patch("/edit/:userId", authenticationMiddleware, getMe, editUser);
router.patch("/verify/email", authenticationMiddleware, getMe, verifyOtp);
router.patch("/new/password/:resetToken", updatePassword);
router.patch("/ban/user", authenticationMiddleware, getMe, banUser);

router.delete("/delete/user", authenticationMiddleware, getMe, deleteSingleUser);
router.delete("/delete/many", authenticationMiddleware, getMe, deleteManyUsers);

router.get("/fetch/me", authenticationMiddleware, getMe, fetchMe);
router.get("/fetch/all", authenticationMiddleware, getMe, fetchAllUsers);
router.get("/fetch/typing", authenticationMiddleware, getMe, fetchUsersAsTheyType);

module.exports = router;
