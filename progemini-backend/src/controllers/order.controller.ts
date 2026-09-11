import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as orderService from "@/services/order.service";
import { StatusCodes } from "http-status-codes";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.createOrder(req.user!.id, req.body);
  res.status(StatusCodes.OK).json(result);
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.listOrders(req.user!.id);
  res.status(StatusCodes.OK).json(orders);
});

export const handleStripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const result = await orderService.handleStripeWebhook(req.body, sig);
  res.status(StatusCodes.OK).json(result);
});
