var mongoose = require('mongoose');
var { customAlphabet } = require("nanoid");

const nanoid = customAlphabet('1234567890', 5)
var PedidoAdminSchema = new mongoose.Schema({
    pedido_admin_id: {
        type: String,
        default: () => nanoid(),
      },
    nombre_tienda: {
        type: String,
        required: true
    },
    monto_delivery: {
        type: Number,
        required: true
    },
    coordenadas_cliente: {
        type: String,
        required: true
    },
    coordenadas_tienda: {
        type: String,
        required: true
    },
    referencia: {
        type: String,
        required: false
    },
    tipo_pago: {
        type: String,
        required: true
    },
    tiempo_demora: {
        type: Number, required: false
    },
    repartidor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    estado: {
        type: String,
        required: true,
        default: "en espera"
    },
    items: {
        type: Array,
        "default": []
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('PedidoAdmin', PedidoAdminSchema);
