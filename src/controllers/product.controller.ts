import { Request, Response } from "express";
import { Product, User } from "../models";
import responseHandler from "../utils/responseHandler";
import { OK } from "http-status";
import { PipelineStage, Types } from "mongoose";
import { AuthenticatedRequest } from "../types/common";
import asyncHandler from "../middlewares/asyncHandler.middleware";

// POST /
const create = asyncHandler(async (req: Request, res: Response) => {
    const payload = {
        ...req.body,
        userId: (req as AuthenticatedRequest).user._id,
    };
    const product = await Product.create(payload);
    const response = {
        status: OK,
        success: true,
        message: "PRODUCT: Product created",
        data: product,
    };

    return responseHandler(response, res);
});

// GET /
const getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    let sorting = {};

    const filter = { userId: (req as AuthenticatedRequest).user._id };

    if (req.query.name) {
        Object.assign(filter, {
            name: { $regex: new RegExp(`${req.query.name}`, "i") },
        });
    }

    const sortObject = { createdAt: -1 };
    if (req.query.sort_name) {
        Object.assign(sortObject, { name: req.query.sort_name === "asc" ? 1 : -1 });
    }
    if (req.query.sort_price) {
        Object.assign(sortObject, { price: req.query.sort_price === "asc" ? 1 : -1 });
    }
    if (req.query.sort_qty) {
        Object.assign(sortObject, { qty: req.query.sort_qty === "asc" ? 1 : -1 });
    }
    if (req.query.sort_rating) {
        Object.assign(sortObject, { rating: req.query.sort_rating === "asc" ? 1 : -1 });
    }
    if (Object.keys(sortObject).length > 0) {
        sorting = sortObject;
    }

    const pipeline: PipelineStage[] = [
        { $match: filter },
        {
            $lookup: {
                from: User.collection.name,
                localField: "userId",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: { password: 0, createdAt: 0, updatedAt: 0 },
                    },
                ],
            },
        },
        { $unwind: "$user" },
        { $project: { user: 1, name: 1, price: 1, qty: 1, rating: 1 } },
        {
            $facet: {
                metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
                data: [{ $skip: skip }, { $limit: limit }, { $sort: sorting }],
            },
        },
    ];

    const products = await Product.aggregate(pipeline);

    const response = {
        status: OK,
        success: true,
        message: "PRODUCT: Products found",
        data: products[0],
    };

    return responseHandler(response, res);
});

// GET /:productId
const get = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;

    const product = await Product.aggregate([
        { $match: { _id: new Types.ObjectId(productId) } },
        {
            $lookup: {
                from: User.collection.name,
                localField: "userId",
                foreignField: "_id",
                as: "user",
                pipeline: [{ $project: { password: 0, createdAt: 0, updatedAt: 0 } }],
            },
        },
        { $unwind: "$user" },
        { $project: { user: 1, name: 1, price: 1, qty: 1, rating: 1 } },
    ]);
    if (!product) {
        const response = {
            status: OK,
            success: true,
            message: "PRODUCT: Product not found",
            data: {},
        };

        return responseHandler(response, res);
    }

    const response = {
        status: OK,
        success: true,
        message: "PRODUCT: Product found",
        data: product,
    };
    return responseHandler(response, res);
});

// PUT /:productId
const patch = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;

    const product = await Product.findOneAndUpdate(
        { _id: productId, userId: (req as AuthenticatedRequest).user._id },
        req.body,
        { new: true },
    );

    if (!product) {
        const response = {
            status: OK,
            success: true,
            message: "PRODUCT: Product not found",
            data: {},
        };
        return responseHandler(response, res);
    }

    const response = {
        status: OK,
        success: true,
        message: "PRODUCT: Product updated",
        data: product,
    };
    return responseHandler(response, res);
});

// DELETE /:productId
const remove = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
        const response = {
            status: OK,
            success: true,
            message: "PRODUCT: Product not found",
            data: {},
        };
        return responseHandler(response, res);
    }

    const response = {
        status: OK,
        success: true,
        message: "PRODUCT: Product deleted",
        data: product,
    };
    return responseHandler(response, res);
});

export { create, get, getAll, patch, remove };
