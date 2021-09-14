<template>
<ion-page>
    <ion-header translucent>
        <ion-toolbar>
            <ion-title>{{ title }}</ion-title>
            <ion-buttons slot="end">
                <ion-button @click="cerrarmodal">Cerrar</ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content>

        <section class="px-3 py-1">
            <div class="w-full sm:w-5/12 mx-auto">
                <div class="block mb-3 py-1 px-3 rounded-lg shadow border border-gray-100 bg-blue-500 text-white">
                    <span class="font-bold text-xl">Delivery</span><br>
                    <span class="mr-2">●</span><span>Incluye delivery y propina:</span><br>
                    <div class="text-center text-4xl font-bold"><span>S/</span><span>{{ pedidoactual.monto_delivery }}</span></div>
                </div>
                <!---
                <div class="block mb-3 py-1 px-3 rounded-lg shadow border border-gray-100">
                    <span class="font-bold text-xl">Tiempo y distancia</span><br>
                    <span class="mr-2 text-blue-500">●</span><span>Desde donde recoges el pedido hasta que entregues al cliente.</span><br>
                    
                    <div class="text-center text-2xl font-bold"><span>13<span class="text-sm">min</span><span class="text-blue-500">/</span><span>3.2<span class="text-sm">km</span></span></span></div>
                </div>
                ---->
                <div class="block mb-20 py-1 px-3 rounded-lg shadow border border-gray-100">
                    <span class="mr-2 text-blue-500"><i class="fas fa-store"></i></span><span class="font-bold text-xl">{{ pedidoactual.nombre_tienda }}</span><br>
                    <span class="mr-2 text-blue-500">●</span><span>Recoge en: </span><span class="font-semibold" @click="abrirmapa(pedidoactual.coordenadas_tienda)">Ver ubicación de la tienda</span><br>
                    <span class="mr-2 text-blue-500">●</span><span>Entrega en: </span><span class="font-semibold" @click="abrirmapa(pedidoactual.coordenadas_cliente)">Ver ubicación del cliente</span><br>
                    <div class="mb-3"><span class="text-xs text-gray-600">Generado a las {{ pedidoactual.createdAt }} </span></div>
                </div>
            </div>
        </section>
        <div class="text-center py-4 fixed bottom-0 w-full bg-white border-t-2 border-gray-300">
            <span class="text-sm"><span class="bg-gray-200 border-4 border-blue-500 inline-block py-1 px-2 rounded-full mr-3 font-semibold">{{ cuentaregresiva }}</span></span>
            <span class="text-sm" @click="aceptarpedido()"><a href="javascript:void(0);" class="inline-block text-white bg-blue-500 py-2 px-3 rounded-full font-semibold">Tomar el pedido</a></span>
        </div>
    </ion-content>

</ion-page>
</template>

<script>
import {
    IonButtons,
    IonContent,
    IonButton,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonPage
} from '@ionic/vue';
import {
    NativeGeocoder,

} from '@ionic-native/native-geocoder/ngx';
import {
    defineComponent
} from 'vue';

export default defineComponent({
    name: 'nuevo-pedido',
    props: {
        title: {
            type: String,
            default: 'Nuevo pedido'
        },
        cerrar: {
            type: Function
        },
        sp: {
            type: String,
        },

    },
    data() {
        return {
            content: 'Content',
            cuenta: '',
            direcciontienda: '',
            direccioncliente: '',
        }
    },
    created() {
        const diferencia = Date.now() - parseInt(this.sp)
        this.cuentaregresiva = diferencia > 30000 ? 0 : parseInt((30000 - diferencia) / 1000)
        this.countDownTimer()
    },
    computed: {
        pedidoactual: {
            get() {
                return this.$store.state.pedidoactual.length == 1 && this.$store.state.pedidos.length > 0 ? this.$store.state.pedidos[this.$store.state.pedidos.length - 1] : this.$store.state.pedidoactual[0]
            },
            set(value) {
                this.$store.commit("setpedidoactuald", value)
            }
        },
        cuentaregresiva: {
            get() {
                return this.$store.state.cuentaregresiva
            },
            set(value) {
                this.$store.commit("setcuentaregresiva", value)
            }
        },
        estadoPerfil: {
                get() {
                    return this.$store.state.perfil.estado;
                },
                set(value) {
                    this.$store.commit("setestadoperfil", value)
                }
            },
    },

    methods: {
        abrirmapa(c) {
            window.open(c)
        },
        /*
        async coordenadascliente() {
            const nativeGeocoder = new NativeGeocoder;
             await nativeGeocoder.reverseGeocode(this.pedido.coordenadas_cliente, {
                    useLocale: true,
                    maxResults: 5
                })
                .then((result) => { this.direccioncliente = JSON.stringify(result[0]) })
                .catch((error) => { console.log(error) });
        },
        async coordenadastienda() {
            const nativeGeocoder = new NativeGeocoder;
             await nativeGeocoder.reverseGeocode(this.pedido.coordenadas_cliente, {
                    useLocale: true,
                    maxResults: 5
                })
                .then((result) => { this.direcciontienda = JSON.stringify(result[0]) })
                .catch((error) => { console.log(error) });
        },
        */
        cerrarmodal() {
            this.rechazarpedido()
            clearTimeout(this.cuenta)
        },
        countDownTimer() {
            console.log('primer plano:')
                if(this.cuentaregresiva > 0) {
                   this.cuenta = setTimeout(() => {
                        this.cuentaregresiva -= 1
                        this.countDownTimer()
                    }, 1000)
                }
                else if(this.cuentaregresiva == 0) {
                    this.rechazarpedido()
                }
        },
        aceptarpedido() {
            this.$http.post("https://app.jamuy.net/api/tomar-pedido", {
                    id: this.pedidoactual._id
                })
                .then((response) => {
                    //this.$soketio.emit('repartidor-acepto-pedido', response);
                    this.cerrar()
                    this.cuentaregresiva = 30
                    clearTimeout(this.cuenta)
                    if(this.estadoPerfil == 5) {
                        this.estadoPerfil = false
                    }
                    if (this.pedidoactual) {
                        this.$router.push({
                            name: 'nuevo-pedido-paso-dos'
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                });
        },
        rechazarpedido() {
            console.log('Rechazado por primer plano')
            this.$http.post("https://app.jamuy.net/api/descartar-pedido", {
                    id: this.pedidoactual._id
                })
                .then((response) => {
                    this.cerrar()
                    this.cuentaregresiva = 30
                    this.pedidoactual = []
                    
                })
                .catch((error) => {
                    console.log(error)
                });
        },
    },
    components: {
        IonButton,
        IonButtons,
        IonToolbar,
        IonPage,
        IonHeader,
        IonTitle,
        IonContent
    },
});
</script>
