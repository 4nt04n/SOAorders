const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const orderStates = {
  CREATED: "CREATED",
  APPROVED: "APPROVED",
  NONAPPROVED: "NONAPPROVED",
};

const orders = [];

function generateOrderId() {
  return Date.now().toString();
}
// Ruta para crear una nueva orden
app.post("/orders", (req, res) => {
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

  // Genera un nuevo ID para la orden
  const orderId = generateOrderId();

  // Crea el objeto de la orden
  const order = {
    //order es la primary key
    order: orderId,
    state: orderStates.CREATED,
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

  // Agrega la orden al arreglo
  orders.push(order);

  res.json(order);
});

// Ruta para obtener una orden por su ID
app.get("/orders/:orderId", (req, res) => {
  const { orderId } = req.params;

  // Busca la orden por su ID
  const order = orders.find((o) => o.order === orderId);

  if (!order) {
    res.status(404).json({ error: "Orden no encontrada" });
  } else {
    res.json(order);
  }
});

//Authorized ->  APPROVED; Rejected -> NONAPPROVED
app.put("/orders/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { state } = req.body;

  // Busca la orden por su ID
  const index = orders.findIndex((o) => o.id === orderId);
  const order = orders[index];
  orders[index] = orders[orders.length - 1];
  orders.pop();

  if (!order) {
    res.status(404).json({ error: "Orden no encontrada" });
  } else {

    if(state.toLowerCase() != "authorized" &&  state.toLowerCase() != "rejected"){
      res.status(400).json({ error: "El estado no es valido." });
      return
    }
    if (state.toLowerCase() == "authorized") {
      order.state = orderStates.APPROVED;
    }
    if (state.toLowerCase() == "rejected") {
      order.state = orderStates.NONAPPROVED;
    } 
    orders.push(order);
    res.json(order);
  }
});

const port = 3000; // Puedes cambiar el puerto si lo deseas

app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});