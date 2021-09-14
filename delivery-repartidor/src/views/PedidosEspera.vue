
    <template>
<ion-page>
    <Navegacion :titulo="titulo">
        <template v-slot:default>
            <section class="px-3 py-1">
        <div class="w-full sm:w-5/12 mx-auto">
            <a href="#" class="block bg-blue-200 text-center font-semibold py-2 px-2 rounded-full mb-4">
                <span>{{ pedidos.length == 1 ? pedidos.length + ' pedido' : pedidos.length + ' pedidos' }} en espera</span>
            </a>            
        </div>
        <div class="w-full sm:w-5/12 mx-auto">                 
            <a @click="abrirPedido(pedido)" href="javascript:void(0);" class="block mb-3 py-1 px-3 rounded-lg shadow border border-gray-100" v-for="(pedido, index) in pedidos" v-bind:key="index">
                <span class="mr-2 text-blue-500"><i class="fas fa-store"></i></span><span class="font-bold text-xl">{{ pedido.nombre_tienda }}</span><br>                
                <span class="mr-2 text-blue-500">●</span><span>Recoge en: </span><span class="font-semibold">Abrir mapa tienda</span><br>                
                <span class="mr-2 text-blue-500">●</span><span>Entrega en: </span><span class="font-semibold">Abrir mapa cliente</span><br>                
                <span class="mr-2 text-blue-500">●</span><span class="font-semibold text-blue-500">En espera</span><br>
                <div class="flex justify-between items-end">
                    <div><span class="text-xs text-gray-600">Generado a las {{ pedido.createdAt}}</span></div>
                    <div class="text-right text-lg font-bold"><span>S/</span><span>{{ pedido.monto_delivery }}</span></div>
                </div>
            </a>           
        </div>
    </section>
        </template>
    </Navegacion>
</ion-page>
</template>

<script>
import {
    IonPage,

} from '@ionic/vue';
import Navegacion from '../views/Navegacion';
import {
    LaunchNavigator
} from '@ionic-native/launch-navigator';
//import { Plugins } from '@capacitor/core';
export default {
    name: 'pedidos-en-espera',

    data() {
        return {
            titulo: 'Pedido en espera',
            t: 0,
        }
    },
    computed: {
        pedidosactual: {
            get() {
                return this.$store.state.pedidoactual;
            },
            set(value) {
                this.$store.commit("setpedidoactual", value)
            }
        },
        pedidos: {
            get() {
                return this.$store.state.pedidos;
            },
            set(value) {
                if(this.t == 1) {
                    this.$store.commit("seteliminarpedido", value)
                }
                else {
                    this.$store.commit("setpedidos", value)
                }
            }
        },
    },
    methods: {
        abrirPedido(pedido) {
            this.pedidosactual  = pedido
            this.t = 1
            this.pedidos = pedido
            this.$router.push({
                        name: 'nuevo-pedido-paso-dos'
            })
            


        },
    },

    components: {

        Navegacion,
        IonPage,

    },
}
</script>
