<template>
<ion-page>
    <Navigacion :titulo="titulo">
        <template v-slot:default>

            <div class="titulo-login">Introduce tu código enviado al:</div>
            <div class="numero-por-validar">{{ $route.params.numero }}</div>

            <div class="div-externo-validar-numero">
                <div class="div-interno-validar-numero">
                    <ion-input class="input-particionado" v-model="codigo" maxlength="4" @keypress="isNumber($event)" type="text" placeholder="1234"></ion-input>
                </div>
            </div>
            
            <ion-button :disabled="contar!=4" @click="validarCodigo" color="primary" expand="block">Siguiente</ion-button>
        </template>
    </Navigacion>
</ion-page>
</template>

<script>
import {
    toastController,
    IonPage,
    //IonLabel,
    IonInput,
    IonButton,
    //IonItem,
} from '@ionic/vue';
import Navigacion from '../views/Navegacion.vue';
//import { Plugins } from '@capacitor/core';
export default {
    name: 'registro',

    data() {
        return {
            titulo: 'Registro',
            numeroCelular: null,
            contar: 0,
            codigo: '',
        }
    },
    watch: {
        codigo: function (val) {
            this.contar = val.length
            if(this.contar == 4)
                this.validarCodigo()
        }

    },

    methods: {
        async abrirnotificacion() {
            const toast = await toastController
                .create({
                    header: 'Código incorrecto',
                    message: 'El código ingresado no es válido.',
                    position: 'top',
                    duration: 1500,
                    showCloseButton: true,
                    cssClass: 'toast-login'
                })
            return toast.present();
        },
        isNumber: function (evt) {
            //console.log(evt.target.value.length)
            evt = (evt) ? evt : window.event;
            
            const charCode = (evt.which) ? evt.which : evt.keyCode;
            if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
                evt.preventDefault();
            }
            else {
                return true;
            }
        },
        validarCodigo() {
            this.$http.get("https://app.jamuy.net/api/validarnumero/" + this.$route.params.numero + '/' + this.codigo)
                .then((response) => {
                    if (response.data == null) {
                        this.abrirnotificacion()
                    } else {
                        this.$router.push({
                            name: 'registrofinal',
                            params: {
                                numero: this.$route.params.numero
                            }
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                });
        },

    },

    components: {

        Navigacion,
        IonPage,
        //IonLabel,
        IonInput,
        IonButton,
        //IonItem,
    },
}
</script>
