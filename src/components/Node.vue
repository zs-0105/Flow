<template>
  <div class='node_wrap' @mouseenter="showDots = true" @mouseleave="showDots = false" :style="{top:`${top}px`, left:`${left}px`, width: `${width + 2 * padding}px`, height: `${height + 2 * padding}px`}">
    <div class="node_content" 
      @mousemove="nodeMouseMove"  
      @mousedown="nodeMousedown"
      @dblclick="nodeDblClick"
      @click="elClick"
      :style="{cursor:isInContent?'move':'default'}">
      <canvas ref="element"
        :width="width"
        :height="height"
        draggable="false"
      >
      </canvas>
      <div class="text_content" v-show="!isEditing">
        {{text}}
      </div>
      <div class="hover_dot" 
        v-show="showDots"
        v-for="item in dots"
        :key="item.id"
        :style="{top:`${item.y}px`,left:`${item.x}px`,cursor:isInDot?'crosshair':'default'}"
        @mouseenter="mouseEnterDot"
        @mousedown="dotMouseDown"
        @mouseleave="isInDot = false"
      >
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
    },
    computed: {
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
        editable() {
          return this.nodeInfo.editable || true
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
        offsetX: 0,//元素定位x坐标
        offsetY: 0,//元素定位y坐标
        isInContent: false,//鼠标是否在画布有内容的区域
        isInDot: false,//鼠标是否移入到圆点
        element: null,
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
            const canvasRect = this.$parent.$refs.board.getBoundingClientRect();
            const mouseX = event.clientX - canvasRect.left - this.x;
            const mouseY = event.clientY - canvasRect.top - this.y;
            let id = this.nodeInfo.id
            this.$store.commit('board/updateNodeInfo', {id, attr: 'top', value: mouseY})
            this.$store.commit('board/updateNodeInfo', {id, attr: 'left', value: mouseX})
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
          // const ctx = this.$refs.element.getContext('2d');
          // let isInContent = ctx.isPointInPath(offsetX, offsetY);
          if(this.isInContent) this.isNodeMousedown = true
        },
        nodeMouseMove(event) {
          let element = this.$refs.element;
          let rect = element.getBoundingClientRect(); 
          let offsetX = event.clientX - rect.left;
          let offsetY = event.clientY - rect.top;
          const ctx = this.$refs.element.getContext('2d');
          this.isInContent = ctx.isPointInPath(offsetX, offsetY);
        },
        elClick() {
      
        },
        mouseEnterDot() {
          this.showDots = true
          this.isInDot = true;
        },
        dotMouseDown(e) {
          this.stopEvent(e)
        },
        stopEvent(e) {
          e.stopPropagation()
          e.preventDefault();
        },
        nodeDblClick(e) {
          this.stopEvent(e)
          if(this.editable && this.isInContent) {
            this.isEdit = true
            let width = this.width - 2 * ELPADDING
            let height = this.height - 2 * ELPADDING
            let value = this.nodeInfo.text
            let id = this.nodeInfo.id
            let data = {
              width,
              height,
              value,
              id,
              top: this.top,
              left: this.left
            }
            this.$bus.$emit('onEdit', data)
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
    }
}
</style>