<template>
  <div class='node_wrap' @mouseenter="showDots = true" @mouseleave="showDots = false" :style="{top:`${top}px`, left:`${left}px`, width: `${width + 2 * padding}px`, height: `${height + 2 * padding}px`}">
    <div class="node_content" 
      @mousemove="nodeMouseMove"  
      @mousedown="nodeMousedown"
      @dblclick="nodeDblClick"
      :style="{cursor}">
      <div class="hover_dot" 
        v-show="showDots"
        v-for="item in dots"
        :key="item.id"
        :style="{cursor}"
        @mouseenter="mouseEnterDot"
        @mousedown="dotMouseDown"
        @mouseleave="isInDot = false"
      >
      <!-- top:`${item.y}px`,left:`${item.x}px`, -->
      </div>
      <canvas ref="element"
        :width="width"
        :height="height"
        :id="id"
        :style="{cursor:isInContent?'move':'default'}"
      >
      </canvas>
      <div class="text_content" v-show="!isEditing">
        {{text}}
      </div>
    </div>
  </div>
</template>

<script>
import canvas from '@/utils/canvas.js'
import { ELPADDING } from '../constants/index'
  export default {
    components: {},
    props:{
        nodeInfo: {
            type: Object,
            required: true
        },
        cursor: {
          type: String,
          required: true
        }
    },
    computed: {
        id() {
          return this.nodeInfo.id
        },
        top() {
            return this.nodeInfo.top
        },
        left() {
            return this.nodeInfo.left
        },
        width() {
            return this.nodeInfo.width
        },
        height() {
            return this.nodeInfo.height
        },
        readOnly() {
          return this.nodeInfo.readOnly
        },
        text() {
            return this.nodeInfo.text
        },
        isEditing() {
          return this.nodeInfo.isEditing || false
        }
    },
    mounted() {
        this.init()
        this.initMouseEvent()
    },
    data () {
      return {
        padding: ELPADDING,
        showDots: false,
        dots: [],
        isNodeMousedown: false,
        isInContent: false,//鼠标是否在画布有内容的区域
        isInDot: false,//鼠标是否移入到圆点
        element: null,
        x: 0, //鼠标在画布元素内的x坐标
        y: 0, //鼠标在画布元素内的x坐标
      }
    },
    methods: {
        init() {
            let funName = this.nodeInfo.funName
            canvas[funName](this.$refs.element)
            this.dots = this.nodeInfo.dots
            if(!this.nodeInfo.dots) {
              this.resetDots()
            }
            this.$bus.$on('resetDots', this.resetDots)
        },
        initMouseEvent() {
          document.addEventListener('mouseup',() => {
            this.isNodeMousedown = false
          })
          document.addEventListener('mousemove', (event) => {
            if(this.isNodeMousedown) {
              this.moveNode(event)
            }
          })
        },
        moveNode(event) {
            const canvasRect = this.$parent.$refs.drawing_board.getBoundingClientRect();
            const mouseX = event.clientX - canvasRect.left - this.x;
            const mouseY = event.clientY - canvasRect.top - this.y;
            let id = this.nodeInfo.id
            this.$store.commit('board/updateNodeInfo', {id, attr: 'top', value: mouseY})
            this.$store.commit('board/updateNodeInfo', {id, attr: 'left', value: mouseX})
            this.$bus.$emit('moveSelector', {
              top: mouseY + ELPADDING,
              left: mouseX + ELPADDING
            })
        },
        resetDots() {
          let width = this.width + 2 * ELPADDING
          let height = this.height + 2 * ELPADDING
          let offset = 4
          this.dots = [
            {
              id: 1,
              x: width / 2 - offset,
              y: ELPADDING - offset
            },
            {
              id: 2,
              x: width - ELPADDING - offset,
              y: height / 2 - offset
            },
            {
              id: 3,
              x: width / 2 - offset,
              y: height - ELPADDING - offset
            },
            {
              id: 4,
              x: ELPADDING - offset,
              y: height / 2 - offset
            }
          ]
          if(this.nodeInfo.dots) {
            this.nodeInfo.dots = this.dots
          }
        },
        nodeMousedown(event) {
          let element = this.$refs.element; // 获取点击的元素
          let rect = element.getBoundingClientRect(); // 获取元素的位置和大小
          let offsetX = event.clientX - rect.left;
          let offsetY = event.clientY - rect.top;
          this.element = element
          this.x = offsetX + ELPADDING; // 计算鼠标在元素内部的横向偏移量
          this.y = offsetY + ELPADDING; // 计算鼠标在元素内部的纵向偏移量
          if(this.isInContent) this.isNodeMousedown = true
          this.nodeClick()
          this.$store.commit('node/setDragNodeInfo', this.nodeInfo);
        },
        nodeMouseMove(event) {
          let element = this.$refs.element;
          let rect = element.getBoundingClientRect(); 
          let offsetX = event.clientX - rect.left;
          let offsetY = event.clientY - rect.top;
          const ctx = this.$refs.element.getContext('2d');
          this.isInContent = ctx.isPointInPath(offsetX, offsetY);
        },
        nodeClick() {
          let { width, height, top, left, id } = this
          this.$bus.$emit('selectNodes', {
            width,
            height,
            top: top + ELPADDING,
            left: left + ELPADDING,
            id
          })
        },
        mouseEnterDot() {
          this.showDots = true;
          this.isInDot = true;
        },
        dotMouseDown(e) {
          this.stopEvent(e);
        },
        stopEvent(e) {
          e.stopPropagation();
          e.preventDefault();
        },
        nodeDblClick(e) {
          // this.stopEvent(e)
          if(!this.readOnly && this.isInContent) {
            // let width = this.width - 2 * ELPADDING
            // let height = this.height - 2 * ELPADDING
            // let value = this.nodeInfo.text
            let id = this.nodeInfo.id
            // let data = {
            //   width,
            //   height,
            //   value,
            //   id,
            //   top: this.top,
            //   left: this.left
            // }
            this.$bus.$emit('onEdit', id)
          }
        }
    },
    // beforeDestroy() {
    //   document.removeEventListener('mousemove')
    // }
  }
</script>

<style lang="scss" scoped>
  /* @import url(); 引入公共css类 */
.node_wrap {
    position: absolute;
    .node_content {
      width: 100%;
      height: 100%;
      position: relative;
      padding: 10px;
    }
    .hover_dot:nth-child(1) {
      top: 6px;
      left: calc(50% - 4px);
    }
    .hover_dot:nth-child(2) {
      top: calc(50% - 4px);
      left: calc(100% - 14px);
    }
    .hover_dot:nth-child(3) {
      top: calc(100% - 14px);
      left: calc(50% - 4px);
    }
    .hover_dot:nth-child(4) {
      top: calc(50% - 4px);
      left: calc(6px);
    }
    .hover_dot {
      position: absolute;
      width: 8px;
      height: 8px;
      border: 1px solid #067BEF;
      border-radius: 50%;
      background-color: #fff;
    }
    .text_content {
      position: absolute;
      width: 80%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: inherit;
      word-wrap: break-word;
      overflow-wrap: break-word;
      user-select: none;
      pointer-events: none;
    }
}
</style>