import {
    loadingController
} from '@ionic/vue';
export default {
    data: () => ({
        loading: null
      }),
  methods: {
    async abrirCargando(mensaje,clase) { 
        this.loading = await loadingController
        .create({
          spinner: 'circles',
          duration: 0,
          message: mensaje,
          translucent: true,
          cssClass: clase,
          backdropDismiss: false,
          mode: 'ios',
          animated: true,
          keyboardClose: false
        });

      await this.loading.present();
     },
    cerrarCargando() {
            this.loading.dismiss()
        
      
     }
  }
}