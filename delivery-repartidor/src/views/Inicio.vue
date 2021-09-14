<template>
<ion-page>
    <ion-header>
        <ion-toolbar>
            <ion-title>
                Jamuy
            </ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content class="auth-form">
        {{ direccioncliente }}
        <ion-grid>
            <ion-row>
                <ion-col align-self-center>
                    <ion-button @click="irA('/registro')" expand="block" color="primary">Registrarme</ion-button>

                    <span class="divider line one-line">o</span>

                    <span class="already">¿Tienes una cuenta?</span>

                    <ion-button @click="openModal" expand="block" color="danger">Iniciar sesión</ion-button>
                </ion-col>
            </ion-row>
        </ion-grid>

    </ion-content>

</ion-page>
</template>

<script>
import {
    IonContent,
    modalController,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonButton,
    IonCol,
    IonRow,
    IonGrid,
    IonPage
} from '@ionic/vue';
import Login from '../views/Login.vue';
import {
    LaunchNavigator
} from '@ionic-native/launch-navigator';
import {
    Plugins
} from '@capacitor/core';
import {
    NativeGeocoder,
} from '@ionic-native/native-geocoder';
export default {
    name: 'inicio',
    components: {

        IonContent,
        IonTitle,
        IonToolbar,
        IonHeader,
        IonButton,
        IonCol,
        IonRow,
        IonGrid,
        IonPage
    },
    data() {
        return {
            modal: '',
            isOpen: false,
            coordenadasacutal: '',
            direccioncliente: '',
        }
    },


    methods: {
        /*
        async coordenadascliente() {
            const nativeGeocoder = NativeGeocoder;
             await nativeGeocoder.reverseGeocode(-12.0495758,-77.0540631, {
                    useLocale: true,
                    maxResults: 5
                })
                .then((result) => { this.direccioncliente = JSON.stringify(result[0]) })
                .catch((error) => { this.direccioncliente = error });
        },
        */
        async navegar() {
            await this.obtenerPosicionActual()

            let coordenadas = this.obtenerCoordenadasdesdeURL("https://www.google.com/maps/place/El+Campo+de+Marte/@-12.0683259,-77.0435737,17z/data=!3m1!4b1!4m5!3m4!1s0x9105c8e921adc161:0x91a518942d5e9270!8m2!3d-12.0683312!4d-77.041385")
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
        async obtenerPosicionActual() {
            const {
                Geolocation
            } = Plugins;
            const opciones = {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 0
            };
            await Geolocation.getCurrentPosition(opciones).then((resp) => {
                console.log(resp.coords.latitude)
                console.log(resp.coords.longitude)
                this.coordenadasacutal = resp.coords.latitude + ',' + resp.coords.longitude
            }).catch((error) => {
                console.log('Error al obtener la locación', error);
            });

        },
        obtenerCoordenadasdesdeURL(url) {
            const regex = /@(.*),/g;
            const match = regex.exec(url)
            if (match !== undefined)
                return match[1]

        },
        async createModal() {
            this.modal = await modalController.create({
                component: Login,
                swipeToClose: true,
                mode: 'ios',
                backdropDismiss: true,
                componentProps: {
                    title: 'Iniciar sesión',
                    cerrar: () => this.closeModal()
                },

            })
        },
        async openModal() {
            await this.createModal()
            this.isOpen = true
            this.modal.present()
        },
        closeModal() {
            this.isOpen = false
            this.modal.dismiss().then(() => {
                this.modal = null;
            });
        },
        irA(path) {
            this.$router.push(path)
        }
    },
}
</script>
