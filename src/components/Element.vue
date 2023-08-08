<template>
  <div class='element_wrap' @mouseenter="showDots = true" @mouseleave="showDots = false" :style="{top:`${top}px`, left:`${left}px`, width: `${width + 2 * padding}px`, height: `${height + 2 * padding}px`}">
    <div class="el_content" @mousedown="stopEvent">
      <canvas ref="element" 
        @mousemove="elMouseMove"
        @mousedown="elMousedown"
        @click="elClick"
        @dblclick="elDblclick"
        :style="{cursor:isInContent?'move':'default'}"
        :width="width"
        :height="height"
        draggable="false"
      >
      </canvas>
      <div ref="editInput" class="edit_input" :style="{width: `${width}px`, height: `${height}px`}" contenteditable="true" v-show="!isEditinng">
        {{text}}
      </div>
      <div class="hover_dot" 
        v-show="isInContent && showDots" 
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
  export default {
    components: {},
    props:{
        elData: {
            type: Object,
            required: true
        },
    },
    computed: {
        top() {
            return this.elData.top
        },
        left() {
            return this.elData.left
        },
        width() {
            return this.elData.width
        },
        height() {
            return this.elData.height
        },
        editable() {
          return this.elData.editable || true
        },
        text() {
            return this.elData.text
        },
        isEditinng() {
          return this.elData.isEditinng
        }
    },
    mounted() {
      console.log(this.elData);
        this.init()
        document.addEventListener('mouseup',() => {
          this.isMousedown = false
        })
        document.addEventListener('mousemove', (event) => {
          if(this.isMousedown) {
            const canvasRect = this.$parent.$refs.board.getBoundingClientRect();
            const mouseX = event.clientX - canvasRect.left - this.offsetX;
            const mouseY = event.clientY - canvasRect.top - this.offsetY;
            this.elData.top = mouseY
            this.elData.left = mouseX
          }
        })
    },
    data () {
      return {
        showDots: false,
        dots: [],
        isMousedown: false,
        padding: 10,
        offsetX: 0,//元素定位x坐标
        offsetY: 0,//元素定位y坐标
        isInContent: false,//鼠标是否在画布有内容的区域
        isInDot: false,//鼠标是否移入到圆点
      }
    },
    methods: {
        init() {
            let funName = this.elData.funName
            canvas[funName](this.$refs.element)
            this.dots = this.elData.dots
            if(!this.elData.dots) {
              this.resetDots()
            }
        },
        resetDots() {
          let width = this.width + 20
          let height = this.height + 20
          let offset = 5
          this.dots = [
            {
              id: 1,
              x: width / 2 - offset + 1,
              y: offset + 1
            },
            {
              id: 2,
              x: width - 3 * offset + 1,
              y: height / 2 - offset + 1
            },
            {
              id: 3,
              x: width / 2 - offset + 1,
              y: height - 3 * offset + 1
            },
            {
              id: 4,
              x: offset,
              y: height / 2 - offset + 1
            }
          ]
          if(this.elData.dots) {
            this.elData.dots = this.dots
          }
        },
        elMousedown(event) {
          let element = event.target; // 获取点击的元素
          let rect = element.getBoundingClientRect(); // 获取元素的位置和大小
          this.offsetX = event.clientX - rect.left + this.padding; // 计算鼠标在元素内部的横向偏移量
          this.offsetY = event.clientY - rect.top + this.padding; // 计算鼠标在元素内部的纵向偏移量
          // const ctx = this.$refs.element.getContext('2d');
          // this.isInContent = ctx.isPointInPath(this.offsetX, this.offsetY);
          if(!this.isInContent) return;
          this.isMousedown = true;
        },
        elMouseMove(event) {
          let element = event.target; // 获取点击的元素
          let rect = element.getBoundingClientRect(); // 获取元素的位置和大小
          let offsetX = event.clientX - rect.left; // 计算鼠标在元素内部的横向偏移量
          let offsetY = event.clientY - rect.top; // 计算鼠标在元素内部的纵向偏移量
          const ctx = this.$refs.element.getContext('2d');
          this.isInContent = ctx.isPointInPath(offsetX, offsetY);
        },
        elClick() {
      
        },
        mouseEnterDot() {
          // this.showDots = true
          this.isInDot = true
        },
        dotMouseDown(e) {
          this.stopEvent(e)

        },
        stopEvent(e) {
          e.stopPropagation()
          e.preventDefault();
        },
        elDblclick(e) {
          this.stopEvent(e)
          if(this.editable) {
            this.isEdit = true
            // this.$refs['editInput'].focus()
            let width = this.$refs['editInput'].clientWidth
            let height = this.$refs['editInput'].clientHeight
            let value = this.elData.text
            let id = this.elData.id
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
  }
</script>

<style lang="scss" scoped>
  /* @import url(); 引入公共css类 */
.element_wrap {
    position: absolute;
    .el_content {
      width: 100%;
      height: 100%;
      position: relative;
      padding: 10px;
      canvas:hover{
        cursor: move;
      }
    }
    .hover_dot {
      position: absolute;
      width: 8px;
      height: 8px;
      border: 1px solid #067BEF;
      border-radius: 50%;
      background-color: #fff;
    }
    .edit_input {
      width: 20px;
      height: 20px;
      min-height: 40px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
}
</style>