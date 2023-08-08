// 拖拽元素列表状态管理
import Vue from 'vue';
const board = {
    namespaced: true,
    state: {
      // 状态
        elements: {},
        boardBkColor: '#fff',
        boardWidth: 1500,
        boardHight: 840
    },
    mutations: {
      // 修改状态的方法
      addElement(state, data) {
        Vue.set(state.elements, data.id, data)
      },
      updateElInfo(state, data) {
        let {id, attr, value} = data
        state.elements[id][attr] = value
      },
    },
    actions: {
      // 异步操作和业务逻辑
    },
    getters: {
      // 获取状态的计算属性
    }
  };
  
export default board;