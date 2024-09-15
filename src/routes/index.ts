import { Router } from "express";
import productRoutes from "./product.router";
import authRoutes from "./auth.router";

const router = Router();

const routes = [
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/product",
        route: productRoutes,
    },
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
