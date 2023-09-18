// 拖拽元素列表状态管理
import Vue from 'vue';
import canvas from '@/utils/canvas';
const board = {
    namespaced: true,
    state: {
      // 状态
        nodes: {},
        boardBkColor: '#fff',
        boardWidth: 1500,
        boardHight: 840
    },
    mutations: {
      // 修改状态的方法
      addNode(state, data) {
        Vue.set(state.nodes, data.id, data)
      },
      updateNodeInfo(state, data) {
        let { id, attr, value } = data
        state.nodes[id][attr] = value
      },
      batchUpdateNodeInfo(state, data) {
        let { ids, attr, value } = data
        for(let id of ids) {
            let nodeInfo = state.nodes[id]
            let funName = nodeInfo.funName
            let selector = '#' + id
            nodeInfo[attr] = value
            requestAnimationFrame(() => {//requestAnimationFrame防止图像闪烁
              canvas[funName](selector, nodeInfo)
            })
        }
      }
    },
    actions: {
      // 异步操作和业务逻辑
    },
    getters: {
      // 获取状态的计算属性
    }
  };
  
export default board;