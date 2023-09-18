<template>
    <div class="paneR" ref="paneR" @mousedown="paneRMouseDown" @mousemove="paneRMouseMove" @mouseup="paneRMouseUp" :style="{overflow: isShpaeControlorMouseDown?'hidden':'auto', cursor}">
        <div class="drawing_board_wrap" @click="boardClick" @mousemove="onBoardMouseMove" :style="{width: `${boardWidth}px`,height: `${boardHight}px`}">
            <div class="drawing_board_content">
                <canvas ref="drawing_board" class="drawing_board" :width="boardWidth" :height="boardHight"></canvas>
                <node v-for="(value, key) in nodes" :key="key" :node-info="value" :cursor="cursor"></node>
                <textarea 
                  ref="editInput" 
                  class="editInput" 
                  v-model="editorInfo.editorValue" 
                  @blur="nodeEndedting" 
                  :style="{width: editorWidth, height: editorHeight, top:selectorTop, left:selectorLeft}" 
                  v-if="isEditing" 
                />
                <div class="select_box" :style="{width: seletorWidth, height: seletorHeight, top: seletorTop, left: seletorLeft}" v-if="selectBoxInfo.showSelector">
                  <canvas ref="select_box_canvas" :style="{'pointer-events':isShpaeControlorMouseDown ? 'auto' : 'none', cursor}"></canvas>
                  <div class="shape_controlor" 
                    v-for="index in 8" 
                    :key="index" 
                    @mousedown="controlorKeyDown(index, $event)" 
                    :class="{activeCon: isShpaeControlorMouseDown && controlorIndex == index}"
                  ></div>
                  <div class="shape_rotater"></div>
                </div>
                <div class="selecting_box" 
                  v-if="isSelecting" 
                  :style="{
                    top:selectingBoxTop + 'px',
                    left:selectingBoxleft + 'px',
                    width:selectingBoxWidth + 'px',
                    height:selectingBoxHeight + 'px'
                  }"
                >
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import canvas from '@/utils/canvas.js'
import node from '@/components/Node.vue'
import { generateUUID } from '@/utils/utils.js'
import { mapState } from 'vuex';
import { ELPADDING } from '../constants/index'
  export default {
    components: {
      node
    },
    computed: {
      ...mapState('board', ['boardBkColor','boardWidth', 'boardHight', 'nodes']),
      seletorWidth(){
        return this.selectBoxInfo.width + 'px'
      },
      seletorHeight() {
        return this.selectBoxInfo.height + 'px'
      },
      seletorTop() {
        return this.selectBoxInfo.top + 'px'
      },
      seletorLeft() {
        return this.selectBoxInfo.left + 'px'
      },
      editorWidth() {
        let nodeId = this.editingNodeId
        return this.nodes[nodeId].width - 2 * ELPADDING - 1 + 'px'
      },
      editorHeight() {
        let nodeId = this.editingNodeId
        return this.nodes[nodeId].height - 2 * ELPADDING - 1 + 'px'
      },
      selectorTop() {
        let nodeId = this.editingNodeId
        return this.nodes[nodeId].top + ELPADDING + 'px'
      },
      selectorLeft() {
        let nodeId = this.editingNodeId
        return this.nodes[nodeId].left + ELPADDING + 'px'
      },
      cursor() {
        if(this.isShpaeControlorMouseDown) {
          switch(this.controlorIndex) {
            case 1:
              return 'nw-resize';
            case 2:
              return 's-resize';
            case 3:
              return 'ne-resize';
            case 4:
              return 'e-resize';
            case 5:
              return 'nw-resize';
            case 6:
              return 's-resize';
            case 7:
              return 'ne-resize';
            case 8:
              return 'e-resize';
          }
        }else {
          return 'default'
        }
      }
    },
    data () {
      return {
        // boardBkColor: '',
        // boardWidth: 1500,
        // boardHight: 840,
        // nodes: []
        isEditing: false,
        editorInfo: {
          editorWidth: 0,
          editorHeight: 0,
          editorValue: '',
        },
        editingNodeId: '',
        selectBoxInfo: {
          showSelector: false,
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          selectNodesIds: [],
          startWidth: 0,
          startHeight: 0,
          startTop: 0,
          startLeft: 0
        },
        controlorIndex: 0,
        isShpaeControlorMouseDown: false,
        mouseDownX: 0,
        mouseDownY: 0,
        animationFrameId: null,
        selectingBoxTop: 0,
        selectingBoxleft: 0,
        selectingBoxWidth: 0,
        selectingBoxHeight: 0,
        isSelecting: false,
        paneRMouseDownX: 0,
        paneRMouseDownY: 0
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
        this.$bus.$on('createElement', this.createElement)
        this.$bus.$on('onEdit', this.nodeOnedting)
        this.$bus.$on('selectNodes', this.selectNodes)
        this.$bus.$on('moveSelector', this.moveSelector)
        document.addEventListener('mouseup', () => this.isShpaeControlorMouseDown = false)
      },
      boardClick(e) {
        e.stopPropagation();
        let isOnBoard = this.isOnBoard(e)
        if(isOnBoard)
          this.selectBoxInfo.showSelector = false
      },
      isOnBoard(e) {
        let isBoardWrap = e.target.classList.contains("drawing_board_wrap")
        let isBoard = e.target.classList.contains("drawing_board")
        return isBoardWrap || isBoard
      },
      createElement(info, el, event) {
        const canvasRect = this.$refs.drawing_board.getBoundingClientRect();
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
      },
      nodeOnedting(id) {
        // let {id, width, height, value, top, left} = info
        this.isEditing = true
        // this.editorInfo.editorWidth = width
        // this.editorInfo.editorHeight = height
        // this.editorInfo.editorValue = value
        // this.top = top + ELPADDING
        // this.left = left + ELPADDING
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
      },
      batchUpdateNodeInfo(ids, attr, value) {
        this.$store.commit('board/batchUpdateNodeInfo', {ids, attr, value})
      },
      selectNodes(nodesInfo) {
        this.selectBoxInfo.showSelector = true
        this.$nextTick(() => {
          let selectBox = this.$refs['select_box_canvas']
          if(Array.isArray(nodesInfo)) {
            let { width, height, top, left ,ids} = getComputedInfo(nodesInfo)
            this.selectBoxInfo.selectNodesIds = ids
          }else {
            let { width, height, top, left, id}= nodesInfo
            this.selectBoxInfo.width = width
            this.selectBoxInfo.height = height
            this.selectBoxInfo.top = top
            this.selectBoxInfo.left = left
            this.selectBoxInfo.selectNodesIds = [id]
            canvas.drawSelectBox(selectBox, {width, height})
          }
        })
      },
      moveSelector(info) {
        let { top, left } = info
        this.selectBoxInfo.top = top
        this.selectBoxInfo.left = left 
      },
      getComputedInfo(nodesInfo) {

      },
      controlorKeyDown(index, event) {
        this.controlorIndex = index
        this.isShpaeControlorMouseDown = true
        this.mouseDownX = event.clientX
        this.mouseDownY = event.clientY
        this.selectBoxInfo.startWidth = this.selectBoxInfo.width
        this.selectBoxInfo.startHeight = this.selectBoxInfo.height
        this.selectBoxInfo.startTop = this.selectBoxInfo.top
        this.selectBoxInfo.startLeft = this.selectBoxInfo.left
      },
      onBoardMouseMove(event) {
        let movedWidth = Math.floor(event.clientX - this.mouseDownX)
        let movedHeight = Math.floor(event.clientY - this.mouseDownY)
        let index = this.controlorIndex
        let selectNodesIds = this.selectBoxInfo.selectNodesIds
        if(this.isShpaeControlorMouseDown) {
            this.changNodesShape(selectNodesIds, index, movedWidth, movedHeight)
        }
      },
      changNodesShape(selectNodesIds, index, movedWidth, movedHeight) {
        let width, height, top, left
        switch(index) {
          case 1:
            width = this.selectBoxInfo.startWidth - movedWidth
            height = this.selectBoxInfo.startHeight - movedHeight
            top = this.selectBoxInfo.startTop + movedHeight
            left = this.selectBoxInfo.startLeft + movedWidth
            if(width <= 20) left = this.selectBoxInfo.startLeft + this.selectBoxInfo.startWidth - 20
            if(height <= 20) top = this.selectBoxInfo.startTop + this.selectBoxInfo.startHeight - 20
            break;
          case 2:
            height = this.selectBoxInfo.startHeight - movedHeight
            width = this.selectBoxInfo.startWidth
            top = this.selectBoxInfo.startTop + movedHeight
            left = this.selectBoxInfo.startLeft
            if(height <= 20) top = this.selectBoxInfo.startTop + this.selectBoxInfo.startHeight - 20
            break;
          case 3:
            width = this.selectBoxInfo.startWidth + movedWidth
            height = this.selectBoxInfo.startHeight - movedHeight
            top = this.selectBoxInfo.startTop + movedHeight
            left = this.selectBoxInfo.startLeft
            if(width <= 20) left = this.selectBoxInfo.startLeft
            if(height <= 20) top = this.selectBoxInfo.startTop + this.selectBoxInfo.startHeight - 20
            break;
          case 4:
            height = this.selectBoxInfo.startHeight
            width = this.selectBoxInfo.startWidth + movedWidth
            top = this.selectBoxInfo.startTop
            left = this.selectBoxInfo.startLeft
            if(height <= 20) top = this.selectBoxInfo.startTop + this.selectBoxInfo.startHeight - 20
            break;
          case 5:
            width = this.selectBoxInfo.startWidth + movedWidth
            height = this.selectBoxInfo.startHeight + movedHeight
            top = this.selectBoxInfo.startTop
            left = this.selectBoxInfo.startLeft
            break;
          case 6:
            height = this.selectBoxInfo.startHeight + movedHeight
            width = this.selectBoxInfo.startWidth
            top = this.selectBoxInfo.startTop
            left = this.selectBoxInfo.startLeft
            break;
          case 7:
            width = this.selectBoxInfo.startWidth - movedWidth
            height = this.selectBoxInfo.startHeight + movedHeight
            top = this.selectBoxInfo.startTop
            left = this.selectBoxInfo.startLeft + movedWidth
            if(width <= 20) left = this.selectBoxInfo.startLeft + this.selectBoxInfo.startWidth - 20
            break;
          case 8:
            height = this.selectBoxInfo.startHeight
            width = this.selectBoxInfo.startWidth - movedWidth
            top = this.selectBoxInfo.startTop
            left = this.selectBoxInfo.startLeft + movedWidth
            if(width <= 20) left = this.selectBoxInfo.startLeft + this.selectBoxInfo.startWidth - 20
            break;
        }
        if(width <= 20) {
          width = 20
        }
        if(height <= 20) {
          height = 20
        }
        if(width >= 20) {
          this.selectBoxInfo.left = left
          this.selectBoxInfo.width = width
          this.batchUpdateNodeInfo(selectNodesIds, 'left', left - ELPADDING)
          this.batchUpdateNodeInfo(selectNodesIds, 'width', width)
        }
        if(height >= 20){
          this.selectBoxInfo.top = top
          this.selectBoxInfo.height = height
          this.batchUpdateNodeInfo(selectNodesIds, 'top', top - ELPADDING)
          this.batchUpdateNodeInfo(selectNodesIds, 'height', height)
        }
        canvas.drawSelectBox(this.$refs['select_box_canvas'], {width, height})
      },
      paneRMouseDown(e) {
        let isOnBoard = this.isOnBoard(e)
        if(isOnBoard) {
          let element = this.$refs.drawing_board
          var x = e.clientX - element.getBoundingClientRect().left;
          var y = e.clientY - element.getBoundingClientRect().top;
          this.paneRMouseDownX = x
          this.paneRMouseDownY = y
          this.selectingBoxleft = x
          this.selectingBoxTop = y
          this.isSelecting = true
        }
      },
      paneRMouseMove(e) {
        if(this.isSelecting) {
          let element = this.$refs.drawing_board
          var currentX = e.clientX - element.getBoundingClientRect().left;
          var currentY = e.clientY - element.getBoundingClientRect().top;
          let width = currentX - this.paneRMouseDownX
          let height = currentY - this.paneRMouseDownY
          if(width < 0) {
            this.selectingBoxleft = currentX
          }
          if(height < 0) {
            this.selectingBoxTop = currentY
          }
          this.selectingBoxWidth = Math.abs(width)
          this.selectingBoxHeight = Math.abs(height)
        }
      },
      paneRMouseUp() {
        this.isSelecting = false
        this.selectingBoxHeight = 0
        this.selectingBoxWidth = 0

      },
      getSelectedNodes() {
        for(let node of this.nodes) {

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
}
.drawing_board_content {
    width: 100%;
    height: 100%;
    position: relative;
}
.drawing_board {
    box-shadow: 0 2px 6px rgba(0,0,0,.1);
}
.editInput {
  position: absolute;
  z-index: 999;
  box-sizing: content-box;
  background-color: transparent;
  text-decoration: none;
}
.select_box {
  position: absolute;
  z-index: 99999;
  pointer-events: none;
}
.select_box .shape_controlor {
  width: 8px;
  height: 8px;
  position: absolute;
  background: #fff;
  border: 1px solid rgb(6, 123, 239);
  border-width: 1px;
}
.select_box .shape_controlor {
  pointer-events: auto;
}
.select_box .shape_controlor:hover {
  background: rgb(6, 123, 239);
}
.select_box .activeCon {
  background: rgb(6, 123, 239);
}
.select_box .shape_controlor:nth-child(2) {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}
.select_box .shape_controlor:nth-child(3) {
  top: -4px;
  left: calc(50% - 4px);
  cursor: s-resize;
}
.select_box .shape_controlor:nth-child(4) {
  top: -4px;
  left: calc(100% - 4px);
  cursor: ne-resize;
}
.select_box .shape_controlor:nth-child(5) {
  top: calc(50% - 4px);
  left: calc(100% - 4px);
  cursor: e-resize;
}
.select_box .shape_controlor:nth-child(6) {
  top: calc(100% - 4px);
  left: calc(100% - 4px);
  cursor: nw-resize;
}
.select_box .shape_controlor:nth-child(7) {
  top: calc(100% - 4px);
  left: calc(50% - 4px);
  cursor: s-resize;
}
.select_box .shape_controlor:nth-child(8) {
  top: calc(100% - 4px);
  left: -4px;
  cursor: ne-resize;
}
.select_box .shape_controlor:nth-child(9) {
  top: calc(50% - 4px);
  left: -4px;
  cursor: e-resize;
}
.selecting_box {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border: 1px solid rgb(6, 123, 239);
  background-color: rgb(6, 123, 239, 0.1);
}
</style>