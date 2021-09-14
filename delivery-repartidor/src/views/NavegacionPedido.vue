<template>
<ion-page>
    <ion-header translucent>
        <ion-toolbar class="w-full sm:w-5/12 mx-auto">
                 <ion-title class="font-semibold text-2xl py-3"><span class="mr-4"><i class="fas fa-motorcycle"></i></span>{{ titulo }}</ion-title>
           
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
    IonContent,
  
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
        IonContent,
        IonToolbar,
        IonPage
    }
});
</script>
