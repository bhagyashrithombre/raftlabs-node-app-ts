import mongoose from "mongoose";
import { Request } from "express";
import { DbUser } from "./user";
import { TOKEN_TYPE } from "./token";

export type ObjectId = mongoose.Schema.Types.ObjectId;

export interface DbData {
    _id: ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface GetListResult<T> {
    records: T[];
    count: number;
}

export interface AuthenticatedRequest extends Request {
    user: DbUser;
}

export interface IToken {
    sub: Partial<DbUser>;
    iat: number;
    exp: number;
    type: TOKEN_TYPE;
}

export interface AuthContext {
    headers: {
        authorization?: string;
    };
}
