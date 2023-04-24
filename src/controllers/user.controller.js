import { db } from "../database/database.connection.js"; 
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

export async function postUp(req, res) {
  const { name, email, password } = req.body;

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
}

export async function postIn(req, res) {
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
}

export async function getUp(req, res) {
  try {
    const user = await db.collection("users").find().toArray();
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
