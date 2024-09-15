import { UNAUTHORIZED } from "http-status";
import { User } from "../models";
import jwt from "jsonwebtoken";
import { AppError } from "../middlewares/errorhandler.middleware";
import env from "../config/env";
import { GraphQLResolveInfo, SelectionNode } from "graphql";
import { AuthContext } from "../types/common";

export function getProjection(fieldASTs: GraphQLResolveInfo) {
    const selections = fieldASTs.fieldNodes[0].selectionSet?.selections || [];

    return selections.reduce((projections: Record<string, boolean>, selection: SelectionNode) => {
        if (selection.kind === "Field") {
            projections[selection.name.value] = true;
        }
        return projections;
    }, {});
}

export async function verifyAuth(context: AuthContext) {
    const authorization = context.headers.authorization || "";
    if (!authorization) {
        throw new Error("Please provide a token");
    }
    const token = authorization.replace("Bearer ", "");
    const payload = await jwt.verify(token, env.jwt.secret);
    const user = await User.findById(payload.sub);
    if (!user) {
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    }

    return user;
}
