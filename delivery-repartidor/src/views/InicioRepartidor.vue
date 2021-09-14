<template>
<ion-page>
    <Navigacion :titulo="titulo">
        <template v-slot:default>
            <div class="w-full sm:w-5/12 mx-auto">
                <a @click="irA('/pedidos-en-espera')" href="javascript:void(0);" class="block bg-blue-200 text-center font-semibold py-2 px-2 rounded-full mb-4">
                    <span>{{ pedidos.length == 1 ? pedidos.length + ' pedido' : pedidos.length + ' pedidos' }} en espera</span>
                </a>
                <a href="javascript:void(0);" @click="cambiarestado(estadoPerfil==5 ? estadoPerfil=true : !estadoPerfil)" class="block  text-center font-semibold py-2 px-2 rounded-full mb-4" v-bind:class="{ 'bg-red-300': !estadoPerfil, 'bg-blue-200': estadoPerfil,'bg-green-200': estadoPerfil==5 }">
                    <span>{{ estadoPerfil===true ? 'Estás activo' : ( estadoPerfil==5 ? 'Mi último pedido' : ' Estás inactivo') }}</span>
                </a>
            </div>
            <section class="px-3 py-1">
                <div class="w-full sm:w-5/12 mx-auto">
                    <div class="font-semibold text-2xl">
                        <span><img src="/assets/img/avatar.png" class="w-16 h-16 rounded-full inline-block mr-2 border-4 border-blue-500"></span><span>Hola</span> <span class="text-blue-500">{{ perfil.nombres }}</span>
                    </div>
                    <div class="mb-3 text-gray-500 text-sm">
                        <span>Repartidor autorizado por Jamuy Delivery</span><br>
                        <span>Nombre completo: {{ perfil.usuario.nombres + ' ' + perfil.usuario.apellidos }}</span><br>
                        <span>Id: #{{ perfil.usuario.usuario_id }}</span><br>
                    </div>
                    <div class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100">
                        <span class="font-bold text-xl">Tu tasa de aceptación</span><br>
                        <span class="font-semibold text-2xl">85%</span><br>
                        <span>Pedidos aceptados: 78</span><br>
                        <span>Pedidos rechazados: 5</span><br>
                    </div>
                    <a href="javascript:void(0);" class="block mb-3 py-2 px-3 rounded-lg shadow border border-gray-100">
                        <span class="font-bold text-xl">Mi actividad</span><br>
                        <span>Pedidos realizados hoy: S/.78.00</span><br>
                        <span>Ganacia hoy: S/5.00</span><br>
                        <span>Deuda hoy: S/5.00</span><br>
                    </a>
                </div>
            </section>

        </template>
    </Navigacion>

</ion-page>
</template>

<style>

</style>

<script>
import Navigacion from '../views/Navegacion.vue';
import NuevoPedido from '../views/NuevoPedido.vue';
import {
    defineComponent,
    vue
} from 'vue';
import {
    IonPage,
    modalController,
    loadingController,
    alertController,
} from '@ionic/vue';
import {
    Plugins
} from '@capacitor/core';

const {
    LocalNotifications
} = Plugins;
import AlertaMixin from '../views/mixins/alerta';
import CargandoMixin from '../views/mixins/cargando';

import {
    BackgroundMode
} from '@ionic-native/background-mode';
import {
    WebIntent
} from '@ionic-native/web-intent';
export default defineComponent({
    name: 'inicio',
    mixins: [AlertaMixin, CargandoMixin],
    components: {

        IonPage,

        Navigacion,
    },

    data() {
        return {
            modal: '',
            isOpen: false,
            titulo: 'Mi perfil',
            estado: false,
            tipo: false,
            cambio: false,
            coordenadasacutal: '',
            segundoplanonuevopedido: false,
            interval: null,
            intervalsegundoplano: null,

        }
    },

    async created() {

        console.log(this.fcm)

        this.fcm.getToken().then(token => {
            console.log('TOKEN ACTUAL: ', token);
            this.tokenfcm = token
        });

        const escucharPrimerPlano = this.fcm.onNotification().subscribe((data) => {

            console.log("Escuchando evento onNotificacion");
            console.log('AAA', data.detalles)
            if(data.detalles == 'IR') {
            this.estadoPerfil = false
            }
            else {
            if (this.pedidoactual.length == 0) {
                this.pedidoactual = JSON.parse(data.detalles)
            } else {
                this.pedidos = JSON.parse(data.detalles)
            }
            this.openModal(data.tiempo)
            }

        });

        this.fcm.onTokenRefresh().subscribe((token) => {
            console.log('NUEVO TOKEN:', token)
            this.tokenfcm = token
        });

        try {
           const payload = await this.fcm.getInitialPushPayload()
            if (payload != null) {
                if (this.pedidoactual.length == 0) {
                    this.pedidoactual = JSON.parse(payload.detalles)
                } else {
                    this.pedidos = JSON.parse(payload.detalles)
                }
                this.openModal(payload.tiempo)
            }
        } catch (e) {
            console.log(e);
            this.cuentaregresiva = 30
        }

    },

    async mounted() {

        

        /*        
        this.$soketio.on('cambiar-estado-cuando-desconecta', (data) => {
            this.estadoPerfil = false
        });

        this.$soketio.on('actualizar-estado-repartidor', (data) => {
            this.estadoPerfil = data.estado
        });
        */
       
      
   
    },

    computed: {
        cuentaregresiva: {
            get() {
                return this.$store.state.cuentaregresiva;
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
        tokenfcm: {
            get() {
                return this.$store.state.perfil.socketid;
            },
            set(value) {
                this.$store.commit("tokenfcm", value)
            }
        },
        perfil: {
            get() {
                return this.$store.state.perfil;
            },
        },
        pedidoactual: {
            get() {
                return this.$store.state.pedidoactual;
            },
            set(value) {
                this.$store.commit("setpedidoactual", value)
            }
        },
        pedidomodal: {
            get() {
                return this.$store.state.pedidoactual.length == 1 && this.$store.state.pedidos.length > 0 ? this.$store.state.pedidos[this.$store.state.pedidos.length - 1] : this.$store.state.pedidoactual[0]
            },
        },
        pedidos: {
            get() {
                return this.$store.state.pedidos;
            },
            set(value) {
                this.$store.commit("setpedidos", value)
            }
        },

    },

    methods: {
        irA(path) {
            this.$router.push(path)
        },
        async createModal(sp) {
            this.modal = await modalController.create({
                component: NuevoPedido,
                swipeToClose: false,
                mode: 'ios',
                backdropDismiss: false,
                componentProps: {
                    title: 'Nuevo pedido',
                    cerrar: () => this.closeModal(),
                    sp: sp,
                },

            })
        },

        async openModal(sp) {
            await this.createModal(sp)
            this.isOpen = true
            this.modal.present()
        },
        closeModal() {
            this.isOpen = false
            this.modal.dismiss().then(() => {
                this.modal = '';
            });
        },
        async mostrarNotificacion() {
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
        },

        async cambiarestado(estadoEs) {
            if (estadoEs) {
                this.mostrarNotificacion()
                this.estadoPerfil = estadoEs
                this.$http.post("https://app.jamuy.net/api/cambiar-estado-repartidor", {
                        estado: estadoEs,
                        socketid: this.tokenfcm
                    })
                    .then(response => {
                        console.log(response)
                    }).catch((error) => {
                        console.log(error)
                    });

            } else {

                const alert = await alertController
                    .create({
                        cssClass: 'my-custom-class',
                        header: 'Cambio de estado',
                        message: 'Si te desactivas y activas nuevamente, se te mandará al último de la cola de repartidores.',
                        buttons: [{
                                text: 'Cancelar',
                                role: 'cancel',
                                cssClass: 'secondary',
                            },
                            {
                                text: 'Desactivar',
                                handler: () => {
                                    this.estadoPerfil = estadoEs
                                    this.$http.post("https://app.jamuy.net/api/cambiar-estado-repartidor", {
                                            estado: estadoEs,
                                            socketid: this.tokenfcm
                                        })
                                        .then(async (response) => {
                                            await LocalNotifications.cancel({
                                                notifications: [{
                                                    id: 1
                                                }]
                                            });

                                        }).catch((error) => {
                                            console.log(error)
                                        });
                                }
                            },
                            {
                                text: 'Realizar mi último pedido',
                                cssClass: 'ultimo-pedido',
                                handler: () => {
                                    consosle.log(this.tokenfcm)
                                    this.$http.post("https://app.jamuy.net/api/cambiar-estado-repartidor", {
                                            estado: 5,
                                            socketid: this.tokenfcm,
                                            
                                        })
                                        .then(async (response) => {
                                            this.estadoPerfil = 5
                                        }).catch((error) => {
                                            if (error.response.status == 401) {
                                                this.abrirNotificacion("Error", error.response.data.error, 'top', 1000, 'toast-login')
                                            }
                                        });
                                }
                            },
                        ],
                    })
                return alert.present();
            }
        },

        async presentLoading() {
            const loading = await loadingController
                .create({
                    cssClass: 'my-custom-class',
                    message: 'Por favor espere...',
                    duration: 6000,
                });

            await loading.present();

            setTimeout(function () {
                loading.dismiss()
            }, 6000);
        },

    },
})
</script>
