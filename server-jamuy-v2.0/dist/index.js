"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var express = require("express");

var app = express();

var mongoose = require("mongoose");

var logger = require("morgan");

var bodyParser = require("body-parser");

var cors = require("cors");

var RepartidorController = require("./app/controllers/RepartidorController");

var PedidoAdminController = require("./app/controllers/PedidoAdminController");

var _require = require("socket.io"),
    Server = _require.Server;

var databaseConfig = require("./config/database");

var router = require("./routes/routes");

mongoose.connect(databaseConfig.url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
var port = 3000;
var server = app.listen(port, function () {
  console.log("Escuchando el puerto: " + port);
});
var path = "/stomp";

var io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: path
});

global.io = io;

function destroy() {
  try {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null; //this will kill all event listeners working with socket
    //set some other stuffs to NULL
  } catch (_unused) {}
}

io.on("connection", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(socket) {
    var listarepartidores, listapedidosenespera, listapedidosadmin;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            console.log("Conexión abierta.", socket.id);
            socket.emit("cambiar-estado-cuando-desconecta", {
              data: false
            }); // Enviar lista de repartidores disponibles al momento que se conectan

            _context5.next = 4;
            return RepartidorController.listadorepartidoresdisponibles();

          case 4:
            listarepartidores = _context5.sent;
            socket.emit("mostrar-lista-repartidores", listarepartidores); // Enviar lista de pedidos disponibles al momento que se conectan

            _context5.next = 8;
            return PedidoAdminController.listapedidosenespera();

          case 8:
            listapedidosenespera = _context5.sent;
            socket.emit("lista-pedidos-por-aceptar-admin", listapedidosenespera); // Enviar lista total de pedidos

            _context5.next = 12;
            return PedidoAdminController.listapedidosadmin();

          case 12:
            listapedidosadmin = _context5.sent;
            socket.emit("lista-pedidos-admin", listapedidosadmin); // Pedidos desde panel de ADMIN
            // Nuevo pedido [ENVIAR]

            socket.on("nuevo-pedido-por-aceptar-admin", function (data) {
              io.emit("nuevo-pedido-por-aceptar-admin", data);
            });
            socket.on("pedido-rechazado-admin", function (data) {
              io.emit("pedido-rechazado-admin", data);
            });
            socket.on("pedido-aceptado-admin", /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data) {
                var primeroCola;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        console.log(data.data.detalles._id);
                        io.emit("pedido-aceptado-admin", data);
                        console.log('Buscando repartidor');
                        _context.next = 5;
                        return RepartidorController.primeroCola(data.data.detalles);

                      case 5:
                        primeroCola = _context.sent;
                        console.log("Emitir al primero de la cola de repartidores", primeroCola.socket_id);
                        io.to(primeroCola.socket_id).emit("nuevo-pedido-para-repartidor", data);

                      case 8:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x2) {
                return _ref2.apply(this, arguments);
              };
            }()); // Cuando llega el nuevo pedido al Repartidor, emitir un anuncio de que aceptó o rechazo

            socket.on("repartidor-acepto-pedido", /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(data) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        console.log("El repartidor aceptó el pedido.");
                        io.emit("repartidor-acepto-pedido", data);

                      case 2:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function (_x3) {
                return _ref3.apply(this, arguments);
              };
            }());
            socket.on("repartidor-rechazo-pedido", /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(data) {
                var primeroCola;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        console.log("El repartidor rechazo el pedido, a buscar uno nuevo.");
                        _context3.next = 3;
                        return RepartidorController.primeroCola(data.data.detalles._id);

                      case 3:
                        primeroCola = _context3.sent;

                        if (primeroCola != null) {
                          console.log("Nuevo repartidor enviando, esperando respuesta.");
                          io.to(primeroCola.socket_id).emit("nuevo-pedido-para-repartidor", data);
                        } else {
                          console.log('No hay repartidores disponible para tu pedido.');
                        }

                      case 5:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x4) {
                return _ref4.apply(this, arguments);
              };
            }()); // Repartidores [ENVIAR]

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
            }); // Cuando un usuario cierra la conexión

            socket.on("disconnect", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
              var res;
              return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      console.log("Conexión cerrada.", socket.id); // Si usuario desconectado es un repartidor, sacarlo de la lista

                      console.log("Se desconecto un repartidor a la lista");
                      _context4.next = 4;
                      return RepartidorController.removerRepartidor(socket.id);

                    case 4:
                      res = _context4.sent;
                      console.log(res);
                      io.emit("quitar-repartidor-lista", socket.usuarioinfo);
                      destroy();

                    case 8:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4);
            })));

          case 23:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());
app.use(bodyParser.urlencoded({
  extended: false
})); // Parses urlencoded bodies

app.use(bodyParser.json()); // Send JSON responses

app.use(logger("dev")); // Log requests to API using morgan

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});
router(app);