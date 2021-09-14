var mongoose = require('mongoose');

var RechazadoSchema = new mongoose.Schema({
    repartidor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repartidor",
        required: true,
      },
      pedido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PedidoAdmin",
        required: true,
      },

}, {
    timestamps: true
});


module.exports = mongoose.model('Rechazado', RechazadoSchema);
