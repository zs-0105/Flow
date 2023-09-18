// 拖拽元素列表状态管理
const node = {
    namespaced: true,
    state: {
      // 状态
      isElMouseDown: false,
      dragElInfo: '',
    },
    mutations: {
      // 元素列表keyDown
      setIsElMouseDown(state, data) {
        state.isElMouseDown = data
      },
      // 拖拽元素列表元素或画布中节点信息
      setDragNodeInfo(state, data) {
        state.dragElInfo = data
      },
    },
    actions: {
      // 异步操作和业务逻辑
    },
    getters: {
      // 获取状态的计算属性
    }
  };
  
export default node;