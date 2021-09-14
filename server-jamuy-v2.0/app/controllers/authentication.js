var jwt = require("jsonwebtoken");
var User = require("../models/user");
var Mensaje = require("../models/mensaje");
var authConfig = require("../../config/auth");
var request = require("request");
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;


function generateToken(usuario) {
  return jwt.sign(usuario, authConfig.secret, {
    expiresIn: '365d',
  });
}

function setUserInfo(request) {
  return {
    _id: request._id,
    usuario_id: request.usuario_id,

    email: request.email,
    rol: request.rol,
    nombres: request.nombres,
    apellidos: request.apellidos,
  };
}

exports.login = function(req, res, next){

  var usuarioInfo = setUserInfo(req.user);

  res.status(200).json({
      token: 'JWT ' + generateToken(usuarioInfo),
      usuario: usuarioInfo
  });

}

exports.register = function (req, res, next) {
  var nombres = req.body.nombres;
  var apellidos = req.body.apellidos;
  var movil = req.body.movil;
  var email = req.body.email;
  var clave = req.body.clave;
  var rol = req.body.rol;

  if (!email) {
    return res.status(422).send({ error: "Debes ingresar un email" });
  }

  if (!clave) {
    return res.status(422).send({ error: "Debes ingresar una clave" });
  }

  User.findOne({ email: email }, function (err, existeUsuario) {
    if (err) {
      return next(err);
    }

    if (existeUsuario) {
      return res
        .status(422)
        .send({ error: "El email registrado está en uso." });
    }

    var usuario = new User({
      nombres: nombres,
      apellidos: apellidos,
      movil: movil,
      email: email,
      clave: clave,
      role: rol,
    });

    usuario.save(function (err, usuario) {
      if (err) {
        return next(err);
      }

      var usuarioInfo = setUserInfo(usuario);

      res.status(201).json({
        token: "JWT " + generateToken(usuarioInfo),
        usuario: usuarioInfo,
      });
    });
  });
};

exports.roleAuthorization = function (roles) {
  return function (req, res, next) {
    var usuario = req.user;
   
    User.findById(usuario._id, function (err, usuarioEncontrado) {
      if (err) {
        res.status(422).json({ error: "Usuario no encontrado." });
        return next(err);
      }
	console.log(roles)
console.log(usuarioEncontrado.rol)
      if (roles.indexOf(usuarioEncontrado.rol) > -1) {
        return next();
      }

      res
        .status(401)
        .json({ error: "No estás autorizado para ver este contenido." });
      return next("Unauthorized");
    });
    
   
  };
};

// Código random
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Enviar SMS de confirmación.
exports.verificarNumero = async function (req, res, next) {
  let codigo = getRandomInt(1000, 10000);
  let numero = req.params.movil;
  let verificar = await User.findOne({ movil: numero }).exec();

  if (verificar == null) {

    var options = {
      method: "POST",
      url: "https://platform.releans.com/api/v2/message",
      headers: {
        Authorization:
          "Bearer 23eea598e70d94b3520d120a01d7e73aad60aec5f6031fe82430ca9f2cfcb908",
      },
      form: {
        sender: "Jamuy",
        mobile: "+51" + numero,
        content: codigo + " es tu código de activación para Jamuy Delivery",
      },
    };

    request(options, async function (error, response) {
      if (error) throw new Error(error);

      let respuesta = JSON.parse(response.body);
      if (respuesta.status == 201) {
        await Mensaje.create({ movil: numero, codigo: codigo });
      }
      res.json(respuesta);
    });
  }
  else {
    res.status(409).send({ error: "Ya existe" });
  }
};

// Validar código.
exports.validarNumero = async function (req, res, next) {
  let codigoavalidar = req.params.codigoavalidar;
  let numero = req.params.movil;
  await Mensaje.findOne(
    { movil: numero, codigo: codigoavalidar },
    function (err, documento) {
      if (err) {
        res.send(err);
      } else {
        res.json(documento);
      }
    }
  );
};
