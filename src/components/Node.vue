<template>
  <div class='node_wrap' :style="{top:`${top}px`, left:`${left}px`, width: `${width}px`, height: `${height}px`}">
    <div class="node_content" 
      @mousemove="nodeMouseMove"
      @mousedown="nodeMousedown"
      @mouseleave="nodeMouseleave"
      @dblclick="nodeDblClick"
      :style="{cursor}">
      <div class="hover_dot"
        v-show="isInContent || isOnBorder"
        v-for="item in dots"
        :key="item.id"
        @mousedown="dotMouseDown"
        @mouseenter="isOnHoverDot = true"
        @mouseleave="isOnHoverDot = false"
      >
      <!-- top:`${item.y}px`,left:`${item.x}px`, -->
      </div>
      <canvas ref="element"
        class="node"
        :id="id"
        :style="{cursor:canvasCursor}"
      >
      </canvas>
      <div class="text_content" v-show="!isEditing">
        {{text}}
      </div>
      <div class="red_dot" :style="{top:redDotY,left:redDotX}" v-show="showRedDot"></div>
    </div>
  </div>
</template>

<script>
import canvas from '@/utils/canvas.js'
import { mapState } from 'vuex'
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
        },
        isEditing: {
          type: Boolean,
          default: false
        }
    },
    computed: {
        ...mapState('board', ['selectedNodesMap']),
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
        isSelected() {
          return this.selectedNodesMap[this.id]
        },
        canvasCursor() {
          if(this.isOnBorder && !this.isSelected){
            return 'crosshair'
          }else if(this.isOnBorder && this.isSelected) {
            return 'move'
          }else if(this.isInContent) {
            return 'move'
          }else {
            return 'default'
          }
        },
        showRedDot() {
          if(this.isOnBorder && !this.isSelected && !this.isOnHoverDot) {
            return true
          }else {
            return false
          }
        }
    },
    mounted() {
        this.init()
        // this.initMouseEvent()
    },
    data () {
      return {
        dots: [],
        isNodeMousedown: false,
        isInContent: false,//鼠标是否在画布有内容的区域
        isOnBorder: false, //鼠标是否在边框线上
        redDotX: '0px',
        redDotY: '0px',
        isOnHoverDot: false
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
            // this.$bus.$on('resetDots', this.resetDots)
        },
        resetDots() {
          let width = this.width
          let height = this.height
          let offset = 4
          this.dots = [
            {
              id: 1,
              x: width / 2 - offset,
              y: - offset
            },
            {
              id: 2,
              x: width - offset,
              y: height / 2 - offset
            },
            {
              id: 3,
              x: width / 2 - offset,
              y: height - offset
            },
            {
              id: 4,
              x: - offset,
              y: height / 2 - offset
            }
          ]
          if(this.nodeInfo.dots) {
            this.nodeInfo.dots = this.dots
          }
        },
        nodeMousedown(event) {
          if(this.isOnBorder) {
            this.$bus.$emit('startDrawLink', event)
            return;
          }
          if(!this.isSelected) {
            this.selectNode()
          }
          if(this.isInContent) {
            this.$store.commit('board/setNodeMouseDown')
            this.$bus.$emit('nodeMouseDown', event)
          }
          this.$store.commit('node/setDragNodeInfo', this.nodeInfo);
        },
        nodeMouseleave() {
          this.isOnBorder = false
          this.isInContent = false
        },
        nodeMouseMove(event) {
          let element = this.$refs.element;
          let rect = element.getBoundingClientRect(); 
          let offsetX = event.clientX - rect.left;
          let offsetY = event.clientY - rect.top;
          const ctx = this.$refs.element.getContext('2d');
          this.isInContent = ctx.isPointInPath(offsetX, offsetY);
          this.isOnBorder = ctx.isPointInStroke(offsetX, offsetY)
          if(this.isOnBorder && !this.isSelected) {
            this.redDotX = event.clientX + 'px'
            this.redDotY = event.clientY + 'px'
          }
        },
        selectNode() {
          let { width, height, top, left, id } = this
          this.$bus.$emit('selectNodes', [{
            width,
            height,
            top: top,
            left: left,
            id
          }])
        },
        dotMouseDown(e) {
          this.stopEvent(e);
        },
        stopEvent(e) {
          e.stopPropagation();
          e.preventDefault();
        },
        nodeDblClick(e) {
          if(!this.readOnly && this.isInContent) {
            let id = this.nodeInfo.id
            this.$bus.$emit('onEdit', id)
          }
        }
    },
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
      .node {
        position: absolute;
        top: 0;
        left: 0;
      }
      .red_dot {
        width: 6px;
        height: 6px;
        position: fixed;
        z-index: 9999;
        background-color: red;
        border-radius: 50%;
        pointer-events: none;
      }
    }
    .hover_dot:nth-child(1) {
      top: -4px;
      left: calc(50% - 4px);
    }
    .hover_dot:nth-child(2) {
      top: calc(50% - 4px);
      left: calc(100% - 4px);
    }
    .hover_dot:nth-child(3) {
      top: calc(100% - 4px);
      left: calc(50% - 4px);
    }
    .hover_dot:nth-child(4) {
      top: calc(50% - 4px);
      left: -4px;
    }
    .hover_dot {
      position: absolute;
      width: 8px;
      height: 8px;
      border: 1px solid #067BEF;
      border-radius: 50%;
      background-color: #fff;
      cursor: crosshair;
      z-index: 999;
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