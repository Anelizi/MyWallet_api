import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";

export async function postTransactions(req, res) {
  const time = dayjs().format("DD/MM");
  const { type, value, description } = req.body;
  try {
    const session = res.locals.session;

    const userId = session.id;

    console.log(userId);

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const informatio = {
      type,
      description,
      date: time,
      value: Number(value.replace(",", ".")).toFixed(2),
      userId,
    };

    if (informatio.type === "entrada") {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            money: Number(user?.money || 0) + Number(informatio.value),
          },
        }
      );
    } else {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            money: (
              Number(user?.money || 0) - Number(informatio.value)
            ).toFixed(2),
          },
        }
      );
    }

    await db.collection("information").insertOne(informatio);

    res.status(201).send(informatio);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function getTransactions(req, res) {
  try {
    const session = res.locals.session;

    const userId = session.id;

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const information = await db
      .collection("information")
      .find({ userId })
      .toArray();

    information.reverse();

    res.send({ information, user });
  } catch (error) {
    res.status(500).send(error.message);
  }
}
