var express = require("express");
var app = express();
var mongoose = require("mongoose");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var RepartidorController = require("./app/controllers/RepartidorController");
var PedidoAdminController = require("./app/controllers/PedidoAdminController");
var Repartidor = require("./app/models/repartidor");
var PedidoAdmin = require("./app/models/pedido-admin");
const ObjectId = require("mongodb").ObjectID;

//const { Server } = require("socket.io");
var databaseConfig = require("./config/database");
var router = require("./routes/routes");

mongoose.connect(databaseConfig.url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const port = 3000;
const server = app.listen(port, () => {
  console.log("Escuchando el puerto: " + port);
});

Repartidor.watch().
  on('change', async data => {
    console.log('NUEVO REPARTIDOR A LA LISTA')
    console.log(new Date(), data)
    if(data.operationType == 'insert') {
    let pedido = await PedidoAdmin.findOne({ estado: "buscando repartidor"}, {}, { sort: { created_at: 1 }}).exec()
    console.log(pedido)
    if(pedido != null) {
    let estado = await Repartidor.aggregate([
    { 
      $match: { _id: ObjectId(data.fullDocument._id) },
    },
    {
      $sort: { fecha_cola: 1 },
    },
    {
      $lookup: {
        from: "rechazados",
        localField: "id",
        foreignField: "repartidor",
        as: "rechazados",
      },
    },

    {
      $match: { "rechazados.pedido": { $ne: ObjectId(pedido._id) } },
    },
  ]).exec();
    console.log(estado)
    await PedidoAdminController.enviarNotiPedido(pedido, estado[0].socket_id)
    }
  }
  });

/*
var stream = Repartidor.find({ "created_at":{"$gte":Date.now()} }, {}, { sort: { fecha_cola: 1 }}).tailable().stream();
  stream.on('data', function (doc) { 
    console.log('Nuevo repartidor en la cola.')
    console.log(doc)
  });



var path = "/stomp";

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: path,
});

global.io = io;

function destroy() {
        try {
            socket.disconnect();
            socket.removeAllListeners();
            socket = null; //this will kill all event listeners working with socket
            //set some other stuffs to NULL
        } catch {}
    }

io.on("connection", async function (socket) {
  console.log("Conexión abierta.", socket.id);
 
socket.on('online',()=>{
    console.log('Aun estoy vivo.');
  })
 socket.emit("conectado", true);
  // Enviar lista de repartidores disponibles al momento que se conectan
  let listarepartidores = await RepartidorController.listadorepartidoresdisponibles();
  socket.emit("mostrar-lista-repartidores", listarepartidores);

  // Enviar lista de pedidos disponibles al momento que se conectan
  let listapedidosenespera = await PedidoAdminController.listapedidosenespera();
  socket.emit("lista-pedidos-por-aceptar-admin", listapedidosenespera);

  // Enviar lista total de pedidos
  let listapedidosadmin = await PedidoAdminController.listapedidosadmin();
  socket.emit("lista-pedidos-admin", listapedidosadmin);

  // Pedidos desde panel de ADMIN
  // Nuevo pedido [ENVIAR]
  socket.on("nuevo-pedido-por-aceptar-admin", function (data) {
    io.emit("nuevo-pedido-por-aceptar-admin", data);
  });

  socket.on("pedido-rechazado-admin", function (data) {
    io.emit("pedido-rechazado-admin", data);
  });

  socket.on("pedido-aceptado-admin", async function (data) {
    console.log(data.data.detalles._id)
    io.emit("pedido-aceptado-admin", data);
    console.log('Buscando repartidor')
    let primeroCola = await RepartidorController.primeroCola(data.data.detalles);
   if(primeroCola != null) {    
console.log("Emitir al primero de la cola de repartidores", primeroCola.socket_id);
    let ejecutaren = (data.data.detalles.tiempo_demora - 5) * 60 * 1000
    console.log('Milisegundos en los que se emitirá:', ejecutaren)
    const enelfuturo = setTimeout(() => {
      io.to(primeroCola.socket_id).emit("nuevo-pedido-para-repartidor", data);
    }, ejecutaren);
}
else {
console.log('No hay repartidores disponibles')
}
   // clearTimeout(enelfuturo);
  });

  // Cuando llega el nuevo pedido al Repartidor, emitir un anuncio de que aceptó o rechazo
  socket.on("repartidor-acepto-pedido", async function (data) {
    console.log("El repartidor aceptó el pedido.");
    io.emit("repartidor-acepto-pedido", data);
  });

  socket.on("repartidor-rechazo-pedido", async function (data) {
    io.emit("repartidor-rechazo-pedido", data);    
console.log("El repartidor rechazo el pedido, a buscar uno nuevo.");
    let primeroCola = await RepartidorController.primeroCola(data.data.detalles._id);
    if(primeroCola != null) {
    console.log("Nuevo repartidor enviando, esperando respuesta.");
    io.to(primeroCola.socket_id).emit("nuevo-pedido-para-repartidor", data);
    }
    else {
      console.log('No hay repartidores disponible para tu pedido.')
    }
  });

  // Repartidores [ENVIAR]
  socket.on("agregar-repartidor-lista", function (data) {
    console.log("Nuevo repartidor a la lista");
    socket.usuarioinfo = data;
    io.emit("agregar-repartidor-lista", data);
  });
  socket.on("quitar-repartidor-lista", function (data) {
    console.log("Se quito un repartidor a la lista");
    io.emit("quitar-repartidor-lista", data);
  });

  socket.on("actualizar-estado-repartidor", function (data) {
    console.log("Se cambio el estado del repartidor");
    io.to(data.socketid).emit("actualizar-estado-repartidor", data.estado);

  });

  // Cuando un usuario cierra la conexión
  socket.on("disconnect", async function (reason) {
    console.log("Conexión cerrada.", socket.id)
   console.log("Por la siguiente razon:",reason);
    // Si usuario desconectado es un repartidor, sacarlo de la lista
    console.log("Se desconecto un repartidor a la lista");
   let res =  await RepartidorController.removerRepartidor(
      socket.id
    );
console.log(res)
    io.emit("quitar-repartidor-lista", socket.usuarioinfo);
 destroy();
  });
});
*/
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger("dev")); // Log requests to API using morgan
app.use(cors({ origin: true, credentials: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});
router(app);
