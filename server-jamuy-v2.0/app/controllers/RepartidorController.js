var Repartidor = require("../models/repartidor");
var PedidoAdmin = require("../models/pedido-admin");
var Rechazado = require("../models/rechazado");
var User = require("../models/user");

var RepartidorController = require("../controllers/RepartidorController");
var PedidoAdminController = require("../controllers/PedidoAdminController");
const ObjectId = require("mongodb").ObjectID;

var defaultMessaging = require("../../firebase-config");

// Cambiar estado
exports.cambiarestado = async function (req, res, next) {
  let estado = req.body.estado;
  let usuario = req.user;
  let socketid = req.body.socketid;

  if (estado == null) {
    return res.status(422).send({ error: "Debes ingresar un estado" });
  }

  if (socketid == null) {
    return res.status(422).send({ error: "Debes ingresar un socket id" });
  }

  let usuariosadmins = await User.find({
    rol: "admin",
    token: { $ne: "" },
  }).select("token");

  var tokens = [];
  for (var i in usuariosadmins) {
    if (usuariosadmins[i].token != "") {
      tokens.push(usuariosadmins[i].token);
    }
  }

  if (estado == 5) {
    let escinco = await Repartidor.findOneAndUpdate(
      { socket_id: socketid },
      { $set: { estado: 5 } },
      { new: true }
    )
      .populate("id")
      .exec();

    res.status(201).json({
      status: true,
      description: "Estado actualizado",
      detalles: escinco,
    });
  }

  if (estado === true) {
    let info = {
      id: usuario._id,
      socket_id: socketid,
      estado: 1,
    };

    let card = await Repartidor.findOneAndUpdate(
      { socket_id: socketid },
      { $set: info },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        sort: { fecha_cola: 1 },
      }
    )
      .populate("id")
      .exec();

    const message = {
      data: {
        titulo: "Un nuevo repartidor se ha unido",
        contenido: "1 repartidor nuevo a la lista.",
        valor: "1",
        detalles: JSON.stringify(card),
      },
      webpush: {
        fcmOptions: {
          link: process.env.PWA_APP_URL,
        },
        headers: {
          Urgency: "high",
        },
      },
      tokens: tokens,
    };

    defaultMessaging.defaultMessaging
      .sendMulticast(message)
      .then((response) => {
        console.log("Notificación enviada a todos olos admins", response);
      })
      .catch((error) => {
        console.log(error);
      });

    // Enviar reespuesta
    res.status(201).json({
      status: true,
      description: "Estado actualizado",
      detalles: card,
    });
  } else if (estado == false) {
    // Eliminar repartidor de la lista de repartidores disponibles
    Repartidor.find({ socket_id: socketid }).remove(function (err, rep) {
      if (err) {
        return next(err);
      }

      const message = {
        data: {
          titulo: "Un repartidor se ha desconectado",
          contenido: "1 repartidor salio de la lista",
          valor: "-1",
          detalles: JSON.stringify(usuario),
        },
        webpush: {
          fcmOptions: {
            link: process.env.PWA_APP_URL,
          },
          headers: {
            Urgency: "high",
          },
        },
        tokens: tokens,
      };

      defaultMessaging.defaultMessaging
        .sendMulticast(message)
        .then((response) => {
          console.log("Notificación enviada a todos los admins", response);
        })
        .catch((error) => {
          console.log(error);
        });

      res.status(201).json({
        status: true,
        description: "Estado actualizado.",
        detalles: usuario,
      });
    });
  }
};

exports.listadorepartidoresdisponibles = async function () {
  const respuesta = Repartidor.find().populate("id").exec();
  return respuesta;
};

exports.removerRepartidor = async function (repartidor) {
  return await Repartidor.find({ socket_id: repartidor }).remove().exec();
};

exports.primeroCola = async function (pedido) {
  p = new Array(pedido);

  // El primero de la cola...
  let estado = await Repartidor.aggregate([
    {
      $match: { estado: { $ne: 0 } },
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
      $match: { "rechazados.pedido": { $ne: ObjectId(pedido) } },
    },
  ]).exec();

  let first = estado[0];
  console.log(first)
  if (first != undefined) {
    if (first.estado == 5) {
      return await Repartidor.findOne(
        { _id: ObjectId(first._id) },
        {},
        { new: true, sort: { fecha_cola: 1 } }
      )
        .populate("id")
        .exec();
    } else {
      return await Repartidor.findOneAndUpdate(
        { _id: ObjectId(first._id) },
        { $set: { estado: 0 } },
        { new: true, sort: { fecha_cola: 1 } }
      )
        .populate("id")
        .exec();
    }
  } else {
    console.log(
      "No hay repartidores disponibles, esperando la entrada de uno nuevo..."
    );
    return await PedidoAdminController.BuscarNuevoRepartidor(pedido)
    //return null;
  }
};

exports.tomarPedido = async function (req, res, next) {
  id = req.body.id;
  let usuario = req.user;

  if (id == null) {
    res.send("Necesitas ingresar el ID del pedido.");
  }

  let colita = {
    id: id,
    tiempo: 30,
  };

  let estado = await Repartidor.aggregate([
    {
      $sort: { fecha_cola: 1 },
    },
    {
      $lookup: {
        from: "usuarios",
        localField: "id",
        foreignField: "_id",
        as: "user",
      },
      
    },
    {
      $match: { "user._id": ObjectId(usuario._id) },
    },
  ]).exec();

  // Mandar al fondo de la cola al Repartidor con nuevo pedido.
  let repartidor = await Repartidor.findOneAndUpdate(
    { _id: ObjectId(estado[0]._id) },
    { $set: { estado: 1, fecha_cola: new Date() }, $push: { cola: colita } },
    { new: true, sort: { fecha_cola: 1 } }
  )
    .populate("id")
    .exec();

  let usuariosadmins = await User.find({
    rol: "admin",
    token: { $ne: "" },
  }).select("token");

  var tokens = [];
  for (var i in usuariosadmins) {
    if (usuariosadmins[i].token != "") {
      tokens.push(usuariosadmins[i].token);
    }
  }

  if (estado[0].estado == 5) {
    await Repartidor.find(
      { _id: ObjectId(repartidor._id) },
      {},
      { new: true, sort: { fecha_cola: 1 } }
    )
      .remove()
      .exec();

    const message = {
      data: {
        titulo: "Un nuevo repartidor se ha unido",
        contenido: "1 repartidor nuevo a la lista.",
        valor: "-1",
        detalles: JSON.stringify(usuario),
      },
      tokens: tokens,
    };

    defaultMessaging.defaultMessaging
      .sendMulticast(message)
      .then((response) => {
        console.log("Notificación enviada a todos los admins", response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Asignamos repartidor al pedido
  let pedidoadmin = await PedidoAdmin.findOneAndUpdate(
    { _id: ObjectId(id) },
    { $set: { repartidor: repartidor.id._id } },
    { new: true }
  )
    .populate("repartidor")
    .exec();

  const message = {
    data: {
      titulo: "Repartidor acepto pedido",
      contenido: "Será adjuntado.",
      valor: "4",
      detalles: JSON.stringify(pedidoadmin),
    },
    tokens: tokens,
  };

  defaultMessaging.defaultMessaging
    .sendMulticast(message)
    .then((response) => {
      console.log("Notificación enviada a todos olos admins", response);
    })
    .catch((error) => {
      console.log(error);
    });


  res.status(201).json({
    status: true,
    description: "Pedido actualizado",
    detalles: pedidoadmin,
  });
};

exports.descartarPedido = async function (req, res, next) {
  id = req.body.id;
  usuario = req.user

  if (id == null) {
    res.send("Necesitas ingresar el ID del pedido.");
  }

  let estado = await Repartidor.aggregate([
    {
      $sort: { fecha_cola: 1 },
    },
    {
      $lookup: {
        from: "usuarios",
        localField: "id",
        foreignField: "_id",
        as: "user",
      },
      
    },
    {
      $match: { "user._id": ObjectId(usuario._id) },
    },
  ]).exec();


  let rechazado = await Rechazado.create({
    pedido: ObjectId(id),
    repartidor: ObjectId(estado[0].id._id),
  });

  let pedidoadmin = await PedidoAdmin.findOneAndUpdate(
    { _id: ObjectId(id) },
    { $set: { estado: "buscando repartidor" } },
    { new: true }
  )
    .populate("repartidor")
    .exec();

  if (estado[0].estado == 5) {
    await Repartidor.find({ _id: ObjectId(estado[0]._id) }, {}, { new: true, sort: { fecha_cola: 1 } })
      .remove()
      .exec();
  } else {
    let r = await Repartidor.findOneAndUpdate(
      { _id: ObjectId(estado[0]._id) },
      { $set: { estado: 1 } },
      { new: true, sort: { fecha_cola: 1 } }
    )
      .populate("id")
      .exec();

    await Rechazado.find({ repartidor: ObjectId(estado[0].id._id) }).exec(
      async function (err, results) {
        var count = results.length;
        if (count === 3) {
          // Mandar al fondo de la cola al Repartidor con nuevo pedido.
          let repartidordos = await Repartidor.findOneAndUpdate(
            { _id: ObjectId(estado[0]._id) },
            { $set: { estado: 1, fecha_cola: new Date() } },
            { new: true, sort: { fecha_cola: 1 } }
          )
            .populate("id")
            .exec();

          //await Rechazado.find({ repartidor: repartidor._id }).remove().exec();
        }
      }
    );
  }
  // Emitimos a lo s admins que rechazoo....

  let usuariosadmins = await User.find({
    rol: "admin",
    token: { $ne: "" },
  }).select("token");

  var tokens = [];
  for (var i in usuariosadmins) {
    if (usuariosadmins[i].token != "") {
      tokens.push(usuariosadmins[i].token);
    }
  }

  const message = {
    data: {
      titulo: "Repartidor rechazo pedido",
      contenido: "Se buscará uno nuevo.",
      valor: "0",
      detalles: JSON.stringify(pedidoadmin),
    },
    tokens: tokens,
  };

  defaultMessaging.defaultMessaging
    .sendMulticast(message)
    .then((response) => {
      console.log("Notificación enviada a todos olos admins", response);
    })
    .catch((error) => {
      console.log(error);
    });

  // Buscamos otro repartidor
  console.log("Buscando otro repartidor...");
  let primeroCola = await RepartidorController.primeroCola(id.toString());

  if (primeroCola != null) {
    console.log(
      "Emitir al primero de la cola de repartidores",
      primeroCola.socket_id
    );
    await PedidoAdminController.enviarNotiPedido(
      pedidoadmin,
      primeroCola.socket_id
    );
  }

  res.status(201).json({
    status: true,
    description: "Pedido actualizado",
    detalles: pedidoadmin,
  });
};

exports.RegistrarToken = async function (req, res, next) {
  let usuario = req.user;
  let token = req.body.token;

  // Actualizar token a usuario admin
  let userToken = await User.findOneAndUpdate(
    { _id: usuario._id, rol: "admin" },
    { $set: { token: token } },
    { new: true }
  ).exec();

  /*
  const respuesta = await defaultMessaging.defaultMessaging
    .subscribeToTopic(tokens, "repartidores")
    .then((response) => {
      console.log("Suscrito token:", response);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
  */
  res.status(201).json({
    status: true,
    description: "Token registrado.",
    detalles: userToken,
  });
};

exports.cambiarestadoAdmin = async function (req, res, next) {
  let estado = req.body.estado;
  let socketid = req.body.socketid;

  if (estado == null) {
    return res.status(422).send({ error: "Debes ingresar un estado" });
  }

  if (socketid == null) {
    return res.status(422).send({ error: "Debes ingresar un socket id" });
  }

  if (estado === true) {
    let info = {
      estado: 1,
    };

    await Repartidor.findOneAndUpdate(
      { socket_id: socketid },
      { $set: info },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        sort: { fecha_cola: 1 },
      }
    )
      .populate("id")
      .exec(function (err, card) {
        if (err) {
          return next(err);
        } else {
          res.status(201).json({
            status: true,
            description: "Estado actualizado",
            detalles: card,
          });
        }
      });
  } else {
    // Eliminar repartidor de la lista de repartidores disponibles
    Repartidor.find({ socket_id: socketid }).remove(async function (err, rep) {
      if (err) {
        return next(err);
      }

      // Emitir al repartidor que esta fueera
      const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24,
      };

      const message_notification = {
        data: {
          titulo: "El administrador te ha desconectado",
          contenido: "Ya no estas conectado.",
          vida: "30000",
          detalles: "IR",
        },
      };

      defaultMessaging.defaultMessaging
        .sendToDevice(socketid, message_notification, options)
        .then((response) => {
          console.log("Notificación enviada", response);
        })
        .catch((error) => {
          console.log(error);
        });

      // Enviar a los admins la actualizacion
      let usuariosadmins = await User.find({
        rol: "admin",
        token: { $ne: "" },
      }).select("token");

      var tokens = [];
      for (var i in usuariosadmins) {
        if (usuariosadmins[i].token != "") {
          tokens.push(usuariosadmins[i].token);
        }
      }

      const message = {
        data: {
          titulo: "Un repartidor desconectado",
          contenido: "1 repartidor salio lista.",
          valor: "-1",
          detalles: JSON.stringify(rep),
        },
        webpush: {
          fcmOptions: {
            link: process.env.PWA_APP_URL,
          },
          headers: {
            Urgency: "high",
          },
        },
        tokens: tokens,
      };

      defaultMessaging.defaultMessaging
        .sendMulticast(message)
        .then((response) => {
          console.log("Notificación enviada a todos olos admins", response);
        })
        .catch((error) => {
          console.log(error);
        });

      res.status(201).json({
        status: true,
        description: "Estado actualizado.",
        detalles: rep,
      });
    });
  }
};

exports.ListaRepartidoresDisponiblesYa = async function (req, res, next) {
  const respuesta = await Repartidor.find().populate("id").exec();
  res.status(201).json({
    status: true,
    description: "Lista de repartidores",
    detalles: respuesta,
  });
};
