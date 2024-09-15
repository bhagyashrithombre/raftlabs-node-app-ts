import { GraphQLObjectType, GraphQLSchema } from "graphql/type";
import { CreateProduct, DeleteProduct, GetAllProducts, GetProductById, UpdateProduct } from "./resolvers/product.resolver";
import { GetUser, Login, Logout, RefreshAuth, Register } from "./resolvers/auth.resolver";

// Define the schema with query and mutation
export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "RootQueryType",
        fields: {
            GetProductById,
            GetAllProducts,
            GetUser,
        },
    }),
    mutation: new GraphQLObjectType({
        name: "RootMutationType",
        fields: {
            CreateProduct,
            UpdateProduct,
            DeleteProduct,
            Register,
            Login,
            Logout,
            RefreshAuth,
        },
    }),
});

export default schema;
