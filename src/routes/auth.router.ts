import { AuthController } from "../controllers";
import { Router } from "express";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/refresh-auth", AuthController.refreshAuth);

export default router;
