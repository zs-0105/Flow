import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import nodes from './nodes.js'
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
    nodes,
    board
  }
})
