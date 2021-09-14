var AuthenticationController = require("../app/controllers/authentication")
var PedidoAdminController = require("../app/controllers/PedidoAdminController")
var RepartidorController = require("../app/controllers/RepartidorController")


//TodoController = require('./controllers/todos'),
  express = require("express"),
  passportService = require("../config/passport"),
  passport = require("passport");

var requireAuth = passport.authenticate("jwt", { session: false }),
  requireLogin = passport.authenticate("local", { session: false });

module.exports = function (app) {
  var apiRoutes = express.Router(), authRoutes = express.Router();
  //todoRoutes = express.Router();

  // Auth Routes
  apiRoutes.use("/auth", authRoutes);

  authRoutes.post("/registro", AuthenticationController.register);
  authRoutes.post("/ingresar", requireLogin, AuthenticationController.login);

  authRoutes.get("/protected", requireAuth, function (req, res) {
    res.send({ content: "Success" });
  });

  apiRoutes.get(
    "/verificarnumero/:movil",
    AuthenticationController.verificarNumero
  );
  apiRoutes.get(
    "/validarnumero/:movil/:codigoavalidar",
    AuthenticationController.validarNumero
  );
    apiRoutes.post('/registrar-pedido', requireAuth, AuthenticationController.roleAuthorization(['admin']), PedidoAdminController.registrarPedido);

  
  // API de Admin
  apiRoutes.post('/registrar-pedido', requireAuth, AuthenticationController.roleAuthorization(['admin']), PedidoAdminController.registrarPedido);
  apiRoutes.post('/aceptar-pedido', requireAuth, AuthenticationController.roleAuthorization(['admin']), PedidoAdminController.aceptarPedido);
  apiRoutes.post('/rechazar-pedido', requireAuth, AuthenticationController.roleAuthorization(['admin']), PedidoAdminController.rechazarPedido);
    // API de pedidos desde administracion
    apiRoutes.post('/cambiar-estado-pedido', requireAuth, AuthenticationController.roleAuthorization(['repartidor']), PedidoAdminController.cambiarEstado);
    apiRoutes.post('/cambiar-estado-repartidor-admin', requireAuth, AuthenticationController.roleAuthorization(['admin']), RepartidorController.cambiarestadoAdmin);
    apiRoutes.post('/registrar-token-admin', requireAuth, AuthenticationController.roleAuthorization(['admin']), PedidoAdminController.RegistrarToken);
    apiRoutes.get('/lista-repartidores-disponibles', requireAuth, AuthenticationController.roleAuthorization(['admin']), RepartidorController.ListaRepartidoresDisponiblesYa);

 
  // API de repartidor
  apiRoutes.post('/tomar-pedido', requireAuth, AuthenticationController.roleAuthorization(['repartidor']), RepartidorController.tomarPedido);
  apiRoutes.post('/descartar-pedido', requireAuth, AuthenticationController.roleAuthorization(['repartidor']), RepartidorController.descartarPedido);
  apiRoutes.post('/cambiar-estado-repartidor', requireAuth, AuthenticationController.roleAuthorization(['repartidor']), RepartidorController.cambiarestado);


  // Set up routes
  app.use("/api", apiRoutes);
};
