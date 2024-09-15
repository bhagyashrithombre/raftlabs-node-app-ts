import { GraphQLInt, GraphQLObjectType, GraphQLString, GraphQLID } from "graphql";
import { DbData, ObjectId } from "./common";

export interface DbProduct extends DbData {
    name: string;
    price: number;
    qty: number;
    userId: ObjectId;
}

export interface IGetAllProductsArgs {
    page: number;
    limit: number;
    productName?: string;
    sort_name?: string;
    sort_price?: string;
    sort_qty?: string;
}

export const productType = new GraphQLObjectType({
    name: "Product",
    description: "Product item details",
    fields: () => ({
        user: {
            type: new GraphQLObjectType({
                name: "UserDetails",
                fields: {
                    _id: { type: GraphQLID, description: "The ID of the user." },
                    firstName: { type: GraphQLString, description: "The first name of the user." },
                    lastName: { type: GraphQLString, description: "The last name of the user." },
                    email: { type: GraphQLString, description: "The email of the user." },
                },
            }),
            description: "The ID of the user.",
        },
        _id: { type: GraphQLID, description: "The ID of the product." },
        name: { type: GraphQLString, description: "The name of the product." },
        price: { type: GraphQLInt, description: "The price of the product." },
        qty: { type: GraphQLInt, description: "The quantity available." },
    }),
});
