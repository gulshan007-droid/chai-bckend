// const {createClent} from "redis";

// const connectredis=aeync()=>{
//     const client=createClent({url:"redis://localhost:6379"})
//     client.error(err=>{
//         console.log(err)
//     })

//     await client.connect();

// }

// import { MongoClient } from "mongodb";

// const mongocoonetion = async () => {
//   try {
//     const client =await MongoClient.connect(`${process.env.Mongo_uri}`);
//     const db= client.db(DB_NAME);
//     console.log(db)
//   } catch (err) {
//     console.log(err);
//   }
// };

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connection = async () => {
  try {
    const db = await mongoose.connect(`${process.env.Mongo_uri}/${DB_NAME}`);

    console.log(db.connection.host);
  } catch (err) {
    console.error("Databse not connected", err);
    throw new Error("Dtabase not connetced");
  }
};
