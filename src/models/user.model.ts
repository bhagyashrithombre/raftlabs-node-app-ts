import mongoose from "mongoose";
import { collection } from "../utils/collections";
import bcrypt from "bcrypt";
import { DbUser, DbUserPreSave, DbUserMethods, UserModel } from "../types/user";

const schema = new mongoose.Schema<DbUser, UserModel, DbUserMethods>(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

// Hash password before saving to database
schema.pre<DbUserPreSave>("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(8);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Check if user exists
schema.static(
    "isUserExist",
    async function isUserExist(email: string, username: string, address: string, excludeUserId?: string): Promise<boolean> {
        const user = await this.findOne({
            email,
            username,
            address,
            _id: { $ne: excludeUserId },
        });

        return !!user;
    },
);

// Compare password
schema.method("isPasswordMatch", async function isPasswordMatch(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
});

export const User = mongoose.model<DbUser, UserModel>(collection.USER, schema);
