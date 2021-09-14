<template>
<ion-page>
    <NavigacionPedido :titulo="titulo">
        <template v-slot:default>
            <section class="px-3 py-1">
                <div class="w-full sm:w-5/12 mx-auto">
                    <div class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100">
                        <span class="mr-3 bg-blue-500 text-white rounded px-2 font-bold text-lg">2</span><br><span>Recoge el pedido de:</span><br>
                        <span class="font-bold text-lg">{{ pedidoactual.nombre_tienda }}</span><br>
                        <span>Id del pedido: </span><span class="font-semibold">#{{ pedidoactual.pedido_admin_id }}</span><br>
                        <span>Nombre del cliente: </span><span class="font-semibold">Jamuy</span><br>
                        <span class="font-bold"><i class="fas fa-hamburger"></i> {{ pedidoactual.items.length }} productos</span><br>
                    </div>
                    <div class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100 text-center bg-gray-500 text-white">
                        <span class="font-semibold"><i class="fas fa-utensils"></i> No te olvides de los cubiertos</span><br>
                    </div>
                    <div class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100">
                        <div class="font-semibold text-lg mb-2">Detalle de los productos</div>
                        <table class="w-full">
                            <tbody>
                                <tr v-for="(item,index) in pedidoactual.items" v-bind:key="index">
                                    <td class="py-3 border-b border-gray-400">
                                        <div class="text-lg leading-4 mx-2">
                                            <span>{{ item }}</span><br>
                                        </div>
                                    </td>
                                    <!---
                                    <td class="py-3 border-b border-gray-400">
                                        <div class="text-lg text-right ml-2">
                                            <span class="font-bold">S/{{ parseFloat(item.precio).toFixed(2) }}</span>
                                        </div>
                                    </td>
                                ---->
                                </tr>
                                
                            </tbody>
                        </table>
                    </div>
                    <div class="h-32">

                    </div>
                </div>
            </section>
            <div class="text-center py-4 fixed bottom-0 w-full bg-white border-t-2 border-gray-300">
                <div class="mb-3">
                    <span><span class="bg-gray-200 inline-block py-1 px-2 rounded-full mr-3 font-semibold"><i class="far fa-comment-dots fa-2x"></i></span></span>
                    <span><span class="bg-gray-200 inline-block py-1 px-2 rounded-full mr-3 font-semibold"><i class="fas fa-headset fa-2x"></i></span></span>
                </div>
                <span class="text-sm" @click="alertaConfirmacion"><span class="cursor-pointer inline-block text-white bg-blue-500 py-2 px-3 rounded-full font-semibold" >Tengo el pedido</span></span>
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
    name: 'nuevo-pedido-paso-tres',
    data() {
        return {
            titulo: 'Pedido en curso',
        }
    },
    async created() {
        await LocalNotifications.cancel({
            notifications: [{
                id: 3
            }]
        });
        LocalNotifications.schedule({
            notifications: [{
                id: 4,
                title: 'Pedido en curso',
                icon: '',
                body: 'Si ya estás en la tienda, recoger el pedido.',
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
        tengoelPedido() {
            this.$http.post("https://app.jamuy.net/api/cambiar-estado-pedido", {
                    id: this.pedidoactual._id,
                    estado: 'tengo el pedido'
                })
                .then((response) => {
                    this.pedidoactual = 'tengo el pedido'
                    this.$router.push({
                        name: 'nuevo-pedido-paso-cuatro'
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
                        message: '¿Seguro que tienes el pedido?',
                        buttons: [{
                                text: 'Cancelar',
                                role: 'cancel',
                                cssClass: 'secondary',
                            },
                            {
                                text: 'Aceptar',
                                handler: () => {
                                    this.tengoelPedido()
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
