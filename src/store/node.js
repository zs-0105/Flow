/*
 * @Description: 
 * @Author: zs
 * @Date: 2023-06-13 18:02:09
 * @LastEditTime: 2024-12-06 16:41:25
 * @LastEditors: zs
 */
// 拖拽元素列表状态管理
const node = {
    namespaced: true,
    state: {
      // 状态
      isElMouseDown: false,
      dragElInfo: {
        name: '', //节点英文名称
        funName: '', //节点对应绘制方法名称
        cname: '', //节点中文名称
        width: 0, //节点宽度
        height: 0,  //节点高度
        top: 0, // 节点相对画布(drawing_board_content)定位top值
        left: 0, // 节点相对画布(drawing_board_content)定位left值
        text: "", // 节点输入的文字
        index: 1, // 节点z-index
        id: "", //  唯一标识也是元素id
        /**
         * @description: inLinks
         * @itemType: Object
         * @item: {
         *    id: linkId
         *    offsetX: link与node连接点相对于node的x偏移量
         *    offsetX: link与node连接点相对于node的y偏移量
         * }
         * @Date: 2024-09-04 22:54:22
         */        
        inLinks: [], // 指向并连该节点的link
        outLinks: [], // 从该节点绘制出的link
      },
    },
    mutations: {
      // 元素列表keyDown
      setIsElMouseDown(state, data) {
        state.isElMouseDown = data
      },
      // 拖拽元素列表元素或画布中节点信息
      setDragNodeInfo(state, data) {
        let defaultInfo = {
          name: '',
          funName: '',
          cname: '',
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          text: "",
          index: 1,
          id: "",    
          inLinks: [],
          outLinks: [],
        }
        state.dragElInfo = Object.assign(defaultInfo, data)//{ ...state.dragElInfo,  ...data } 
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