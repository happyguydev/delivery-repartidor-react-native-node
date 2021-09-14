import {
    toastController
} from '@ionic/vue';
export default {
    data: () => ({
        toast: null
      }),
  methods: {
    async abrirNotificacion(titulo, mensaje, posicion, duracion, clase) {
        this.toast = await toastController
            .create({
                header: titulo,
                message: mensaje,
                position: posicion,
                duration: duracion,
                showCloseButton: true,
                cssClass: clase
            })
        return this.toast.present();
    },
    cerrarNotificacion() {
        
        this.toast.dismiss()   
     }
  }
}