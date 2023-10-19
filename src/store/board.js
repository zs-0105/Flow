// 拖拽元素列表状态管理
import Vue from 'vue';
import canvas from '@/utils/canvas';
const board = {
    namespaced: true,
    state: {
      // 状态
        nodes: {},
        links: {},
        boardBkColor: '#fff',
        boardWidth: 1500,
        boardHight: 840,
        selectedNodesMap:{},
        isNodeMouseDown: false
    },
    mutations: {
      // 修改状态的方法
      addNode(state, data) {
        Vue.set(state.nodes, data.id, data)
      },
      updateNodeInfo(state, data) {
        let { id } = data
        // state.nodes[id][attr] = value
        let nodeInfo = state.nodes[id]
        let funName = nodeInfo.funName
        let selector = '#' + id
        // nodeInfo[attr] = value
        Object.assign(nodeInfo, data)
        // if(refresh) {
          requestAnimationFrame(() => {//requestAnimationFrame防止图像闪烁
            canvas[funName](selector, nodeInfo)
          })
      },
      updateSelectedNodesMap(state, data) {
        // for(let id in data) {
        //   Vue.set(state.selectedNodesMap, id, true)
        // }
        state.selectedNodesMap = data
      },
      resetSelectedNodesMap(state) {
        state.selectedNodesMap = {}
      },
      setNodeMouseDown(state) {
        state.isNodeMouseDown = true
      },
      resetNodeMouseDown(state) {
        state.isNodeMouseDown = false
      },
      addLink(state, data) {
        Vue.set(state.links, data.id, data)
      },
      updateLinkInfo(state, data) {
        let { id } = data
        let linkInfo = state.links[id]
        Object.assign(linkInfo, data)
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