var mongoose = require('mongoose');

var MensajeSchema = new mongoose.Schema({

    movil: {
        type: String,
        required: true
    },
    codigo: {
        type: String,
        required: true
    },

}, {
    timestamps: false
});


module.exports = mongoose.model('Mensaje', MensajeSchema);