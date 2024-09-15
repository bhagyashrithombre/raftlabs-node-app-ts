import mongoose from "mongoose";
import { collection } from "../utils/collections";
import { DbProduct } from "../types/product";

const schema = new mongoose.Schema<DbProduct>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: collection.USER,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        qty: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const Product = mongoose.model<DbProduct>(collection.PRODUCT, schema);
