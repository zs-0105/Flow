import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import node from './node.js'
import board from './board.js'
export default new Vuex.Store({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    node,
    board
  }
})
