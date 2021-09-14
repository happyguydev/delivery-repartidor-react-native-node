var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var { customAlphabet } = require("nanoid");

const nanoid = customAlphabet('1234567890', 5)
var UserSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: String,
      default: () => nanoid(),
    },
    token: {
        type: String,
        required: false
    },

    nombres: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    clave: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['admin', 'repartidor', 'tienda', 'cliente'],
        default: 'cliente'
    },
    movil: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    documentoidentidad: {
        type: String,
        required: false,
        default: ''
    },
    

}, {
    timestamps: true
});

UserSchema.pre('save', function(next){

    var usuario = this;
    var SALT_FACTOR = 5;

    if(!usuario.isModified('clave')){
        return next();
    } 

    bcrypt.genSalt(SALT_FACTOR, function(err, salt){

        if(err){
            return next(err);
        }

        bcrypt.hash(usuario.clave, salt, null, function(err, hash){

            if(err){
                return next(err);
            }

            usuario.clave = hash;
            next();

        });

    });

});

UserSchema.methods.comparePassword = function(passwordAttempt, cb){

    bcrypt.compare(passwordAttempt, this.clave, function(err, isMatch){

        if(err){
            return cb(err);
        } else {
            cb(null, isMatch);
        }
    });

}

module.exports = mongoose.model('Usuario', UserSchema);
