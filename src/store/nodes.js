// 拖拽元素列表状态管理
const nodes = {
    namespaced: true,
    state: {
      // 状态
      isElMouseDown: false,
      dragElInfo: '',
    },
    mutations: {
      // 修改状态的方法
      setIsElMouseDown(state, data) {
        state.isElMouseDown = data
      },
      setdragElInfo(state, data) {
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
  
export default nodes;