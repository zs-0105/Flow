<template>
  <div class="flow_container">
    <div class="flow_top_tool_bar">
      <top-tool-bar></top-tool-bar>
    </div>
    <div class='flow_main' @mousemove="mousemove">
      <split-pane split="vertical" :default-percent="10" :min-percent="5">
        <template slot="paneL">
          <!-- 拖拽元素列表 -->
            <elements-list></elements-list>
        </template>
        <template slot="paneR">
            <drawing-board ref="board"></drawing-board>
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
import { mapState } from 'vuex';
  export default {
    components: {
      SplitPane,
      TopToolBar,
      ElementsList,
      DrawingBoard
    },
    mounted() {
    },
    computed: {
      ...mapState('nodes', ['isElMouseDown','dragElInfo'])
    },
    data () {
      return {
        showDragEl: false
      }
    },
    methods: {
      mousemove(event) {
        if(this.isElMouseDown) {
          if(!this.showDragEl) {
            this.showDragEl = true
            canvas[this.dragElInfo.funName]('.dragCnavas')
          }
          requestAnimationFrame(() => {
            this.$refs.dragCnavas.style.top = event.clientY - this.$refs.dragCnavas.height / 2 + 'px'
            this.$refs.dragCnavas.style.left = event.clientX - this.$refs.dragCnavas.width / 2 + 'px'
          });
        }
      },
      mouseup(event) {
        if(this.showDragEl) {
          let isContained = this.isElementOverlapping(this.$refs.board.$refs.paneR, this.$refs.dragCnavas)
          if(isContained) {
            // 添加元素
            this.$bus.$emit('creatElement', this.dragElInfo, this.$refs.dragCnavas, event)
          }
          this.$store.commit('nodes/setIsElMouseDown', false);
          this.$store.commit('nodes/setdragElInfo', '');
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