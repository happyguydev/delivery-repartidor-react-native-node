import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Inicio from '../views/Inicio.vue';
import InicioRepartidor from '../views/InicioRepartidor.vue';
import Login from '../views/Login.vue';
import Registro from '../views/Registro.vue';
import ValidarNumero from '../views/ValidarNumero.vue';
import RegistroFinal from '../views/RegistroFinal.vue';
import NuevoPedido from '../views/NuevoPedido.vue';
import NuevoPedido2 from '../views/NuevoPedido2.vue';
import NuevoPedido3 from '../views/NuevoPedido3.vue';
import NuevoPedido4 from '../views/NuevoPedido4.vue';
import NuevoPedido5 from '../views/NuevoPedido5.vue';
import PedidosEspera from '../views/PedidosEspera.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/inicio',
  },
  
  {
    path: '/inicio',
    name: 'inicio',
    component: Inicio,
    meta: { requiereAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiereAuth: false }
  },
  {
    path: '/registro',
    name: 'registro',
    component: Registro,
    meta: { requiereAuth: false }
  },
  {
    path: '/nuevo-pedido',
    name: 'nuevo-pedido',
    component: NuevoPedido,
    props: true,
    meta: { requiereAuth: true }
  },
  {
    path: '/nuevo-pedido/paso-2',
    name: 'nuevo-pedido-paso-dos',
    component: NuevoPedido2,
    props: true,
    meta: { requiereAuth: true }
  },
  {
    path: '/nuevo-pedido/paso-3',
    name: 'nuevo-pedido-paso-tres',
    component: NuevoPedido3,
    props: true,
    meta: { requiereAuth: true }
  },
  
  {
    path: '/nuevo-pedido/paso-4',
    name: 'nuevo-pedido-paso-cuatro',
    component: NuevoPedido4,
    props: true,
    meta: { requiereAuth: true }
  },
  {
    path: '/nuevo-pedido/paso-5',
    name: 'nuevo-pedido-paso-cinco',
    component: NuevoPedido5,
    props: true,
    meta: { requiereAuth: true }
  },
  {
    path: '/pedidos-en-espera',
    name: 'pedidos-en-espera',
    component: PedidosEspera,
    props: true,
    meta: { requiereAuth: true }
  },
  {
    path: "/validarnumero", 
    name:"validarnumero", 
    component: ValidarNumero,  
    props: true,
    meta: { requiereAuth: false }
  },
  {
    path: "/registrofinal", 
    name:"registrofinal", 
    component: RegistroFinal,  
    props: true,
    meta: { requiereAuth: false }
  },
  {
    path: "/inicio-repartidor", 
    name:"inicio-repartidor", 
    component: InicioRepartidor,  
    meta: { requiereAuth: true }
  }
  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
