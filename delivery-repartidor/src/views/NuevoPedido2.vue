<template>
<ion-page>
    <NavigacionPedido :titulo="titulo">
        <template v-slot:default>
            <section class="px-3 py-1">
                <div class="w-full sm:w-5/12 mx-auto">
                    <div class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100">
                        <span class="mr-3 bg-blue-500 text-white rounded px-2 font-bold text-lg">1</span><br><span>Dirígete a:</span><br>
                        <span class="font-bold text-lg">{{ pedidoactual.nombre_tienda }}</span><br>
                        <div class="text-center text-lg font-bold mt-2">
                            <a @click="abrirmapa" href="javascript:void(0);" class="text-blue-500 border-b border-dotted border-blue-500"><i class="fas fa-map-marker-alt"></i> Ver ubicación en Google Maps</a>
                        </div>
                    </div>
                </div>
            </section>
            <div class="text-center py-4 fixed bottom-0 w-full bg-white border-t-2 border-gray-300">
                <div class="mb-3">
                    <span><span class="bg-gray-200 inline-block py-1 px-2 rounded-full mr-3 font-semibold"><i class="far fa-comment-dots fa-2x"></i></span></span>
                    <span><span class="bg-gray-200 inline-block py-1 px-2 rounded-full mr-3 font-semibold"><i class="fas fa-headset fa-2x"></i></span></span>
                </div>
                <span @click="alertaConfirmacion" class="text-sm"><a href="javascript:void(0);" class="inline-block text-white bg-blue-500 py-2 px-3 rounded-full font-semibold">Llegué a la Tienda</a></span>
            </div>
        </template>
    </NavigacionPedido>
</ion-page>
</template>

<script>
import {
    IonPage,
    alertController
} from '@ionic/vue';
import NavigacionPedido from '../views/NavegacionPedido';
import {
    LaunchNavigator
} from '@ionic-native/launch-navigator';
import {
    Plugins
} from '@capacitor/core';
const {
    LocalNotifications
} = Plugins;
export default {
    name: 'nuevo-pedido-paso-dos',
    data() {
        return {
            titulo: 'Pedido en curso',
        }
    },
    async created() {
        await LocalNotifications.cancel({
            notifications: [{
                id: 1
            }]
        });
        LocalNotifications.schedule({
            notifications: [{
                id: 3,
                title: 'Pedido en curso',
                icon: '',
                body: 'Diríguete a la tienda para recoger el pedido.',
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
        /*
        async navegar() {
            await this.obtenerPosicionActual()

            let coordenadas = this.obtenerCoordenadasdesdeURL(this.pedido.coordenadas_tienda)
            coordenadas = coordenadas.split(',')

            const launchNavigator = LaunchNavigator;
            
            launchNavigator.navigate(coordenadas, {
                start: this.coordenadasacutal
            })
            .then(
                success => console.log('Launched navigator', success),
                error => console.log('Error launching navigator', error)
            );
        },
        */
        abrirmapa() {
            window.open(this.pedidoactual.coordenadas_tienda)
        },
        llegueaTienda() {
            this.$http.post("https://app.jamuy.net/api/cambiar-estado-pedido", {
                    id: this.pedidoactual._id,
                    estado: 'llegue a tienda'
                })
                .then((response) => {
                    this.pedidoactual = 'llegue a tienda'
                    this.$router.push({
                        name: 'nuevo-pedido-paso-tres'
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
                        message: '¿Seguro que llegaste a la tienda?',
                        buttons: [{
                                text: 'Cancelar',
                                role: 'cancel',
                                cssClass: 'secondary',
                            },
                            {
                                text: 'Aceptar',
                                handler: () => {
                                    this.llegueaTienda()
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
