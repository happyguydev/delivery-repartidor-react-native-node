import { createStore } from "vuex";
const repartidores = window.localStorage.getItem('repartidores');
const perfil = window.localStorage.getItem('perfil');
const pedidoactual = window.localStorage.getItem('pedidoactual');
const pedidos = window.localStorage.getItem('pedidos');
const token = window.localStorage.getItem('token');

export const store = createStore({
  state: {
      token: token,
      repartidores: repartidores ? JSON.parse(repartidores) : [],
      pedidoactual: pedidoactual ? JSON.parse(pedidoactual) : [],
      pedidos: pedidos ? JSON.parse(pedidos) : [],
      cuentaregresiva: localStorage.getItem('cuentaregresiva') ? localStorage.getItem('cuentaregresiva') : 30,
      perfil: perfil ? JSON.parse(perfil) : { estado: false, socketid: '', usuario:  '' }
    },
  getters: {
    loggedIn(state) {
      return state.token !== null
    },
    Whattoken(state) {
      return state.token
    },
    StatusActual(state) {
      return state.pedidoactual.length > 0 ? state.pedidoactual[0].estado : null
    },

  },
  mutations: {
    setestadoperfil(state, data) {
      state.perfil.estado = data
      window.localStorage.setItem('perfil', JSON.stringify(state.perfil));
    },
    tokenfcm(state, data) {
      state.perfil.socketid =  data
      window.localStorage.setItem('perfil', JSON.stringify(state.perfil));
    },
    setsocketid(state, data) {
      state.perfil.socketid = data
      window.localStorage.setItem('perfil', JSON.stringify(state.perfil));
    },
    setcuentaregresiva(state, data) {
      console.log(data)
      state.cuentaregresiva = data
      localStorage.setItem('cuentaregresiva', data)
    },

    setperfil(state, data) {
      console.log(data)
      state.perfil.usuario = data
      window.localStorage.setItem('perfil', JSON.stringify(state.perfil));
    },
    setpedidoactual(state,data) {
      state.pedidoactual.push(data)
      window.localStorage.setItem('pedidoactual', JSON.stringify(state.pedidoactual));
    },
    setpedidoactuald(state,data) {
      state.pedidoactual = data
      window.localStorage.setItem('pedidoactual', JSON.stringify(state.pedidoactual));
    },
    setestadopedido(state,data) {
      state.pedidoactual[0].estado = data
      window.localStorage.setItem('pedidoactual', JSON.stringify(state.pedidoactual));
    },
    setpedidos(state,data) {
      state.pedidos.push(data)
      window.localStorage.setItem('pedidos', JSON.stringify(state.pedidos));
    },
    seteliminarpedido(state,data) {
      const index = state.pedidos.findIndex(r => r._id == data._id);
      state.pedidos.splice(index, 1);

      window.localStorage.setItem('pedidos', JSON.stringify(state.pedidos));
    },
    retrieveToken(state, token) {
      state.token = token
    },
    destroyToken(state) {
      state.token = null
    }
  },
  actions: {
    retrieveToken(context, credentials) {

      return new Promise((resolve, reject) => {
        window.axios.post('https://app.jamuy.net/api/auth/ingresar',  credentials )
          .then(response => {
            console.log(response.data.token)
            const token = response.data.token
            localStorage.setItem('token', token)
            context.commit('retrieveToken', token)
            window.axios.defaults.headers.common['Authorization'] = context.state.token;
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })

    },
    registro(context, credentials) {

      return new Promise((resolve, reject) => {
        window.axios.post('https://app.jamuy.net/api/auth/registro',  credentials )
          .then(response => {
            const token = response.data.token
            window.localStorage.setItem('token', token)
            context.commit('retrieveToken', token)
            window.axios.defaults.headers.common['Authorization'] = context.state.token;
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })

    },
    CambiarEstadoRepartidor(context, data) {
      console.log(data)
      return new Promise((resolve, reject) => {
      window.axios.post("https://app.jamuy.net/api/cambiar-estado-repartidor", data, {
        headers: {
          Authorization: context.state.token
        }
       })
      .then(response => {
        resolve(response)
      })
      .catch(error => {
        reject(error)
      })
    })
    },
    destroyToken(context) {
      
      if (context.getters.loggedIn){
        
        return new Promise((resolve, reject) => {
          window.axios.post('https://app.jamuy.net/api/auth/salir', '', {
              headers: { Authorization: "Bearer " + context.state.token }
            })
            .then(response => {
              localStorage.removeItem('token')
              context.commit('destroyToken')
              resolve(response)
            })
            .catch(error => {
              localStorage.removeItem('token')
              context.commit('destroyToken')

              reject(error)
            })
        })

      }
    }
  }
});

