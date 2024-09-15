# Node Developer Intern Test Project

This project is a **Node.js** application built as part of an interview process for the **Node Developer Intern Test**. The goal of this project is to demonstrate proficiency in building a RESTful API with **Node.js**, **Express.js**, **GraphQL**, and **Mongoose**, along with authentication, authorization, and error handling.

The project also integrates **TypeScript** for maintainable and scalable code and **Winston** for logging. Extra credits are given for using **Hasura** for instant GraphQL APIs.

## Features

-   **User Registration & Login**: Secure password storage using **bcrypt**.
-   **CRUD Operations**: Full CRUD functionality for managing data.
-   **Search and Filter**: Ability to search and filter data based on user-defined parameters.
-   **Pagination and Sorting**: Efficient data retrieval with pagination and sorting.
-   **Authentication**: JWT-based authentication and role-based access control.
-   **GraphQL API**: Integration of GraphQL for optimized querying.
-   **Error Handling & Logging**: Centralized error handling and logging using **Winston**.

## Technologies Used

-   **Node.js**: Backend runtime environment.
-   **Express.js**: Web framework for building RESTful APIs.
-   **TypeScript**: Typed superset of JavaScript for scalability.
-   **GraphQL**: Query language to interact with the API.
-   **Hasura**: Instant GraphQL APIs on PostgreSQL.
-   **Mongoose**: ODM for MongoDB to interact with the database.
-   **JWT**: For authentication and authorization.
-   **Winston**: For logging errors and requests.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/bhagyashrithombre/raftlabs-node-app-ts.git
    cd raftlabs-node-app-ts
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables. Create a `.env` file in the root directory and add the following:

    ```bash
    NODE_ENV=test
    PORT=4000
    MONGO_URI=mongodb://localhost:27017/mydb
    JWT_SECRET=your_jwt_secret
    ```

4. Start the application:

    - For development:

        ```bash
        npm run dev
        ```

    - For production:

        ```bash
        npm run start
        ```

## Scripts

-   `npm run build`: Build the project using **swc** (compiles TypeScript).
-   `npm run start`: Build and start the application.
-   `npm run dev`: Run the application in development mode with **nodemon**.
-   `npm run eslint`: Run **ESLint** to check code quality.
-   `npm run eslint:fix`: Fix ESLint errors.
-   `npm run prettier`: Run **Prettier** to format code.

## API Endpoints

### RESTful API

-   **POST** `/api/register`: Register a new user.
-   **POST** `/api/login`: Log in a user and return a JWT token.
-   **POST** `/api/logout`: Logout user.
-   **POST** `/api/refresh-auth`: Take fresh access and refresh tokens.
-   **GET** `/api/products`: Get all products (supports pagination and filtering).
-   **GET** `/api/products/:id`: Get a product by ID.
-   **POST** `/api/products`: Create a new product.
-   **PUT** `/api/products/:id`: Update a product.
-   **DELETE** `/api/products/:id`: Delete a product.

### GraphQL API

You can access the GraphQL API at `/graphql`. Example queries:

-   **Fetch all products**:

    ```graphql
    query {
        getAllProducts {
            _id
            name
            price
            qty
        }
    }
    ```

-   **Create a new product**:

    ```graphql
    mutation {
        createProduct(name: "Product Name", price: 100, qty: 5) {
            _id
            name
            price
        }
    }
    ```

## Database

-   The project uses **MongoDB** as the database. You can either run a local instance of MongoDB or use a cloud-based solution like **MongoDB Atlas**.

## Logging

-   The project uses **Winston** for logging errors and HTTP requests. All logs are stored in the console by default.

## Linting and Formatting

-   **ESLint** and **Prettier** are configured for maintaining code quality and formatting.

## Future Enhancements

-   **Testing**: Add unit and integration tests.
-   **Performance**: Optimize queries and database interactions.
-   **Security**: Implement rate limiting, request validation, and other security enhancements.
