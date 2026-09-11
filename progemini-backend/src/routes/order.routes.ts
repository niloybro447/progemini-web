import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate";
import * as oc from "@/controllers/order.controller";

const router = Router();

router.post("/orders", authenticate, oc.createOrder);
router.get("/orders", authenticate, oc.listOrders);

export default router;
