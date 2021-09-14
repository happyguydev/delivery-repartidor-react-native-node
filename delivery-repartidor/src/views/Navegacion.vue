<template>
<ion-page>
    <ion-header translucent>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button default-href="/"></ion-back-button>
            </ion-buttons>
            <ion-title>{{ titulo }}</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
          <slot></slot>
    </ion-content>
</ion-page>
</template>

<script>
import {
    IonTitle,
    IonBackButton,
    IonContent,
    IonButtons,
    IonToolbar,
    IonHeader,
    IonPage
} from '@ionic/vue';
import {
    defineComponent
} from 'vue';

export default defineComponent({
    date() {
        return {
            enlaces: [],
        }
    },
    props: {
        titulo: { type: String}
    },
    components: {
        IonTitle,
        IonHeader,
        IonBackButton,
        IonContent,
        IonButtons,
        IonToolbar,
        IonPage
    }
});
</script>
