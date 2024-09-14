import { Router } from "express";
import productRoutes from "./product.router";
import authRoutes from "./auth.router";

const router = Router();

const defaultRoutes = [
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/product",
        route: productRoutes,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
