import { Router } from "express";
import { ProductController } from "../controllers";
import auth from "../middlewares/auth.middleware";

const router = Router();

router.route("/").get(auth(), ProductController.getAll).post(auth(), ProductController.create);
router
    .route("/:productId")
    .get(auth(), ProductController.get)
    .patch(auth(), ProductController.patch)
    .delete(auth(), ProductController.remove);

export default router;
