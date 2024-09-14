import { DbData, ObjectId } from "./common";

export interface DbProduct extends DbData {
    name: string;
    price: number;
    qty: number;
    rating: number;
    userId: ObjectId;
}
