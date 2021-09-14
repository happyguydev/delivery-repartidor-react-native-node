<template>
<ion-page>
    <NavigacionPedido :titulo="titulo">
        <template v-slot:default>
            <section class="px-3 py-1">
                <div class="w-full sm:w-5/12 mx-auto">
                    <div class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100">
                        <span class="mr-3 bg-blue-500 text-white rounded px-2 font-bold text-lg">3</span><br><span>Dirígete a:</span><br>
                        <span @click="abrirmapa" class="font-bold text-lg">Ver mapa</span><br>
                        <!----
                        <span>Referencia: <span class="font-semibold">{{ pedidoactual.referencia }}</span></span><br>
                        <span>Nombre del cliente: </span><span class="font-semibold">Roxana</span><br>
                        <span>Tiempo estimado de llegada: </span><span class="font-bold">20min</span><br>
                        --->
                        <div class="text-center text-lg font-bold mt-2">
                            <a @click="abrirmapa" href="javascript:void(0);" class="text-blue-500 border-b border-dotted border-blue-500"><i class="fas fa-map-marker-alt"></i> Ver ubicación en Google Maps</a>
                        </div>
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
                <span @click="alertaConfirmacion" class="text-sm"><span class="cursor-pointer inline-block text-white bg-blue-500 py-2 px-3 rounded-full font-semibold" >Llegué a destino</span></span>
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
    name: 'nuevo-pedido-paso-cuatro',
    data() {
        return {
            titulo: 'Pedido en curso',
        }
    },
    async created() {
        await LocalNotifications.cancel({
            notifications: [{
                id: 4
            }]
        });
        LocalNotifications.schedule({
            notifications: [{
                id: 5,
                title: 'Pedido en curso',
                icon: '',
                body: 'Ahora que tienes el pedido, diríguete donde el cliente.',
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
                this.$store.commit("setestadopedido", value)
            }
        },
    },
    methods: {
        abrirmapa(c) {
            window.open(this.pedidoactual.coordenadas_cliente)
        },
        lleguealDestino() {
            this.$http.post("https://app.jamuy.net/api/cambiar-estado-pedido", {
                    id: this.pedidoactual._id,
                    estado: 'llegue al destino'
                })
                .then((response) => {
                    this.pedidoactual = 'llegue al destino'
                    this.$router.push({
                        name: 'nuevo-pedido-paso-cinco'
                    })
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
                        message: '¿Seguro que llegaste al destino?',
                        buttons: [{
                                text: 'Cancelar',
                                role: 'cancel',
                                cssClass: 'secondary',
                            },
                            {
                                text: 'Aceptar',
                                handler: () => {
                                    this.lleguealDestino()
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
