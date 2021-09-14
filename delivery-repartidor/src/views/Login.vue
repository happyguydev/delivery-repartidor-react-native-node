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

        <ion-list>

            <ion-item>
                <ion-label position="stacked">Email o celular</ion-label>
                <ion-input v-model="form.usuario" type="text"></ion-input>
            </ion-item>

            <ion-item>
                <ion-label position="stacked">Contraseña</ion-label>
                <ion-input v-model="form.clave" type="password"></ion-input>
            </ion-item>

        </ion-list>

        <ion-button @click="ingresar" color="primary" expand="block">Ingresar</ion-button>

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
    IonList,
    IonLabel,
    IonInput,
    IonItem,
    IonPage
} from '@ionic/vue';
import {
    defineComponent
} from 'vue';

import CargandoMixin from '../views/mixins/cargando';
import AlertaMixin from '../views/mixins/alerta';

export default defineComponent({
    name: 'login',
    mixins: [CargandoMixin, AlertaMixin],
    props: {
        title: {
            type: String,
            default: 'Super Modal'
        },
        cerrar: {
            type: Function
        }
    },
    data() {
        return {
            content: 'Content',
            form: {
                usuario: '',
                clave: '',
            }
        }
    },
    computed: {
        perfil: {
            get() {
                return this.$store.state.perfil;
            },
            set(value) {
                this.$store.commit("setperfil", value)
            }
        },
    },
    methods: {
        cerrarmodal() {
            this.$emit('close', {
                foo: 'bar'
            })
            this.cerrar()

        },
        ingresar() {
            this.abrirCargando('Iniciando sesión', 'my-custom-loading')
            this.$store
                .dispatch("retrieveToken", this.form)
                .then(response => {
                    this.perfil = response.data.usuario
                    this.cerrarCargando()
                    this.cerrarmodal()
                    //     this.$router.push('/inicio-repartidor')
                    window.location.href = '/inicio-repartidor'
                })
                .catch(error => {
                    this.cerrarCargando()
                    if (error.response.status == 401) {
                        this.abrirNotificacion("Error", 'Datos incorrectos.', 'top', 1000, 'toast-login')
                    }
                });

        },

    },
    components: {
        IonButton,
        IonButtons,
        IonToolbar,
        IonList,
        IonInput,
        IonLabel,
        IonItem,
        IonPage,
        IonHeader,
        IonTitle,
        IonContent
    },
});
</script>
