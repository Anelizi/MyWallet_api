import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import Joi, { object } from "joi";
import { MongoClient } from "mongodb";
import { v4 as uuid } from "uuid";

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
  await mongoClient.connect();
  console.log("MongoDB conectado");
} catch (error) {
  console.log(error.message);
}
const db = mongoClient.db();

const userSchemas = Joi.object({
  name: Joi.string().required().min(3),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(3),
});

const transactionsSchemas = Joi.object({
  type: Joi.string().valid("green", "red"),
  value: Joi.string(),
  description: Joi.string().max(20),
  date: Joi.string().min(5).max(5).required(),
});

app.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;

  const validation = userSchemas.validate(res.body, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  try {
    const user = await db.collection("users").findOne({ email });
    if (user) return res.sendStatus(409);

    const hash = bcrypt.hashSync(password, 10);

    await db.collection("users").insertOne({ name, email, password: hash });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.collection("users").findOne({ email });

    if (!user) return res.status(404).send("E-mail não está cadastrado");

    if (!email || !password) return res.sendStatus(422);

    const passwordCorrect = bcrypt.compareSync(password, user.password);
    if (!passwordCorrect) return res.status(401).send("Senha incorreta.");

    const token = uuid();
    await db.collection("sessions").insertOne({ token, idUser: user._id });

    res.send(token);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/transactions", async (req, res) => {
  const { type, value, description, date } = req.body;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  const validation = userSchemas.validate(res.body, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  try {
    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.sendStatus(401);

    const information = {
      type,
      description,
      date,
      value: Number(value.replace(",", ".")).toFixed(2),
    };

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
