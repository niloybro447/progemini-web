import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as userService from "@/services/user.service";
import { StatusCodes } from "http-status-codes";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!.id);
  res.status(StatusCodes.OK).json(user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  res.status(StatusCodes.OK).json(user);
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const role = req.query.role as string | undefined;
  const users = await userService.listUsers(role);
  res.status(StatusCodes.OK).json(users);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  res.status(StatusCodes.OK).json(user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(StatusCodes.CREATED).json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(StatusCodes.OK).json(user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req.params.id);
  res.status(StatusCodes.OK).json(result);
});
