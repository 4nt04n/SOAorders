const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require('mongodb');
const uri = `mongodb+srv://mugiwaras:${process.env.PASSWORD}@test.lyratzj.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.json());

function generateOrderId() {
  return Date.now().toString();
}

// Endpoint para crear una nueva orden
app.post("/orders", async (req, res) => {
  try {
    await client.connect();
    console.log("Conectado exitosamente a la base de datos");

    const ordersCollection = client.db("test").collection("orders");

    const {
      date,
      amount,
      articleCode,
      quantity,
      discountPercentage,
      orderTotal,
      idUser,
      creditCardType,
      coin,
    } = req.body;

    const order = {
      order: generateOrderId(),
      state: "CREATED",
      date: date,
      amount: amount,
      articleCode: articleCode,
      quantity: quantity,
      discountPercentage: discountPercentage,
      orderTotal: orderTotal,
      idUser: idUser,
      creditCardType: creditCardType,
      coin: coin,
    };

    await ordersCollection.insertOne(order);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la orden" });
  } finally {
    await client.close();
  }
});

// Endpoint para obtener una orden por su ID
app.get("/orders/:orderId", async (req, res) => {
  try {
    await client.connect();
    console.log("Conectado exitosamente a la base de datos");

    const ordersCollection = client.db("test").collection("orders");

    const { orderId } = req.params;

    const order = await ordersCollection.findOne({ order: orderId });

    if (!order) {
      res.status(404).json({ error: "Orden no encontrada" });
    } else {
      res.json(order);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener la orden" });
  } finally {
    await client.close();
  }
});

//Authorized ->  APPROVED; Rejected -> NONAPPROVED
app.put("/orders/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { state } = req.body;

  // Conectamos con la base de datos
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    // Obtenemos la referencia a la colección
    const collection = client.db("test").collection("orders");

    // Buscamos la orden por su ID
    const order = await collection.findOne({ order: orderId });

    if (!order) {
      res.status(404).json({ error: "Orden no encontrada" });
      return;
    }

    if (state.toLowerCase() != "authorized" && state.toLowerCase() != "rejected") {
      res.status(400).json({ error: "El estado no es válido." });
      return;
    }

    if (state.toLowerCase() == "authorized") {
      order.state = "APPROVED";
    }

    if (state.toLowerCase() == "rejected") {
      order.state = "NONAPPROVED";
    }

    // Actualizamos la orden en la base de datos
    await collection.updateOne({ order: orderId }, { $set: order });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    // Cerramos la conexión con la base de datos
    client.close();
  }
});

const port = 3000; // Puedes cambiar el puerto si lo deseas

app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});