var mongoose = require("mongoose");
var { customAlphabet } = require("nanoid");
const nanoid = customAlphabet('1234567890', 5)
var RepartidorSchema = new mongoose.Schema(
  {
    repartidor_id: {
      type: String,
      default: () => nanoid(),
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    estado: {
      type: Number, // 0: ocupado, 1: activo pero con cola, 2: mi ultimo pedido
      required: true,
    },

    cola: { type: Array , "default" : [] },
    socket_id: {
      type: String,
      required: true,
  },
  createdAt: { type: Date, default: Date.now },
  fecha_cola: { type: Date, default: Date.now }
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("Repartidor", RepartidorSchema);
