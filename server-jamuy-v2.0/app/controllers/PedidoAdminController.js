var PedidoAdmin = require("../models/pedido-admin");
var Repartidor = require("../models/repartidor");
var RepartidorController = require("../controllers/RepartidorController");
var PedidoAdminController = require("../controllers/PedidoAdminController");
var defaultMessaging = require("../../firebase-config");
var Rechazado = require("../models/rechazado");
var User = require("../models/user");
const ObjectId = require("mongodb").ObjectID;



// Validar código.
exports.registrarPedido = async function (req, res, next) {
  let coordenadas_tienda = req.body.coordenadas_tienda;
  let coordenadas_cliente = req.body.coordenadas_cliente;
  let referencia = req.body.referencia;
  let montodelivery = req.body.montodelivery;
  let nombre_tienda = req.body.nombre_tienda;
  let estado = req.body.estado;
  let items = req.body.items;
  let tipo_pago = req.body.tipopago;

  if (
    !coordenadas_tienda ||
    !coordenadas_cliente ||
    !montodelivery ||
    !nombre_tienda ||
    !estado ||
    !items ||
    !tipo_pago
  ) {
    return res.status(422).send({ error: "Debes ingresar todos los campos" });
  }

  let pedidoAdmin = new PedidoAdmin({
    nombre_tienda: nombre_tienda,
    coordenadas_tienda: coordenadas_tienda,
    coordenadas_cliente: coordenadas_cliente,
    monto_delivery: montodelivery,
    referencia: referencia,
    estado: estado,
    repartidor: null,
    items: items,
    tipo_pago: tipo_pago,
  });

  pedidoAdmin.save(async function (err, pedido) {
    if (err) {
      return next(err);
    }

    await PedidoAdminController.enviarNotiTodos(
      pedido,
      "Nuevo pedido registrado",
      "Nuevo pedido registrado",
      "10"
    );

    res.status(201).json({
      status: true,
      description: "Pedido registrado.",
      detalles: pedido,
    });
  });
};
exports.listapedidosenespera = async function () {
  const respuesta = PedidoAdmin.find().populate("repartidor").exec();
  return respuesta;
};
exports.listapedidosadmin = async function () {
  const respuesta = PedidoAdmin.find({ estado: { $ne: "en espera" } })
    .populate("repartidor")
    .exec();
  return respuesta;
};



exports.aceptarPedido = async function (req, res, next) {
  let id = req.body.id;
  let tiempo_demora = req.body.tiempodemora;

  if (id == null) {
    res.send("Necesitas ingresar el ID del pedido.");
  }

  if (tiempo_demora == null) {
    res.send("Necesitas ingresar el tiempo de demora.");
  }

  // Cambiando el estado a EN CURSO
  let nuevopedido = await PedidoAdmin.findOneAndUpdate(
    { _id: ObjectId(id) },
    { $set: { estado: "en curso", tiempo_demora: tiempo_demora } },
    { new: true }
  )
    .populate("repartidor")
    .exec();

    let ejecutaren = (tiempo_demora - 5) * 60 * 1000;
    console.log("Milisegundos en los que se emitirá:", ejecutaren);
    let primeroCola = null

    let s1 = setTimeout(async () => {
      
      console.log("Buscando repartidor...");
      primeroCola = await RepartidorController.primeroCola(nuevopedido._id.toString());
      console.log(primeroCola)
      if (primeroCola != null) {
        console.log(
          "Emitir al primero de la cola de repartidores",
          primeroCola.socket_id
        );
      

      await PedidoAdminController.enviarNotiPedido(
        nuevopedido,
        primeroCola.socket_id
      );
    }
    else {
      clearTimeout(v2)
    }
    }, ejecutaren);


    // Verificar si en 30 segundos no se ha aceptado el pedido, asumirlo como rechazado
    let v2 = setTimeout(async () => {

      let estadopedido = await PedidoAdmin.findOneAndUpdate(
        { _id: ObjectId(id), estado: "en curso" },
        {},
        { new: true }
      )
        .populate("repartidor")
        .exec();

      if (estadopedido != null) {
        let estado = await Repartidor.findOne(
          { _id: ObjectId(primeroCola._id), rechazados: { $nin: id } },
          {},
          { new: true, sort: { fecha_cola: 1 } }
        ).exec();

        let repartidor = await Repartidor.findOneAndUpdate(
          { _id: ObjectId(primeroCola._id), rechazados: { $nin: nuevopedido._id } },
          { $addToSet: { rechazados: nuevopedido._id }, $set: { estado: 1 } },
          { new: true, sort: { fecha_cola: 1 } }
        )
          .populate("id")
          .exec();

        let pedidoadmin = await PedidoAdmin.findOneAndUpdate(
          { _id: ObjectId(id) },
          { $set: { estado: "rechazado" } },
          { new: true }
        )
          .populate("repartidor")
          .exec();

        if (estado.estado == 5) {
          await Repartidor.find(
            { _id: ObjectId(primeroCola._id), rechazados: { $nin: nuevopedido._id } },
            { $addToSet: { rechazados: nuevopedido._id }, $set: { estado: 5 } },
            { new: true, sort: { fecha_cola: 1 } }
          )
            .remove()
            .exec();
        } else {
          await Rechazado.create({ repartidor: repartidor._id });
          
          await Rechazado.find({ repartidor: repartidor._id }).exec(
            async function (err, results) {
              var count = results.length;
              if (count === 3) {
                // Mandar al fondo de la cola al Repartidor con nuevo pedido.
                let repartidordos = await Repartidor.findOneAndUpdate(
                  {
                    _id: repartidor._id,
                    rechazados: { $nin: nuevopedido._id },
                  },
                  { $set: { estado: 1, fecha_cola: new Date() } },
                  { new: true, sort: { fecha_cola: 1 } }
                )
                  .populate("id")
                  .exec();

                await Rechazado.find({ repartidor: repartidor._id })
                  .remove()
                  .exec();
              }
            }
          );
        }

        

        // Buscamos otro repartidor.
        console.log("Buscando otro repartidor...");
        let primeroCola = await RepartidorController.primeroCola(
         id.toString()
        );

        if (primeroCola != null) {
          console.log(
            "Emitir al primero de la cola de repartidores",
            primeroCola.socket_id
          );
          await PedidoAdminController.enviarNotiPedido(
            nuevopedido,
            primeroCola.socket_id
          );
        } else {
          console.log("No hay otro repartidor disponible.");
        }

      }

    }, ejecutaren + 31000);

    await PedidoAdminController.enviarNotiTodos(
      nuevopedido,
      "Nuevo pedido registrado",
      "Nuevo pedido registrado",
      "11"
    );  

  res.status(201).json({
    status: true,
    description: "Pedido enviado a repartidor.",
    detalles: nuevopedido,
  });
};

exports.BuscarNuevoRepartidor = async function (idpedido) {
  console.log("Esperando que nuevo repartidor se nos una...");
  //var stream = Repartidor.find({}, {}, { sort: { fecha_cola: 1 }}).stream();
 
};

exports.enviarNotiPedido = async function (pedido, user) {
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24,
  };

  const message_notification = {
    data: {
      titulo: "Tienes un nuevo pedido",
      contenido: "Tienes 30 segundos para aceptar el pedido.",
      vida: "30000",
      detalles: JSON.stringify(pedido),
    },
  };

  defaultMessaging.defaultMessaging.sendToDevice(user, message_notification, options)
    .then((response) => {
      console.log("Notificación enviada", response);
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.enviarNotiTodos = async function (pedido, titulo, contenido,  valor) {

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
      titulo: titulo,
      contenido: contenido,
      valor: valor,
      detalles: JSON.stringify(pedido),
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
};


exports.rechazarPedido = async function (req, res, next) {
  id = req.body.id;

  if (id == null) {
    res.send("Necesitas ingresar el ID del pedido.");
  }

  PedidoAdmin.findOneAndUpdate(
    { _id: id },
    { $set: { estado: "rechazado" } },
    { new: true }
  )
    .populate("repartidor")
    .exec(async function (err, card) {
      if (err) {
        return next(err);
      } else {

        await PedidoAdminController.enviarNotiTodos(
          card,
          "Nuevo pedido registrado",
          "Nuevo pedido registrado",
          "12"
        );  

        res.status(201).json({
          status: true,
          description: "Pedido actualizado",
          detalles: card,
        });
      }
    });
};
exports.asignarRepartidor = async function (id, repartidor) {
  return await PedidoAdmin.findOneAndUpdate(
    { _id: id },
    { $set: { repartidor: repartidor.id } },
    { new: true }
  )
    .populate("repartidor")
    .exec();
};

exports.cambiarEstado = async function (req, res, next) {
  id = req.body.id;
  estado = req.body.estado;

  if (id == null) {
    res.send("Necesitas ingresar el ID del pedido.");
  }

  if (estado == null) {
    res.send("Necesitas ingresar el estado del pedido.");
  }

  let pedido = await PedidoAdmin.findOneAndUpdate(
    { _id: id },
    { $set: { estado: estado } },
    { new: true }
  )
    .populate("repartidor")
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
  
    const message = {
      data: {
        titulo: "Se actualizó estado de pedido",
        contenido: "Nuevo estado",
        valor: "5",
        detalles: JSON.stringify(pedido),
      },
      tokens: tokens,
    };
  
    defaultMessaging.defaultMessaging
      .sendMulticast(message)
      .then((response) => {
        console.log("Notificación enviada a todos a los admins", response);
      })
      .catch((error) => {
        console.log(error);
      });

  if (estado == "entregue el pedido") {

    let repartidor = await Repartidor.findOneAndUpdate(
      {
        id: pedido.repartidor._id,
        cola: {
          $elemMatch: {
            id: {
              $gte: id,
            },
          },
        },
      },
      { $pull: { cola: { id: id } } },
      { new: true }
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
    
      const message = {
        data: {
          titulo: "Actualizar estado repartidor",
          contenido: "Se actualizo.",
          valor: "6",
          detalles: JSON.stringify(repartidor),
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
  }

  res.status(201).json({
    status: true,
    description: "Pedido actualizado",
    detalles: pedido,
  });
};
