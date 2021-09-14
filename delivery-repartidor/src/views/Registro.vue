<template>
<ion-page>
    <Navigacion :titulo="titulo">
        <template v-slot:default>

            <div class="titulo-login">Ingresa a Jamuy con tu número de celular</div>

            <ion-item>
                <ion-label position="stacked">Número de celular</ion-label>
                <ion-input v-model="numeroCelular" minlength="7" type="number" placeholder="998553098"></ion-input>
            </ion-item>

            <ion-button @click="obtenerSMS" color="primary" expand="block">Siguiente</ion-button>
        </template>
    </Navigacion>
</ion-page>
</template>

<script>
import {
    toastController,
    IonPage,
    IonLabel,
    IonInput,
    IonButton,
    IonItem,
} from '@ionic/vue';
import Navigacion from '../views/Navegacion.vue';
//import { Plugins } from '@capacitor/core';
export default {
    name: 'registro',

    data() {
        return {
            titulo: 'Registro',
            numeroCelular: null,
        }
    },
    methods: {
        async abrirnotificacion(titulo, mensaje) {
            const toast = await toastController
                .create({
                    header: titulo,
                    message: mensaje,
                    position: 'top',
                    duration: 1500,
                    showCloseButton: true,
                    cssClass: 'toast-login'
                })
            return toast.present();
        },
        async obtenerSMS() {
            /*
            const {
                LocalNotifications
            } = Plugins;
            const canSend = await LocalNotifications.requestPermission();
            if (canSend) {
                await LocalNotifications.schedule({
                    notifications: [{
                        title: "Una notificación de Jamuy",
                        body: "Iniciando en el mundo de las apps ja ja.",
                        id: 1,
                        schedule: {
                            at: new Date(Date.now() + 1000 * 1)
                        },
                        actionTypeId: "",
                        extra: null
                    }]
                });
            }
            */

            this.$http.get("https://app.jamuy.net/api/verificarnumero/" + this.numeroCelular)
                .then((response) => {

                    if (response.data.status == 422) {
                        this.abrirnotificacion('Celular inválido', 'El número ingresado no es correcto.')
                    } else if (response.data.status == 201) {
                        this.abrirnotificacion('Mensaje enviado', 'Te hemos enviado un SMS de confirmación')
                        this.$router.push({ name: 'validarnumero', params: { numero: this.numeroCelular }})
                    }
                    
                })
                .catch((error) => {
                    if(error.response.status == 409) {
                        this.abrirnotificacion('Celular ya registrado', 'El número ingresado ya se encuentra registrado.') 
                    }
                });

        },
    },

    components: {

        Navigacion,
        IonPage,
        IonLabel,
        IonInput,
        IonButton,
        IonItem,
    },
}
</script>
