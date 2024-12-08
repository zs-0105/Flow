<template>
  <div class="flow_container">
    <div class="flow_top_tool_bar">
      <top-tool-bar></top-tool-bar>
    </div>
    <div class='flow_main' @mousemove="mousemove">
      <split-pane split="vertical" :default-percent="10" :min-percent="5">
        <template slot="paneL">
          <!-- 拖拽元素列表 -->
            <elements-list :isElMouseDown="isElMouseDown" @setIsElMouseDown="setIsElMouseDown" @setDragNodeInfo="setDragNodeInfo"></elements-list>
        </template>
        <template slot="paneR">
            <drawing-board ref="board" @setDragNodeInfo="setDragNodeInfo"></drawing-board>
        </template>
      </split-pane>
    </div>
    <canvas @mousemove="mousemove" @mouseup="mouseup" ref='dragCnavas' class="dragCnavas" v-show="showDragEl"></canvas>
  </div>
</template>

<script>
import TopToolBar from '@/components/TopToolBar.vue'
import SplitPane from 'vue-splitpane'
import ElementsList from '@/components/ElementsList.vue'
import DrawingBoard from '@/components/DrawingBoard.vue'
import canvas from '@/utils/canvas.js'
  export default {
    components: {
      SplitPane,
      TopToolBar,
      ElementsList,
      DrawingBoard
    },
    mounted() {
      document.addEventListener('dragstart', (event) => {
        event.preventDefault();//阻止默认禁用光标的出现
      });
    },
    computed: {
    },
    data () {
      return {
        showDragEl: false,
        animationFrameId: null,
        // move
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
      }
    },
    methods: {
      mousemove(event) {
        if(this.isElMouseDown) {
          if(!this.showDragEl) {
            this.showDragEl = true
            canvas[this.dragElInfo.funName]('.dragCnavas')
          }
          if(this.animationFrameId) cancelAnimationFrame(this.animationFrameId)
          this.animationFrameId = requestAnimationFrame(() => {
            this.$refs.dragCnavas.style.top = event.clientY - this.$refs.dragCnavas.clientWidth / 2 + 'px'
            this.$refs.dragCnavas.style.left = event.clientX - this.$refs.dragCnavas.clientHeight / 2 + 'px'
          });
        }
      },
      mouseup(event) {
        if(this.showDragEl) {
          let isContained = this.isElementOverlapping(this.$refs.board.$refs.paneR, this.$refs.dragCnavas)
          if(isContained) {
            // 添加元素
            this.$bus.$emit('createElement', this.dragElInfo, this.$refs.dragCnavas, event)
          }
          this.dragElInfo = {}
          this.isElMouseDown = false
          this.showDragEl = false
        }
      },
      isElementOverlapping(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        // 判断横向重叠和纵向重叠
        const isHorizontalOverlap = rect1.left < rect2.left + rect2.width && rect1.left + rect1.width > rect2.left;
        const isVerticalOverlap = rect1.top < rect2.top + rect2.height && rect1.top + rect1.height > rect2.top;

        // 判断是否重叠
        return isHorizontalOverlap && isVerticalOverlap;
      },
      setIsElMouseDown(data) {
        this.isElMouseDown = data
      },
      setDragNodeInfo(data) {
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
        this.dragElInfo = Object.assign(defaultInfo, data)
      }
    },
  }
</script>

<style scoped>
  /* @import url(); 引入公共css类 */
.flow_container {
    width: 100%;
    height: 100%;
}
.flow_top_tool_bar {
  width: 100%;
  height: 40px;
}
.flow_main {
  width: 100%;
  height: calc(100% - 40px);
  border: 1px solid #ccc;
}
.flow_canvas_info {
  width: 100%;
  height: 100%;
}
.dragCnavas {
  position: absolute;
  z-index: 99;
}
</style>