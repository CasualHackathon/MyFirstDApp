import { createStore } from 'vuex'

export default createStore({
  state: {
    currentUser: null,
    currentAddress: null,
    isLoggedIn: false
  },
  mutations: {
    setUser(state, user) {
      state.currentUser = user.username
      state.currentAddress = user.address
      state.isLoggedIn = true
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('currentUser', JSON.stringify(user))
    },
    logout(state) {
      state.currentUser = null
      state.currentAddress = null
      state.isLoggedIn = false
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('currentUser')
    }
  }
})
