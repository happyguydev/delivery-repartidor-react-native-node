import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue'; 
import './assets/styles/tailwind.css';

import '@ionic/core/css/ionic.bundle.css';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import axios from 'axios'
import VueAxios from 'vue-axios'
import { store } from "./store";
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic";

/*
import {
  io
} from 'socket.io-client';
*/

/* Theme variables */
import './theme/variables.css';

declare global {
  interface Window {
    axios: any;
 
  }
}
  
const app = createApp(App)
  .use(IonicVue)
  .use(VueAxios, axios)
  .use(store)
  .use(router);

  /*
  app.config.globalProperties.$soketio =  io("https://app.jamuy.net", {
    path: '/stomp',
    secure: true,
    
  });
*/
  app.config.globalProperties.fcm =  FCM;

  window.axios = require('axios');

  window.axios.interceptors.request.use(
    (request) => {
      const token = store.getters.Whattoken;
	if(token) {
		request.headers.Authorization = token;
	}
      return request;
    }
  );

  //window.axios.defaults.headers.common['Authorization'] = store.getters.Whattoken;

  window.axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'
  window.axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

  router.beforeEach(async (to, from, next) => {

    console.log('ESTADO',store.getters.StatusActual)

    if (to.name !== 'nuevo-pedido-paso-dos' && store.getters.StatusActual!== null && store.getters.StatusActual == 'en curso' ) next({ name: 'nuevo-pedido-paso-dos' })

    if (to.name !== 'nuevo-pedido-paso-dos' && store.getters.StatusActual!== null && store.getters.StatusActual == 'repartidor asignado' ) next({ name: 'nuevo-pedido-paso-dos' })

    if (to.name !== 'nuevo-pedido-paso-tres' &&  store.getters.StatusActual!== null && store.getters.StatusActual == 'llegue a tienda' ) next({ name: 'nuevo-pedido-paso-tres' })
  
    if (to.name !== 'nuevo-pedido-paso-cuatro' &&  store.getters.StatusActual!== null && store.getters.StatusActual == 'tengo el pedido' ) next({ name: 'nuevo-pedido-paso-cuatro' })
  
    if (to.name !== 'nuevo-pedido-paso-cinco' &&  store.getters.StatusActual!== null && store.getters.StatusActual == 'llegue al destino' ) next({ name: 'nuevo-pedido-paso-cinco' })
  
  if ((to.name=== 'inicio' || to.name === 'login' || to.name === 'registro') && store.getters.loggedIn) next({ name: 'inicio-repartidor' })


  if (to.matched.some(record => record.meta.requiereAuth)) {
    
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!store.getters.loggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
    else {  
     next()
    }
  } else {
    next() // make sure to always call next()!
  }
})
  
  
router.isReady().then(() => {
  app.mount('#app');
});

