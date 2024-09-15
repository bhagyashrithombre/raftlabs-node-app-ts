import { Model } from "mongoose";
import { DbData } from "./common";
import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";

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
    isUserExist(email: string, excludeUserId?: string): Promise<boolean>;
}

export interface RefreshAuthArgs {
    refreshToken: string;
}

export interface LogoutArgs {
    refreshToken: string;
}

export const userType = new GraphQLObjectType({
    name: "User",
    description: "User details",
    fields: () => ({
        _id: { type: GraphQLID, description: "The ID of the user." },
        firstName: { type: GraphQLString, description: "The first name of the user." },
        lastName: { type: GraphQLString, description: "The last name of the user." },
        email: { type: GraphQLString, description: "The email of the user." },
        tokens: {
            type: new GraphQLObjectType({
                name: "Tokens",
                fields: {
                    access: {
                        type: new GraphQLObjectType({
                            name: "AccessToken",
                            fields: { token: { type: GraphQLString }, expires: { type: GraphQLString } },
                        }),
                    },
                    refresh: {
                        type: new GraphQLObjectType({
                            name: "RefreshToken",
                            fields: { token: { type: GraphQLString }, expires: { type: GraphQLString } },
                        }),
                    },
                },
            }),
        },
    }),
});

export const getUserType = new GraphQLObjectType({
    name: "GetUser",
    description: "Get user details",
    fields: () => ({
        _id: { type: GraphQLID, description: "The ID of the user." },
        firstName: { type: GraphQLString, description: "The first name of the user." },
        lastName: { type: GraphQLString, description: "The last name of the user." },
        email: { type: GraphQLString, description: "The email of the user." },
    }),
});
