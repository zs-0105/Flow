<template>
    <div class="paneR" ref="paneR">
        <div class="drawing_board_wrap" ref="board" :style="{width: `${boardWidth}px`,height: `${boardHight}px`}">
            <div class="drawing_board_container">
                <canvas ref="drawing_board" class="drawing_board" :width="boardWidth" :height="boardHight"></canvas>
            </div>
            <ele v-for="(value, key) in nodes" :key="key" :node-info="value"></ele>
            <textarea ref="editInput" spellcheck="false" class="editInput" v-model="editorValue" @blur="nodeEndedting" :style="{width: `${editorWidth}px`, height: `${editorHeight}px`, top:`${top}px`, left:`${left}px`}" v-if="isEditing" />
        </div>
    </div>
</template>

<script>
import canvas from '@/utils/canvas.js'
import ele from '@/components/Node.vue'
import { generateUUID } from '@/utils/utils.js'
import { mapState } from 'vuex';
import { ELPADDING } from '../constants/index'
  export default {
    components: {
      ele
    },
    computed: {
      ...mapState('board', ['boardBkColor','boardWidth', 'boardHight', 'nodes'])
    },
    data () {
      return {
        // boardBkColor: '',
        // boardWidth: 1500,
        // boardHight: 840,
        // nodes: []
        isEditing: false,
        editorWidth: 0,
        editorHeight: 0,
        editorValue: '',
        top: 0,
        left: 0,
        editingNodeId: ''
      }
    },
    mounted(){
      this.initDrawGrid()
      this.setEvent()
    },
    methods: {
      initDrawGrid() {
        canvas.drawGrid(this.$refs.drawing_board)
        this.$refs.paneR.scrollTop = 990
        this.$refs.paneR.scrollLeft = 990
      },
      setEvent() {
        this.$bus.$on('creatElement', (info, el, event)=> {
          this.creatElement(info, el, event)
        })
        this.$bus.$on('onEdit', this.nodeOnedting)
      },
      creatElement(info, el, event) {
        const canvasRect = this.$refs.board.getBoundingClientRect();
        const mouseX = event.clientX - canvasRect.left - (el.width + 2 * ELPADDING) / 2;
        const mouseY = event.clientY - canvasRect.top - (el.height + 2 * ELPADDING) / 2;
        let data = {
          ...info,
          name: info.name,
          funName: info.funName,
          cname: info.cname,
          width: el.width,
          height: el.height,
          top: mouseY,
          left: mouseX,
          isEditing: false,
          text: '',
          id: generateUUID()
        }
        this.$store.commit('board/addNode', data);
        console.log(this.nodes);
      },
      nodeOnedting(info) {
        let {id, width, height, value, top, left} = info
        this.isEditing = true
        this.editorWidth = width
        this.editorHeight = height
        this.editorValue = value
        this.top = top + ELPADDING
        this.left = left + ELPADDING
        this.editingNodeId = id
        this.$nextTick(() => {
          this.$refs.editInput.focus()
          this.updateNodeInfo({
            id,
            attr: 'isEditing',
            value: true
          })
        })
      },
      nodeEndedting(e) {
        let value = e.target.value
        let infos = [
          {
            id: this.editingNodeId,
            attr: 'isEditing',
            value: false
          },
          {
            id: this.editingNodeId,
            attr: 'text',
            value: value
          }
        ]
        this.isEditing = false
        this.updateNodeInfo(infos)
      },
      updateNodeInfo(data) {
        if(Array.isArray(data)) {
          for(let data of data) {
            this.$store.commit('board/updateNodeInfo', data)
          }
        }else {
          let {id, attr, value} = data
          this.$store.commit('board/updateNodeInfo', {id, attr, value})
        }
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
  z-index: 999;
  /* border: none; */
  box-sizing: content-box;
  background-color: transparent;
  text-decoration: none;
  /* outline: none; */
  /* white-space: pre-wrap; */
  /* overflow-wrap: break-word; */
}
</style>