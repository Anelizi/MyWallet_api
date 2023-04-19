import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import Joi from "joi";
import { MongoClient } from "mongodb";
import { v4  as uuid } from "uuid";

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

// const mongoClient = new MongoClient(process.env.);

// try {
//     await mongoClient.connect();
//     console.log("MongoDB conectado");
// } catch (error) {
//     console.log(err.message);
// }
// const db = mongoClient.db();

app.post("cadastro", async (req, res) =>{

})

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
