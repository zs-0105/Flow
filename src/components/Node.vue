<template>
  <div class='node_wrap' ref="nodeWrap" 
    :style="{top:`${top - ELPADDING}px`, left:`${left - ELPADDING}px`, width: `${width}px`, height: `${height}px`, 'z-index': nodeInfo.index, padding: ELPADDING + 'px' }"
    @mousemove="nodeMouseMove"
  >
      <!-- @mousemove="nodeMouseMove" -->
    <div class="node_content" 
      @mousedown="nodeMousedown"
      @mouseleave="nodeMouseleave"
      @dblclick="nodeDblClick"
      ref="nodeContent"
      >
      <div class="hover_dot"
        v-show="(isInContent || isOnBorder) && !isSelected"
        v-for="item in nodeInfo.dots"
        :key="item.id"
        :class="{ 'active': item.active }"
        @mousedown="dotMouseDown"
        @mouseenter="isOnHoverDot = true"
        @mouseleave="isOnHoverDot = false"
        :style="{left: item.x - LINKDOTWIDTH + 'px', top: item.y - LINKDOTWIDTH + 'px', cursor: 'crosshair'}"
      ></div>
      <div class="hover_dot active"
        v-for="item in particularPoints"
        :key="item.id"
        @mousedown="dotMouseDown"
        @mouseenter="isOnHoverDot = true"
        @mouseleave="isOnHoverDot = false"
        :style="{left: item.x - LINKDOTWIDTH + 'px', top: item.y - LINKDOTWIDTH + 'px'}"
      ></div>
      <!-- top:`${item.y}px`,left:`${item.x}px`, -->
      <canvas ref="nodeCanvas"
        class="node"
        :id="id"
      >
      <!-- :style="{cursor:canvasCursor}" -->
      </canvas>
      <div class="text_content" v-show="!isEditing">
        {{text}}
      </div>
      <div class="red_dot" :style="{top:redDotY,left:redDotX}" v-show="showRedDot"></div>
    </div>
  </div>
</template>

<script>
const ratio = window.devicePixelRatio || 1
import canvas from '@/utils/canvas.js'
import { ELPADDING, LINKDOTWIDTH } from '../constants/index'
  export default {
    components: {},
    props:{
        nodeInfo: {
            type: Object,
            required: true
        },
        // cursor: {
        //   type: String,
        //   required: true
        // },
        isEditing: {
          type: Boolean,
          default: false
        },
        selectedNodesMap: {
          type: Object,
          default: () => {}
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
        isSelected() {
          return this.selectedNodesMap[this.id]
        },
        // canvasCursor() {
        //   if(this.isOnBorder && !this.isSelected){
        //     return 'crosshair'
        //   }else if(this.isOnBorder && this.isSelected) {
        //     return 'move'
        //   }else if(this.isInContent) {
        //     return 'move'
        //   }else {
        //     return 'default'
        //   }
        // },
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
        this.initEvent()
    },
    data () {
      return {
        // dots: [],
        isNodeMousedown: false,
        isInContent: false,//鼠标是否在画布有内容的区域
        isOnBorder: false, //鼠标是否在边框线上
        redDotX: '0px',
        redDotY: '0px',
        isOnHoverDot: false,
        ELPADDING: ELPADDING,
        LINKDOTWIDTH: LINKDOTWIDTH,
        particularPoints: [],
      }
    },
    methods: {
        init() {
            let funName = this.nodeInfo.funName
            canvas[funName](this.$refs.nodeCanvas)
            if(!this.nodeInfo.dots || !this.nodeInfo.dots.length) {
              this.resetDots()
            }
            // this.$bus.$on('resetDots', this.resetDots)
        },
        initEvent() {
          document.addEventListener('mouseup', () => {
            this.nodeInfo.dots.forEach(i => i.active = false)
            this.particularPoints = []
          })
        },
        resetDots() {
          let width = this.width
          let height = this.height
          // let offset = 4
          let dots = [
            {
              id: 1,
              x: width / 2,
              y: 0 + LINKDOTWIDTH / 2,
              active: false
            },
            {
              id: 2,
              x: width - LINKDOTWIDTH / 2,
              y: height / 2,
              active: false
            },
            {
              id: 3,
              x: width / 2,
              y: height - LINKDOTWIDTH / 2,
              active: false
            },
            {
              id: 4,
              x: 0 + LINKDOTWIDTH / 2,
              y: height / 2,
              active: false
            }
          ]
          this.$emit('updateNodeInfo', {
            id: this.nodeInfo.id,
            dots
          })

        },
        nodeMousedown(event) {
          console.log(this.nodeInfo);
          if(this.isOnBorder && !this.isSelected) {
            this.$bus.$emit('startDrawLink', event, this.id, (newLinkInfo) => {
              let outLinks = [...this.nodeInfo.outLinks]
              outLinks.push({
                id: newLinkInfo.id,
                offsetX: event.offsetX,
                offsetY: event.offsetY
              })
              this.$emit('updateNodeInfo', {
                id: this.nodeInfo.id,
                outLinks: outLinks
              })
              this.$emit('updateMouseInfo', {
                isDrawingLink: true,
              })
            })
            return;
          }
          if(this.isInContent) {
            if(!this.isSelected) {
              this.selectNode()
            }
            this.$bus.$emit('nodeMouseDown', event)
          }
          this.$emit('setDragNodeInfo', this.nodeInfo)
        },
        nodeMouseleave() {
          this.isOnBorder = false;
          this.isInContent = false;
        },
        nodeMouseMove(event) {
          let element = this.$refs.nodeCanvas;
          let rect = element.getBoundingClientRect();
          let offsetX = event.clientX - rect.left;
          let offsetY = event.clientY - rect.top;
          const ctx = element.getContext('2d');
          this.isInContent = ctx.isPointInPath(offsetX * ratio, offsetY * ratio);
          this.isOnBorder = ctx.isPointInStroke(offsetX * ratio, offsetY * ratio);
          if(this.isOnBorder && !this.isSelected) {
            this.redDotX = event.clientX - 3 + 'px';
            this.redDotY = event.clientY - 3 + 'px';
          }
          if (!this.isSelected) {
            this.dispatchEvent(event, 'mousemove')
          }
          this.$emit('updateMouseInfo', {
            isOnNodeContent: this.isInContent,
            isOnNodeBorder: this.isOnBorder,
            isNodeSelected: this.isSelected,
          }) 
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
        },
        dispatchEvent(event, type) {
          let ctx = this.$refs.nodeCanvas.getContext('2d');
          let rect = this.$refs.nodeCanvas.getBoundingClientRect();
          let offsetX = event.clientX - rect.left;
          let offsetY = event.clientY - rect.top;
          let isInContent = ctx.isPointInPath(offsetX * ratio, offsetY * ratio)
          // let isPointInStroke = ctx.isPointInPath(offsetX * ratio, offsetY * ratio)
          if (!isInContent) {
            this.$refs.nodeCanvas.style.pointerEvents = 'none';
            this.$refs.nodeContent.style.pointerEvents = 'none';
            this.$refs.nodeWrap.style.pointerEvents = 'none';

            const underneathElement = document.elementFromPoint(event.clientX, event.clientY);
              // console.log(underneathElement);
              const clickEvent = new MouseEvent(type, {
                bubbles: true, // 事件冒泡
                cancelable: true, // 事件是否可以取消
                view: window, // 事件发生在的视图 (window)
                clientX: event.clientX, // 点击位置的 x 坐标
                clientY: event.clientY  // 点击位置的 y 坐标
            });

            // 派发事件到目标元素
            underneathElement.dispatchEvent(clickEvent);
            this.$refs.nodeCanvas.style.pointerEvents = 'auto';
            this.$refs.nodeContent.style.pointerEvents = 'auto';
            this.$refs.nodeWrap.style.pointerEvents = 'auto';
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  /* @import url(); 引入公共css类 */
.node_wrap {
    position: absolute;
    box-sizing: content-box;
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
    // .hover_dot:nth-child(1) {
    //   top: -4px;
    //   left: calc(50% - 4px);
    // }
    // .hover_dot:nth-child(2) {
    //   top: calc(50% - 4px);
    //   left: calc(100% - 4px);
    // }
    // .hover_dot:nth-child(3) {
    //   top: calc(100% - 4px);
    //   left: calc(50% - 4px);
    // }
    // .hover_dot:nth-child(4) {
    //   top: calc(50% - 4px);
    //   left: -4px;
    // }
    .hover_dot {
      position: absolute;
      width: 8px;
      height: 8px;
      border: 1px solid #067BEF;
      border-radius: 50%;
      background-color: #fff;
      z-index: 999;
    }
    .active {
      background-color: #067BEF !important;
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