import { Model } from "mongoose";
import { DbData } from "./common";

export interface DbUser extends DbData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface DbUserPreSave extends DbUser {
    isModified: (arg0: string) => boolean;
}

export interface DbUserMethods {
    isPasswordMatch(candidatePassword: string): string;
}

export interface UserModel extends Model<DbUser, object, DbUserMethods> {
    isUserExist(email: string, username: string, address: string, excludeUserId?: string): Promise<boolean>;
}
