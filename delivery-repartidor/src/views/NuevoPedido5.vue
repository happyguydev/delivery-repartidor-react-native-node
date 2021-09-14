<template>
<ion-page>
    <NavigacionPedido :titulo="titulo">
        <template v-slot:default>
            <section class="px-3 py-1">
                <div class="w-full sm:w-5/12 mx-auto">
                    <div class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100">
                        <span class="mr-3 bg-blue-500 text-white rounded px-2 font-bold text-lg">4</span><br><span>Entrega el pedido</span><br>
                        <span class="font-bold text-lg">Jamuy</span><br>
                        <span @click="abrirmapa" class="font-semibold">Ver ubicación en mapa</span><br>
                        <!----
                <span class="font-semibold">{{ pedidoactual.referencia }}</span><br>
                
                <span>Tiempo estimado de llegada: </span><span class="font-bold">20min</span><br>
                ---->
                    </div>
                    <div class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100" v-if="pedidoactual.tipo_pago=='efectivo'">
                        <div class="font-bold text-lg mb-2">Pagará en Efectivo</div>
                        <!---
                <span>Total pedido: </span><span class="font-semibold">S/{{ pedidoactual.items.reduce((sum, producto) => sum + (producto.cantidad * producto.precio) , 0) }}</span><br>
                -->
                        <span>Delivery: </span><span class="font-semibold">S/{{ parseFloat(pedidoactual.monto_delivery).toFixed(2) }}</span><br>
                        <!---
                <span>Propina: </span><span class="font-semibold">S/1.00</span><br>
                Agradece por la propina<br>
                --->
                        <!--
                <span class="italic">
                
                <span>Total a cobrar: </span><span class="font-bold">S/{{ pedidoactual.items.reduce((sum, producto) => sum + (producto.cantidad * producto.precio) , 0) + pedidoactual.monto_delivery }}</span><br>
               
            </span>
             --->
                    </div>
                    <div class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100" v-if="pedidoactual.tipo_pago=='transferencia'">
                        <div class="font-bold text-lg mb-2 text-orange-500">Pagará por Transferencia</div>
                        <span>Estado del pago: </span><span class="font-bold">Confirmado</span><br>
                        <span class="italic">Puedes entregar el producto sin problemas.</span><br>
                        <span>Estado del pago: </span><span class="font-bold">Por confirmar</span><br>
                        <span class="italic">No entregues el producto hasta que se confirme el pago.</span><br>
                    </div>
                    <div class="h-32">

                    </div>
                </div>
            </section>
            <div class="text-center py-4 fixed bottom-0 w-full bg-white border-t-2 border-gray-300">
                <div class="mb-3">
                    <span><span class="bg-gray-200 inline-block py-1 px-2 rounded-full mr-3 font-semibold"><i class="fas fa-phone fa-2x"></i></span></span>
                    <span><span class="bg-gray-200 inline-block py-1 px-2 rounded-full mr-3 font-semibold"><i class="far fa-comment-dots fa-2x"></i></span></span>
                    <span><span class="bg-gray-200 inline-block py-1 px-2 rounded-full mr-3 font-semibold"><i class="fas fa-headset fa-2x"></i></span></span>
                </div>
                <span @click="alertaConfirmacion" class="text-sm"><span class="cursor-pointer inline-block text-white bg-blue-500 py-2 px-3 rounded-full font-semibold">Entregué el pedido</span></span>
            </div>
        </template>
    </NavigacionPedido>
</ion-page>
</template>

<script>
import {
    IonPage,
alertController,
} from '@ionic/vue';
import NavigacionPedido from '../views/NavegacionPedido';
import {
    Plugins
} from '@capacitor/core';
const {
    LocalNotifications
} = Plugins;

export default {
    name: 'nuevo-pedido-paso-cinco',
    data() {
        return {
            titulo: 'Pedido en curso',
        }
    },
    async created() {
        await LocalNotifications.cancel({
            notifications: [{
                id: 5
            }]
        });
        LocalNotifications.schedule({
            notifications: [{
                id: 6,
                title: 'Pedido en curso',
                icon: '',
                body: 'Si ya llegaste al destino del cliente, entrégale los productos.',
                //sound: isAndroid ? 'file://sound.mp3' : 'file://beep.caf',
                resume: true,
                ongoing: true,
                sticky: true,

            }]
        });
    },
    computed: {
        pedidoactual: {
            get() {
                return this.$store.state.pedidoactual[0];
            },
            set(value) {
                this.$store.commit("setpedidoactuald", value)
            }
        },
        pedidos: {
            get() {
                return this.$store.state.pedidos;
            },
            set(value) {
                this.$store.commit("seteliminarpedido", value)
            }
        },
    },
    methods: {
        abrirmapa(c) {
            window.open(this.pedidoactual.coordenadas_cliente)
        },
        async entregueelPedido() {
            this.$http.post("https://app.jamuy.net/api/cambiar-estado-pedido", {
                    id: this.pedidoactual._id,
                    estado: 'entregue el pedido'
                })
                .then(async (response) => {

                    this.pedidoactual = []
                    await LocalNotifications.cancel({
                        notifications: [{
                            id: 6
                        }]
                    });
                    LocalNotifications.schedule({
                        notifications: [{
                            id: 1,
                            title: 'Estás activo en Jamuy',
                            icon: '',
                            body: 'Tu estado es activo, empezarás a recibir pedidos.',
                            //sound: isAndroid ? 'file://sound.mp3' : 'file://beep.caf',
                            resume: true,
                            ongoing: true,
                            sticky: true,

                        }]
                    });

                    this.$router.push('/inicio-repartidor')
                })
                .catch((error) => {
                    console.log(error)
                });
        },
        async alertaConfirmacion() {
            const alert = await alertController
                    .create({
                        cssClass: 'my-custom-class',
                        header: 'Alerta de confirmación',
                        message: '¿Seguro que entregaste el pedido?',
                        buttons: [{
                                text: 'Cancelar',
                                role: 'cancel',
                                cssClass: 'secondary',
                            },
                            {
                                text: 'Aceptar',
                                handler: () => {
                                    this.entregueelPedido()
                                }
                            },
                            ],
                    })
                return alert.present();    
        }
    },

    components: {

        NavigacionPedido,
        IonPage,

    },
}
</script>
