import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLResolveInfo, GraphQLString } from "graphql";
import { DbProduct, IGetAllProductsArgs, productType } from "../../types/product";
import { Product, User } from "../../models";
import { getProjection, verifyAuth } from "../../utils/fn";
import { PipelineStage, Types } from "mongoose";
import { AuthContext } from "../../types/common";
import { AppError } from "../../middlewares/errorhandler.middleware";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "http-status";
import logger from "../../config/logger";

// Get product by ID
export const GetProductById = {
    type: new GraphQLList(productType),
    args: {
        _id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_root: unknown, args: { [argName: string]: any }, context: unknown) => {
        const user = await verifyAuth(context as AuthContext);
        const { _id } = args as { _id: string };

        const pipeline: PipelineStage[] = [
            // Match the product ID and user ID
            { $match: { _id: new Types.ObjectId(_id), userId: user._id } },
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
            { $project: { user: 1, name: 1, price: 1, qty: 1 } },
        ];

        try {
            const product = await Product.aggregate(pipeline);
            return product;
        } catch (error) {
            logger.error(`Error fetching product with ID: ${_id}`, error);
            throw new AppError(INTERNAL_SERVER_ERROR, `Error fetching product with ID: ${_id}`);
        }
    },
};

// Get all products
export const GetAllProducts = {
    type: new GraphQLObjectType({
        name: "GetAllProductsResponse",
        fields: {
            data: { type: new GraphQLList(productType) },
            total: { type: GraphQLInt },
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
        },
    }),
    // Add pagination, sorting and filtering
    args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 },
        productName: { type: GraphQLString },
        userIds: { type: new GraphQLList(GraphQLString) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        sort_name: { type: GraphQLString },
        sort_price: { type: GraphQLString },
        sort_qty: { type: GraphQLString },
        sort_rating: { type: GraphQLString },
    },
    resolve: async (_root: unknown, args: { [argName: string]: any }, context: unknown) => {
        await verifyAuth(context as AuthContext);

        const { page, limit, name, sort_name, sort_price, sort_qty } = args as IGetAllProductsArgs;
        const skip = (page - 1) * limit;
        let sorting: Record<string, 1 | -1> = {};

        const filter: any = {};

        if (name) {
            filter.name = { $regex: new RegExp(name, "i") };
        }
        if (args.userIds) {
            filter.userId = { $in: args.userIds.map((id: string) => new Types.ObjectId(id)) };
        }

        const sortObject: Record<string, 1 | -1> = { createdAt: -1 };
        if (sort_name) sortObject.name = sort_name === "asc" ? 1 : -1;
        if (sort_price) sortObject.price = sort_price === "asc" ? 1 : -1;
        if (sort_qty) sortObject.qty = sort_qty === "asc" ? 1 : -1;
        if (Object.keys(sortObject).length > 0) sorting = sortObject;

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
                            $match: {
                                firstName: { $regex: new RegExp(args.firstName, "i") },
                                lastName: { $regex: new RegExp(args.lastName, "i") },
                            },
                        },
                        { $project: { password: 0, createdAt: 0, updatedAt: 0 } },
                    ],
                },
            },
            { $unwind: "$user" },
            { $project: { user: 1, name: 1, price: 1, qty: 1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
                    data: [{ $skip: skip }, { $limit: limit }, { $sort: sorting }],
                },
            },
        ];

        try {
            const products = await Product.aggregate(pipeline);
            const result = products[0] || { data: [], metadata: { total: 0, page, limit } };

            return {
                data: result.data,
                total: result.metadata.length > 0 ? result.metadata[0].total : 0,
                page: result.metadata.length > 0 ? result.metadata[0].page : page,
                limit: result.metadata.length > 0 ? result.metadata[0].limit : limit,
            };
        } catch (error) {
            logger.error("Error fetching products:", error);
            throw new AppError(INTERNAL_SERVER_ERROR, "Error fetching products");
        }
    },
};

// Crete a new product
export const CreateProduct = {
    type: productType,
    args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        price: { type: new GraphQLNonNull(GraphQLInt) },
        qty: { type: new GraphQLNonNull(GraphQLInt) },
    },
    resolve: async (_root: unknown, args: { [argName: string]: any }, context: unknown) => {
        const user = await verifyAuth(context as AuthContext);
        const { name, price, qty } = args as Pick<DbProduct, "name" | "qty" | "price">;

        try {
            const product = new Product({ name, price, qty, userId: user._id });
            const newProduct = await product.save();
            const response = {
                user: user,
                _id: newProduct._id,
                name: newProduct.name,
                price: newProduct.price,
                qty: newProduct.qty,
            };
            return response;
        } catch (error) {
            logger.error("Error creating product:", error);
            throw new AppError(INTERNAL_SERVER_ERROR, "Error creating product");
        }
    },
};

// Update a product
export const UpdateProduct = {
    type: productType,
    args: {
        _id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        price: { type: GraphQLInt },
        qty: { type: GraphQLInt },
    },
    resolve: async (_root: unknown, args: { [argName: string]: any }, context: unknown, info: GraphQLResolveInfo) => {
        await verifyAuth(context as AuthContext);
        const { _id, ...update } = args as Partial<DbProduct>;
        const projections = getProjection(info);

        try {
            const updatedProduct = await Product.findOneAndUpdate({ _id }, update, {
                new: true,
                fields: projections,
                populate: { path: "userId", select: "firstName lastName email" },
            });

            if (!updatedProduct) {
                throw new AppError(NOT_FOUND, `Product with ID: ${_id} not found`);
            }

            const response = {
                user: updatedProduct.userId,
                name: updatedProduct.name,
                price: updatedProduct.price,
                qty: updatedProduct.qty,
            };

            return response;
        } catch (error: any) {
            logger.error("Error updating product:", error);
            throw new AppError(error.statusCode, error.message);
        }
    },
};

// Delete a product
export const DeleteProduct = {
    type: productType,
    args: {
        _id: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_root: unknown, args: { [argName: string]: any }, context: unknown) => {
        const user = await verifyAuth(context as AuthContext);
        const { _id } = args as { _id: string };

        try {
            const product = await Product.findOneAndDelete({ _id, userId: user._id }).populate(
                "userId",
                "firstName lastName email",
            );
            if (!product) {
                throw new AppError(NOT_FOUND, `Product with ID: ${_id} not found`);
            }

            const response = {
                user: product.userId,
                name: product.name,
                price: product.price,
                qty: product.qty,
            };

            return response;
        } catch (error: any) {
            logger.error("Error deleting product:", error);
            throw new AppError(error.statusCode, error.message);
        }
    },
};
