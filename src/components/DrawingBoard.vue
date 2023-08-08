<template>
    <div class="paneR" ref="paneR">
        <div class="drawing_board_wrap" ref="board" :style="{width: `${boardWidth}px`,height: `${boardHight}px`}">
            <div class="drawing_board_container">
                <canvas ref="drawing_board" class="drawing_board" :width="boardWidth" :height="boardHight"></canvas>
            </div>
            <ele v-for="(value, key) in elements" :key="key" :el-data="value"></ele>
            <div ref="editInput" class="editInput" :style="{width: `${editorWidth}px`, height: `${editorHeight}px`, top:`${top}px`, left:`${left}px`}" contenteditable="true" v-show="showEditor">
              {{editorValue}}
            </div>
        </div>
    </div>
</template>

<script>
import canvas from '@/utils/canvas.js'
import ele from '@/components/Element.vue'
import { generateUUID } from '@/utils/utils.js'
import { mapState } from 'vuex';
  export default {
    components: {
      ele
    },
    computed: {
      ...mapState('board', ['boardBkColor','boardWidth', 'boardHight', 'elements'])
    },
    data () {
      return {
        // boardBkColor: '',
        // boardWidth: 1500,
        // boardHight: 840,
        // elements: []
        showEditor: false,
        editorWidth: 0,
        editorHeight: 0,
        editorValue: '',
        top: 0,
        left: 0
      }
    },
    mounted(){
        canvas.drawGrid(this.$refs.drawing_board)
        this.$refs.paneR.scrollTop = 990
        this.$refs.paneR.scrollLeft = 990
        this.$bus.$on('creatElement', (info, el, event)=> {
          this.creatElement(info, el, event)
        })
        this.$bus.$on('onEdit', this.elOnedit)
    },
    methods: {
      creatElement(info, el, event) {
        const canvasRect = this.$refs.board.getBoundingClientRect();
        const mouseX = event.clientX - canvasRect.left - el.width / 2;
        const mouseY = event.clientY - canvasRect.top - el.height / 2;
        let data = {
          ...info,
          name: info.name,
          funName: info.funName,
          cname: info.cname,
          width: el.width,
          height: el.height,
          top: mouseY,
          left: mouseX,
          id: generateUUID()
        }
        this.$store.commit('board/addElement', data);
        console.log(this.elements);
      },
      elOnedit(info) {
        let {id, width, height, value, top, left} = info
        this.showEditor = true
        this.editorWidth = width
        this.editorHeight = height
        this.editorValue = value
        this.top = top + 10
        this.left = left + 10
        this.$nextTick(() => {
          this.$refs.editInput.focus()
        })
      }
    },
  }
</script>

<style scoped>
  /* @import url(); 引入公共css类 */
.paneR {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.drawing_board_wrap {
    padding: 1000px;
    background: #EAECEE;
    box-sizing: content-box;
    position: relative;
}
.drawing_board_container {
    width: 100%;
    height: 100%;
}
.drawing_board {
    box-shadow: 0 2px 6px rgba(0,0,0,.1);
}
.editInput {
  position: absolute;
}
</style>