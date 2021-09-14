var passport = require('passport');
var User = require('../app/models/user');
var config = require('./auth');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var LocalStrategy = require('passport-local').Strategy;

var localOptions = {
    usernameField: 'usuario',
    passwordField: "clave"
};

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  

var localLogin = new LocalStrategy(localOptions, function(usuario, clave, done){

    let campo = validateEmail(usuario);
    let form = campo ? { email : usuario } : { movil : usuario }

    User.findOne(form, function(err, usuario){

        if(err){
            return done(err);
        }

        if(!usuario){
            return done(null, false, {error: 'Login fallido. Intente de nuevo.'});
        }

        usuario.comparePassword(clave, function(err, isMatch){

            if(err){
                return done(err);
            }

            if(!isMatch){
                return done(null, false, {error: 'Login fallido. Intente de nuevo.'});
            }

            return done(null, usuario);

        });

    });

});

var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    secretOrKey: config.secret
};

var jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){

    User.findById(payload._id, function(err, usuario){

        if(err){
            return done(err, false);
        }

        if(usuario){
            done(null, usuario);
        } else {
            done(null, false);
        }

    });

});



passport.use(jwtLogin);
passport.use(localLogin);