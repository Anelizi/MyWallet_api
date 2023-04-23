import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import dayjs from "dayjs";
import express from "express";
import Joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
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
  type: Joi.string().valid("entrada", "saida"),
  value: Joi.string(),
  description: Joi.string().max(30),
  date: Joi.string(),
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

    await db
      .collection("users")
      .insertOne({ name, email, password: hash, money: 0 });
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

app.get("/sign-up", async (req, res) => {
  try {
    const user = await db.collection("users").find().toArray();
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/transactions", async (req, res) => {
  const time = dayjs().format("DD/MM");
  const { type, value, description, date } = req.body;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) return res.sendStatus(401);

  const validation = transactionsSchemas.validate({type, value, description, date}, {
    abortEarly: false,
  });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  try {
    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.sendStatus(401);

    const userId = session.id;

    console.log(userId);

    const user = await db
      .collection("users")
      .findOne({ _id:new ObjectId(userId) });

    const informatio = {
      type,
      description,
      date: time,
      value: Number(value.replace(",", ".")).toFixed(2),
      userId
    };

    if (informatio.type === "entrada") {
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $set: { money: Number(user?.money || 0) + Number(informatio.value)}}
        );
    } else {
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: { money: (Number(user?.money || 0) - Number(informatio.value)).toFixed(2)}}
        );
    }

    await db.collection("information").insertOne(informatio);

    res.status(201).send(informatio);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
