<template>
<ion-page>
    <ion-header>
        <ion-toolbar>
            <ion-title>
                Registrarme
            </ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content class="auth-form">

        <ion-list>

            <ion-item>
                <ion-label position="stacked">Nombres</ion-label>
                <ion-input v-model="form.nombres" type="text"></ion-input>
            </ion-item>

            <ion-item>
                <ion-label position="stacked">Apellidos</ion-label>
                <ion-input v-model="form.apellidos" type="text"></ion-input>
            </ion-item>

            <ion-item>
                <ion-label position="stacked">Email</ion-label>
                <ion-input v-model="form.email" type="email"></ion-input>
            </ion-item>

            <ion-item>
                <ion-label position="stacked">Contraseña</ion-label>
                <ion-input v-model="form.clave" type="password"></ion-input>
            </ion-item>

        </ion-list>

         <ion-button @click="registrarme" color="primary" expand="block">Registrarme</ion-button>

    </ion-content>
</ion-page>
</template>

<script>
import {
    toastController,
    IonContent,
    IonButton,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonLabel,
    IonInput,
    IonItem,
    IonPage,
    IonList,
} from '@ionic/vue';
//import { Plugins } from '@capacitor/core';
export default {
    name: 'registro',

    data() {
        return {
            titulo: 'Registro',
            contar: 0,
            form: {
                nombres: '',
                apellidos: '',
                email: '',
                clave: '',
                rol: 'repartidor',
                movil: this.$route.params.numero === undefined ? '' : this.$route.params.numero,
            }
        }
    },
    created(){
        console.log(this.$route.params.numero)
        console.log(this.$route.params)
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
      
        registrarme() {
            if(this.form.movil != "") {
                this.$store
                    .dispatch("registro", this.form)
                    .then(response => {
                        console.log(response)
                        this.perfil = response.data.usuario
                    this.$router.push({ name: 'inicio-repartidor'})
                        
                    })
                    .catch(error => {
                         console.log(error)
                    });
            }
            else {
                this.abrirnotificacion('Error', 'Hubo un error al registrar la cuenta.')
            }
        },

    },

    components: {

        IonContent,
        IonButton,
        IonToolbar,
        IonHeader,
        IonTitle,
        IonLabel,
        IonInput,
        IonItem,
        IonPage,
        IonList,
    },
}
</script>
