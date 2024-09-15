import { DbData, ObjectId } from "./common";

export enum TOKEN_TYPE {
    ACCESS = "access",
    REFRESH = "refresh",
}

interface TokenBase {
    token: string;
}

export interface DbToken extends DbData, TokenBase {
    user: ObjectId;
    expires: Date;
    type: TOKEN_TYPE;
}

export interface DbTokenPreSave extends DbToken {
    isModified: (arg0: string) => boolean;
}
