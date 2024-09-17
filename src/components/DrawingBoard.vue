<template>
    <div class="paneR" ref="paneR" @mousedown="paneRMouseDown" @mousemove="paneRMouseMove" :style="{overflow: isShpaeControlorMouseDown?'hidden':'auto', cursor}">
      <!-- @mousedown="boardMouseDown" -->
        <div class="drawing_board_wrap" @mousemove="startResize" :style="{width: `${boardWidth}px`,height: `${boardHight}px`, cursor}">
            <div class="drawing_board_content">
                <canvas ref="drawing_board" class="drawing_board" :width="boardWidth" :height="boardHight"></canvas>
                <!-- :is-selected="selectedNodesMap" -->
                <node v-for="(value, key) in nodes" :ref="value.id" :key="key" :node-info="value" :is-editing="isEditing" ></node>
                <flow-link v-for="(value, key) in links" :ref="value.id" :key="key" :link-info="value">
                </flow-link>
                <textarea
                  ref="editInput"
                  class="editInput"
                  v-model="editorInfo.editorValue"
                  @blur="nodeEndedting"
                  :style="{width: editorWidth, height: editorHeight, top: editorTop, left: editorLeft}"
                  v-if="isEditing"
                ></textarea>
                <div class="select_box" ref="select_box" :style="{width: selectorWidth, height: selectorHeight, top: selectorTop, left: selectorLeft}" v-show="selectBoxInfo.showSelector">
                  <canvas ref="select_box_canvas" :style="{'pointer-events':isShpaeControlorMouseDown ? 'auto' : 'none', cursor}"></canvas>
                  <div class="shape_controlor"
                    v-for="index in 8"
                    v-show="!isMoveingNode"
                    :key="index"
                    @mousedown="controlorMouseDown(index, $event)"
                    :class="{activeCon: isShpaeControlorMouseDown && controlorIndex == index}"
                  ></div>
                  <div class="shape_rotater"></div>
                </div>
                <div class="selecting_box"
                  v-if="isSelecting"
                  :style="{
                    top:selectingBoxInfo.selectingBoxTop + 'px',
                    left:selectingBoxInfo.selectingBoxleft + 'px',
                    width:selectingBoxInfo.selectingBoxWidth + 'px',
                    height:selectingBoxInfo.selectingBoxHeight + 'px'
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
import link from '@/components/Link.vue'
import { ELPADDING } from '../constants/index'
  export default {
    components: {
      node,
      flowLink: link
    },
    computed: {
      ...mapState('board', ['boardBkColor','boardWidth', 'boardHight', 'nodes', 'selectedNodesId', 'links', 'mouseInfo']),
      selectorTop() {
        return this.selectBoxInfo.top + 'px'
      },
      selectorLeft() {
        return this.selectBoxInfo.left + 'px'
      },
      selectorWidth(){
        return this.selectBoxInfo.width + 'px'
      },
      selectorHeight() {
        return this.selectBoxInfo.height + 'px'
      },
      editorWidth() {
        let nodeId = this.editingNodeId
        return nodeId && this.nodes[nodeId].width - 1 + 'px'
      },
      editorHeight() {
        let nodeId = this.editingNodeId
        return nodeId && this.nodes[nodeId].height - 1 + 'px'
      },
      editorTop() {
        let nodeId = this.editingNodeId
        return nodeId && this.nodes[nodeId].top + 'px'
      },
      editorLeft() {
        let nodeId = this.editingNodeId
        return nodeId && this.nodes[nodeId].left + 'px'
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
        } else {
          let { isOnNodeContent, isOnNodeBorder, isNodeSelected, isNearLinkStart, isNearLinkEnd, isDrawingLink, isNearLink } = this.mouseInfo
          if (isDrawingLink) {
            return 'crosshair'
          }
          if (this.isMouseOnBoard) {
            return 'default'
          }
          if(isOnNodeBorder && !isNodeSelected){
            return 'crosshair'
          } else if(isOnNodeBorder && isNodeSelected) {
            return 'move'
          } else if(isOnNodeContent) {
            return 'move'
          }
          console.log(isOnNodeContent, isNearLinkStart, isNearLinkEnd);
          
          if(isNearLinkStart || isNearLinkEnd) {
            return 'move'
          } else if (isNearLink && !isDrawingLink) {
            return 'pointer'
          }
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
          startWidth: 0,
          startHeight: 0,
          startTop: 0,
          startLeft: 0
        },
        controlorIndex: 0,
        isShpaeControlorMouseDown: false,
        animationFrameId: null,
        selectingBoxInfo: {
          selectingBoxTop: 0,
          selectingBoxleft: 0,
          selectingBoxWidth: 0,
          selectingBoxHeight: 0
        },
        isSelecting: false,
        mouseDownX: 0,//相对于画布的x坐标或者clientX
        mouseDownY: 0,//相对于画布的y坐标或者clientY
        selectedNodes:[],
        isNodeMouseDown: false,
        relativeCoords: {},
        selectorOriginState: {},//resize时初始的选择框状态
        selectedNodesOriginState: [],//resize时初始的选中节点的状态
        selectedNodesMap: {},
        // isDrawIngLink: false,
        isDrawingLinkId: '',
        isMoveingNode: false,
        isMouseOnBoard: false
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
        // this.$bus.$on('moveSelector', this.moveSelector)
        this.$bus.$on('setPaneRMouseDown', this.setPaneRMouseDown)
        this.$bus.$on('nodeMouseDown', this.onNodeMouseDown)
        this.$bus.$on('startDrawLink', this.onStartDrawLink)
        this.$bus.$on('updateLinkInfo', this.updateLinkInfo)
        document.addEventListener('mouseup', () => {
          if(this.isShpaeControlorMouseDown) {
            this.isShpaeControlorMouseDown = false
          }
          if(this.isDrawingLink) {
            this.$store.commit('board/updateMouseInfo', {
              isDrawingLink: false,
            })
          }
          if(this.isSelecting) {
            this.selectedNodesMap = {}
            this.$store.commit('board/resetSelectedNodesMap', this.selectedNodesMap)
            this.getSelectedNodes()
            this.isSelecting = false
            this.selectingBoxInfo.selectingBoxHeight = 0
            this.selectingBoxInfo.selectingBoxWidth = 0
            this.selectedNodes = []
          }
          this.isNodeMouseDown = false
          this.isMoveingNode = false
        })
      },
      boardMouseDown(e) {
        // console.log(e.target);
        let isOnBoard = this.isOnBoard(e)
        if(isOnBoard){
          this.selectBoxInfo.showSelector = false
          return;
        }
        // let isOnNode = this.isOnNode(e)
        // if(isOnNode) {

        // }
        // let isOnLink = this.isOnLink
      },
      setPaneRMouseDown(info) {
        this.mouseDownX = info.x
        this.mouseDownY = info.y
      },
      isOnBoard(e) {
        let isBoardWrap = e.target.classList.contains("drawing_board_wrap")
        let isBoard = e.target.classList.contains("drawing_board")
        return isBoardWrap || isBoard
      },
      isOnNode(e) {
         return e.target.classList.contains('node')
      },
      createElement(info, el, event) {
        const canvasRect = this.$refs.drawing_board.getBoundingClientRect();
        const mouseX = event.clientX - canvasRect.left - el.width / 2;
        const mouseY = event.clientY - canvasRect.top - el.height / 2;
        delete info.info //删除默认绘制信息
        let data = {
          ...info,
          name: info.name,
          funName: info.funName,
          cname: info.cname,
          width: el.width,
          height: el.height,
          top: mouseY,
          left: mouseX,
          text: '',
          index: 1,
          id: generateUUID()
        }
        console.log('board/addNode', data);
        
        this.$store.commit('board/addNode', data);
      },
      nodeOnedting(id) {
        this.isEditing = true
        this.editingNodeId = id
        this.$nextTick(() => {
          this.$refs.editInput.focus()
        })
      },
      nodeEndedting(e) {
        let text = e.target.value
        this.isEditing = false
        this.updateNodeInfo({
          id: this.editingNodeId,
          text
        })
      },
      updateNodeInfo(data) {
        if(Array.isArray(data)) {
          for(let data of data) {
            this.$store.commit('board/updateNodeInfo', data)
          }
        }else {
          this.$store.commit('board/updateNodeInfo', data)
        }
      },
      selectNodes(nodesInfo) {
        this.selectBoxInfo.showSelector = true
        let selectBox = this.$refs['select_box_canvas']
        if(!nodesInfo.length) {
          this.selectBoxInfo.showSelector = false
          return;
        }
        let { width, height, top, left} = this.getComputedInfo(nodesInfo)
        this.selectBoxInfo.width = width
        this.selectBoxInfo.height = height
        this.selectBoxInfo.top = top
        this.selectBoxInfo.left = left
        console.log(top, left);
        canvas.drawSelectBox(selectBox, {width, height})
      },
      // moveSelector(info) {
      //   let { top, left } = info
      //   this.selectBoxInfo.top = top
      //   this.selectBoxInfo.left = left 
      // },
      getComputedInfo(nodesInfo) {
        let minTop, minLeft, maxTop, maxLeft
        this.selectedNodesMap = {}
        for(let index = 0; index < nodesInfo.length; index ++) {
          let node = nodesInfo[index]
          let { top, left, width, height, id } = node
          if(index == 0) {
            minTop = top
            minLeft = left
            maxTop = top + height
            maxLeft = left + width
          }else {
            if(top < minTop) minTop = top
            if(left < minLeft) minLeft = left
            if(top + height > maxTop) maxTop = top + height
            if(left + width > maxLeft) maxLeft = left + width
          }
          this.selectedNodesMap[id] = true
        }
        this.$store.commit('board/resetSelectedNodesMap')
        this.$store.commit('board/updateSelectedNodesMap', this.selectedNodesMap)
        return {
          width: maxLeft - minLeft,
          height: maxTop - minTop,
          left: minLeft,
          top: minTop
        }
      },
      controlorMouseDown(index, event) {
        event.stopPropagation();
        this.controlorIndex = index
        this.mouseDownX = event.clientX
        this.mouseDownY = event.clientY
        this.selectBoxInfo.startWidth = this.selectBoxInfo.width
        this.selectBoxInfo.startHeight = this.selectBoxInfo.height
        this.selectBoxInfo.startTop = this.selectBoxInfo.top
        this.selectBoxInfo.startLeft = this.selectBoxInfo.left
        this.selectedNodesOriginState = this.getSelectedNodesOriginState(event)
        this.selectorOriginState = this.getSelectorOriginState(event)
        this.isShpaeControlorMouseDown = true
      },
      getSelectedNodesOriginState(e) {
        let nodes = []
        for(let nodeId in this.selectedNodesMap) {
          let nodeDom = document.getElementById(nodeId)
          let rect = nodeDom.getBoundingClientRect()
          let offsetX = e.clientX - rect.left
          let offsetY = e.clientY - rect.top
          let nodeInfo = {
            ...this.nodes[nodeId],
            offsetX,
            offsetY
          }
          nodes.push(nodeInfo)
        }
        return JSON.parse(JSON.stringify(nodes))
      },
      startResize(event) {
        let movedWidth = event.clientX - this.mouseDownX
        let movedHeight = event.clientY - this.mouseDownY
        let index = this.controlorIndex
        if(this.isShpaeControlorMouseDown) {
            this.resize(index, movedWidth, movedHeight)
        }
      },
      resize(index, movedWidth, movedHeight) {
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
            if(index == 3 || index == 4 || index == 5){
              movedWidth = -this.selectorOriginState.width + 20
            }else {
              movedWidth = this.selectorOriginState.width - 20
            }
          }
          if(height <= 20) {
            height = 20
            if(index == 5 || index == 6 || index == 7) {
              movedHeight = -this.selectorOriginState.height + 20
            }else {
              movedHeight = this.selectorOriginState.height - 20
            }
          }
          if(width >= 20) {
            for (let nodeInfo of this.selectedNodesOriginState) {
              let nodeId = nodeInfo.id
              let { width, left } = this.getChangIngWidthAndLeft(index, nodeInfo, movedWidth)
              this.updateNodeInfo({
                id: nodeId,
                left,
                width
              })
              this.updateLinkOffsetX(index, nodeInfo, movedWidth)
              this.updateDotsOffsetX(index, nodeInfo, movedWidth)
            }
            this.selectBoxInfo.left = left
            this.selectBoxInfo.width = width
          }
          if(height >= 20){
            for (let nodeInfo of this.selectedNodesOriginState) {
              let nodeId = nodeInfo.id
              let { height, top } = this.getChangIngHeightAndTop(index, nodeInfo, movedHeight)
              this.updateNodeInfo({
                id: nodeId,
                height,
                top
              })
              this.updateLinkOffsetY(index, nodeInfo, movedHeight)
              this.updateDotsOffsetY(index, nodeInfo, movedHeight)
            }
            this.selectBoxInfo.top = top
            this.selectBoxInfo.height = height
          }

          if (width >= 20 || height >= 20) {
            for (let nodeInfo of this.selectedNodesOriginState) {
              let nodeId = nodeInfo.id
              let curNodeInfo = this.nodes[nodeId]
              for (let linkInfo of curNodeInfo.inLinks) {
                this.updateLinkInfo({
                  id: linkInfo.id,
                  end: {
                    x: curNodeInfo.left + linkInfo.offsetX,
                    y: curNodeInfo.top + linkInfo.offsetY
                  }
                })
              }
              for (let linkInfo of curNodeInfo.outLinks) {
                this.updateLinkInfo({
                  id: linkInfo.id,
                  start: {
                    x: curNodeInfo.left + linkInfo.offsetX,
                    y: curNodeInfo.top + linkInfo.offsetY
                  }
                })
              }
            }
              
          }
          canvas.drawSelectBox(this.$refs['select_box_canvas'], {width, height})
      },
      getChangIngWidthAndLeft(index, nodeInfo, movedWidth) {
        let nodeOriginWidth = nodeInfo.width
        let nodeOriginLeft = nodeInfo.left
        let selectorOriginWidth = this.selectorOriginState.width
        let selectorOriginLeft = this.selectorOriginState.left
        let widthPercentageIncrease = 1, width = nodeOriginWidth, left = nodeOriginLeft
        if(index == 3 || index == 4 || index == 5) {
          widthPercentageIncrease = (selectorOriginWidth + movedWidth) / selectorOriginWidth
        }else if (index == 1 || index == 7 || index == 8) {
          widthPercentageIncrease = (selectorOriginWidth - movedWidth) / selectorOriginWidth
        }

        if(index == 2 || index == 6) {
          width = nodeOriginWidth
        }else {
          width = widthPercentageIncrease * nodeOriginWidth
        }
        
        // if(width <= 20) width = 20
        if(nodeOriginLeft == selectorOriginLeft){
          if(index == 1 || index == 7 || index == 8) {
            left = selectorOriginLeft + movedWidth
          } else {
            left = nodeOriginLeft
          }
        }else if(nodeOriginLeft + nodeOriginWidth == selectorOriginLeft + selectorOriginWidth) {
          if(index == 3 || index == 4 || index == 5) {
            left = selectorOriginLeft + selectorOriginWidth + movedWidth - width
          }else if(index == 1 || index == 7 || index == 8){
            left = nodeOriginLeft + nodeOriginWidth - width
          }else {
            left = nodeOriginLeft
          }
        }else {
          let leftPercentage = (nodeOriginLeft - selectorOriginLeft) / selectorOriginWidth
          if(index == 1 || index == 7 || index == 8) {
            let selectorWidth = selectorOriginWidth - movedWidth
            let selectorLeft = selectorOriginLeft + movedWidth
            left = selectorLeft + (selectorWidth * leftPercentage)
          }else if (index == 3 || index == 4 || index == 5) {
            let selectorWidth = selectorOriginWidth + movedWidth
            left = selectorOriginLeft + (selectorWidth * leftPercentage)
          }else {
            left = nodeOriginLeft
          }
        }
        return {
          width,
          left
        }
      },
      updateLinkOffsetX(index, nodeInfo, movedWidth) {
        let selectorOriginWidth = this.selectorOriginState.width
        // let selectorOriginLeft = this.selectorOriginState.left
        let curNodeInfo = this.nodes[nodeInfo.id]
        let widthPercentageIncrease = 1
        if(index == 3 || index == 4 || index == 5) {
          widthPercentageIncrease = (selectorOriginWidth + movedWidth) / selectorOriginWidth
        }else if (index == 1 || index == 7 || index == 8) {
          widthPercentageIncrease = (selectorOriginWidth - movedWidth) / selectorOriginWidth
        }
        console.log(widthPercentageIncrease);
        let outLinks = JSON.parse(JSON.stringify(nodeInfo.outLinks))
        let inLinks = JSON.parse(JSON.stringify(nodeInfo.inLinks))
        outLinks.forEach((i, index) => {
          i.offsetX = widthPercentageIncrease * i.offsetX
          i.offsetY = curNodeInfo.outLinks[index].offsetY
        })
        inLinks.forEach((i, index) => {
          i.offsetX = widthPercentageIncrease * i.offsetX
          i.offsetY = curNodeInfo.inLinks[index].offsetY
        })
        this.updateNodeInfo({
          id: nodeInfo.id,
          inLinks: inLinks,
          outLinks: outLinks
        })
      },
      updateDotsOffsetX(index, nodeInfo, movedWidth) {
        let selectorOriginWidth = this.selectorOriginState.width
        // let selectorOriginLeft = this.selectorOriginState.left
        let curNodeInfo = this.nodes[nodeInfo.id]
        let widthPercentageIncrease = 1
        if(index == 3 || index == 4 || index == 5) {
          widthPercentageIncrease = (selectorOriginWidth + movedWidth) / selectorOriginWidth
        }else if (index == 1 || index == 7 || index == 8) {
          widthPercentageIncrease = (selectorOriginWidth - movedWidth) / selectorOriginWidth
        }
        let dots = JSON.parse(JSON.stringify(nodeInfo.dots))
        dots.forEach((i, index) => {
          i.x = widthPercentageIncrease * i.x
          i.y = curNodeInfo.dots[index].y
        })
        this.updateNodeInfo({
          id: nodeInfo.id,
          dots
        })
      },
      updateLinkOffsetY(index, nodeInfo, movedHeight) {
        let selectorOriginHeight = this.selectorOriginState.height
        // let selectorOriginTop = this.selectorOriginState.top
        let curNodeInfo = this.nodes[nodeInfo.id]
        let heightPercentageIncrease = 1
        if(index == 1 || index == 2 || index == 3) {
          heightPercentageIncrease = (selectorOriginHeight - movedHeight) / selectorOriginHeight
        }else if (index == 5 || index == 6 || index == 7) {
          heightPercentageIncrease = (selectorOriginHeight + movedHeight) / selectorOriginHeight
        }
        console.log(heightPercentageIncrease);
        let outLinks = JSON.parse(JSON.stringify(nodeInfo.outLinks))
        let inLinks = JSON.parse(JSON.stringify(nodeInfo.inLinks))
        outLinks.forEach((i, index) => {
          i.offsetY = heightPercentageIncrease * i.offsetY
          i.offsetX = curNodeInfo.outLinks[index].offsetX
        })
        inLinks.forEach((i, index) => {
          i.offsetY = heightPercentageIncrease * i.offsetY
          i.offsetX = curNodeInfo.inLinks[index].offsetX
        })
        this.updateNodeInfo({
          id: nodeInfo.id,
          inLinks: inLinks,
          outLinks: outLinks
        })
      },
      updateDotsOffsetY(index, nodeInfo, movedHeight) {
        let selectorOriginHeight = this.selectorOriginState.height
        let curNodeInfo = this.nodes[nodeInfo.id]
        let heightPercentageIncrease = 1
        if(index == 1 || index == 2 || index == 3) {
          heightPercentageIncrease = (selectorOriginHeight - movedHeight) / selectorOriginHeight
        }else if (index == 5 || index == 6 || index == 7) {
          heightPercentageIncrease = (selectorOriginHeight + movedHeight) / selectorOriginHeight
        }
        let dots = JSON.parse(JSON.stringify(nodeInfo.dots))
        dots.forEach((i, index) => {
          i.y = heightPercentageIncrease * i.y
          i.x = curNodeInfo.dots[index].x
        })
        this.updateNodeInfo({
          id: nodeInfo.id,
          dots
        })
      },
      getChangIngHeightAndTop(index, nodeInfo, movedHeight) {
        let nodeOriginHeight = nodeInfo.height
        let nodeOriginTop = nodeInfo.top
        let selectorOriginHeight = this.selectorOriginState.height
        let selectorOriginTop = this.selectorOriginState.top
        let heightPercentageIncrease = 1, height = nodeOriginHeight, top = nodeOriginTop
        if(index == 1 || index == 2 || index == 3) {
          heightPercentageIncrease = (selectorOriginHeight - movedHeight) / selectorOriginHeight
        }else if (index == 5 || index == 6 || index == 7) {
          heightPercentageIncrease = (selectorOriginHeight + movedHeight) / selectorOriginHeight
        }
        if(index == 4 || index == 8) {
          height = nodeOriginHeight
        }else {
          height = heightPercentageIncrease * nodeOriginHeight
        }
        // if(height <= 20) height = 20
        if(nodeOriginTop == selectorOriginTop){
          if(index == 1 || index == 2 || index == 3) {
            top = selectorOriginTop + movedHeight
          } else {
            top = nodeOriginTop
          }
        }else if(nodeOriginTop + nodeOriginHeight == selectorOriginTop + selectorOriginHeight) {
          if(index == 5 || index == 6 || index == 7) {
            top = selectorOriginTop + selectorOriginHeight + movedHeight - height
          }else if(index == 1 || index == 2 || index == 3) {
            top = nodeOriginTop + nodeOriginHeight - height
          }else{
            top = nodeOriginTop
          }
        }else {
          let heightPercentage = (nodeOriginTop - selectorOriginTop) / selectorOriginHeight
          if(index == 1 || index == 2 || index == 3) {
            let selectorHeight = selectorOriginHeight - movedHeight
            let selectorTop = selectorOriginTop + movedHeight
            top = selectorTop + (selectorHeight * heightPercentage)
          }else if (index == 5 || index == 6 || index == 7) {
            let selectorHeight = selectorOriginHeight + movedHeight
            top = selectorOriginTop + (selectorHeight * heightPercentage)
          }else {
            top = top
          }
        }
        return {
          height,
          top
        }
      },
      paneRMouseDown(e) {
        let isOnBoard = this.isOnBoard(e);
        let rect = this.$refs.drawing_board.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        if(isOnBoard) {
          this.mouseDownX = x;
          this.mouseDownY = y;
          this.selectingBoxInfo.selectingBoxleft = x;
          this.selectingBoxInfo.selectingBoxTop = y;
          this.isSelecting = true;
        }

        if(isOnBoard){
          this.selectBoxInfo.showSelector = false
          // return;
        }
        
        // else {
        //   let underMouseNodeInfo = this.getNodeUnderTheMouse(x, y);
        //   if(underMouseNodeInfo) this.$refs[underMouseNodeInfo.id][0].nodeMousedown(e);
        // }
      },
      paneRMouseMove(e) {
        if(this.isSelecting) {
          this.createSelectingBox(e)
        } else if(this.isNodeMouseDown) {
          this.isMoveingNode = true
          this.moveNodes(e)
        } else {
          this.isMouseOnBoard = this.isOnBoard(e)
        }
        // else if(this.isDrawIngLink) {
        //   this.drawLink(e)
        // }
        // let cursor = this.getCursor()
        // this.$store.commit('board/updateCursor', cursor)
        
        // e.stopPropagation()
        // let rect = this.$refs.drawing_board.getBoundingClientRect()
        // let clientX = e.clientX
        // let clientY = e.clientY
        // let x = clientX - rect.left
        // let y = clientY - rect.top
        // let underMouseNodeInfo = this.getNodeUnderTheMouse(x, y)
        // if(underMouseNodeInfo) this.$refs[underMouseNodeInfo.id][0].nodeMouseMove(e)
        // let isLink = e.target.classList.contains('canvas_link')
        // if(this.isSelecting) {
        //   this.createSelectingBox(e)
        // } else if(this.isNodeMouseDown) {
        //   this.moveNodes(e)
        // }else if(isLink) {
        //   let currentLinkId = e.target.parentElement.id
        //   let rect = this.$refs.drawing_board.getBoundingClientRect()
        //   let offsetX = e.clientX - rect.left
        //   let offsetY = e.clientY - rect.top
        //   let links = this.getLinksMouseOn(offsetX, offsetY, currentLinkId)
        //   this.dispatchMouseMove(links, e)
        // }
      },
      // getCursor() {
      //   if(this.isShpaeControlorMouseDown) {
      //     switch(this.controlorIndex) {
      //       case 1:
      //         return 'nw-resize';
      //       case 2:
      //         return 's-resize';
      //       case 3:
      //         return 'ne-resize';
      //       case 4:
      //         return 'e-resize';
      //       case 5:
      //         return 'nw-resize';
      //       case 6:
      //         return 's-resize';
      //       case 7:
      //         return 'ne-resize';
      //       case 8:
      //         return 'e-resize';
      //     }
      //   } else if (this.isDrawIngLink){
      //     return 'crosshair'
      //   } else {
      //     return 'default'
      //   }
      // },
      // dispatchMouseMove(ids, e) {
      //   for(let id of ids) {
      //     let el = document.getElementById(id).childNodes[0]
      //     // console.log(el);
      //     let event = {
      //       bubbles: true,
      //       cancelable: true,
      //       view: window,
      //       detail: 0,
      //       screenX: e.screenX,
      //       screenY: e.screenY,
      //       clientX: e.clientX,
      //       clientY: e.clientY,
      //       ctrlKey: e.ctrlKey,
      //       altKey: e.altKey,
      //       shiftKey: e.shiftKey,
      //       metaKey: e.metaKey,
      //       button: e.button,
      //       relatedTarget: e.relatedTarget
      //     }
      //     // console.log('mousemove' + id);
      //     this.$bus.$emit('mousemove' + id, event)
      //     // el.dispatchEvent(event)
      //   }
      // },
      getLinksMouseOn(offsetX, offsetY, currentLinkId) {
        let links = []
        for(let id in this.links) {
          if(id == currentLinkId) continue;
          let x1 = this.links[id].start.x
          let x2 = this.links[id].end.x
          let y1 = this.links[id].start.y
          let y2 = this.links[id].end.y
          let isOnLink = 
            offsetX >= Math.min(x1, x2) + 10 && 
            offsetX <= Math.max(x1, x2) + 10 && 
            offsetY >= Math.min(y1, y2) + 10 &&
            offsetY <= Math.max(y1, y2) + 10
          if(isOnLink) {
            links.push(id)
          }
        }
        return links
      },
      createSelectingBox(e) {
        let element = this.$refs.drawing_board
        var currentX = e.clientX - element.getBoundingClientRect().left;
        var currentY = e.clientY - element.getBoundingClientRect().top;
        let width = currentX - this.mouseDownX
        let height = currentY - this.mouseDownY
        if(width < 0) {
          this.selectingBoxInfo.selectingBoxleft = currentX
        }
        if(height < 0) {
          this.selectingBoxInfo.selectingBoxTop = currentY
        }
        this.selectingBoxInfo.selectingBoxWidth = Math.abs(width)
        this.selectingBoxInfo.selectingBoxHeight = Math.abs(height)
      },
      getSelectedNodes() {
        let selectedNodes = []
        for(let nodeId in this.nodes) {
          let node = this.nodes[nodeId]
          let { top, left, width, height} = node
          let endTop = top + height
          let endLeft = width + left
          let selectorEndLeft = this.selectingBoxInfo.selectingBoxleft + this.selectingBoxInfo.selectingBoxWidth
          let selectorEndTop = this.selectingBoxInfo.selectingBoxTop + this.selectingBoxInfo.selectingBoxHeight
          let isContainerIn = top >= this.selectingBoxInfo.selectingBoxTop && left >= this.selectingBoxInfo.selectingBoxleft && endTop <= selectorEndTop && endLeft <= selectorEndLeft
          if(isContainerIn) {
            selectedNodes.push(node)
          }
        }
        this.selectNodes(selectedNodes)
      },
      onNodeMouseDown(e) {
        this.mouseDownX = e.clientX
        this.mouseDownY = e.clientY
        this.selectedNodesOriginState = this.getSelectedNodesOriginState(e)
        this.$nextTick(() => this.selectorOriginState = this.getSelectorOriginState(e))
        this.isNodeMouseDown = true
      },
      onStartDrawLink(e, nodeId, callback) {
        this.mouseDownX = e.clientX
        this.mouseDownY = e.clientY
        let linkType = this.getLinkType()
        let arrowType = this.getArrowType()
        let linkWidth = this.getLinkWidth()
        let linkColor = this.getLinkColor()
        let boardRect = this.$refs.drawing_board.getBoundingClientRect()
        let mouseX = e.clientX - boardRect.left
        let mouseY = e.clientY - boardRect.top
        let id = 'link' + Date.now()
        this.isDrawingLinkId = id
        let newLinkInfo = {
          id,
          start: {
            x: mouseX,
            y: mouseY
          },
          end: {
            x: mouseX,
            y: mouseY
          },
          linkType,
          arrowType,
          linkWidth,
          linkColor,
          width: 100,
          height: 100,
          index: 1,
          sourceNodeId: nodeId,
          targetNodeId: ''
        }
        // console.log('board/addLink');
        this.$store.commit('board/addLink', newLinkInfo)
        callback(newLinkInfo)
      },
      updateLinkInfo(infos) {
        if (Array.isArray(infos)) {
          for (let info of infos) {
            this.$store.commit('board/updateLinkInfo', info)
          }
        } else {
          this.$store.commit('board/updateLinkInfo', infos)
        }
      },
      getLinkType() {
        return 'straightlink'
      },
      getArrowType() {
        return 'solidArrow'
      },
      getLinkWidth() {
        return 2
      },
      getLinkColor() {
        return '#000'
      },
      getSelectorOriginState(e) {
        let rect = this.$refs.select_box.getBoundingClientRect()
        let offsetX = e.clientX - rect.left
        let offsetY = e.clientY - rect.top
        return {
          top: this.selectBoxInfo.top,
          left: this.selectBoxInfo.left,
          width: this.selectBoxInfo.width,
          height: this.selectBoxInfo.height,
          offsetX,
          offsetY
        }
      },
      moveNodes(event) {
        this.updateSelectorPosition(event)
        this.updateSelectedNodesPosition(event)
      },
      updateSelectorPosition(e) {
          let { offsetX, offsetY } = this.selectorOriginState
          let boardRect = this.$refs.drawing_board.getBoundingClientRect()
          let mouseX = e.clientX - boardRect.left
          let mouseY = e.clientY - boardRect.top
          this.selectBoxInfo.left = mouseX - offsetX
          this.selectBoxInfo.top = mouseY - offsetY
          // console.log(e.target);
          // console.log(this.selectorOriginState);
      },
      updateSelectedNodesPosition(e) {
        let boardRect = this.$refs.drawing_board.getBoundingClientRect()
        let mouseX = e.clientX - boardRect.left
        let mouseY = e.clientY - boardRect.top
        for(let node of this.selectedNodesOriginState) {
          let { offsetX, offsetY, id, inLinks, outLinks } = node
          let top = mouseY - offsetY
          let left = mouseX - offsetX
          this.updateNodeInfo({
            id,
            top,
            left
          })

          for (let linkInfo of inLinks) {
            let { id, offsetX, offsetY } = linkInfo
            let tmpInfo = {
              id,
              end: {
                x: left + offsetX,
                y: top + offsetY
              }
            }
            this.updateLinkInfo(tmpInfo)
          }

          for (let linkInfo of outLinks) {
            let { id, offsetX, offsetY } = linkInfo
            let tmpInfo = {
              id,
              start: {
                x: left + offsetX,
                y: top + offsetY
              }
            }
            console.log(left + offsetX, top + offsetY);
            
            this.updateLinkInfo(tmpInfo)
          }
          // this.drawLink(this.linkInfo)
          

          
        }
      },
      getNodeUnderTheMouse(x, y) {
        let tmpNodeInfo
        // console.log(this.nodes);
        for(let nodeId in this.nodes) {
          let nodeInfo = this.nodes[nodeId]
          let { top, left, width, height } = nodeInfo
          if(x >= left && x <= left + width && y >= top && y <= top + height) {
            let element1 = this.$refs[nodeId][0].$el
            if(!tmpNodeInfo) {
              tmpNodeInfo = nodeInfo
            }else {
              let element2 = this.$refs[tmpNodeInfo.id][0].$el
              let index1 = tmpNodeInfo.index
              let index2 = nodeInfo.index
              if(index2 > index1) {
                tmpNodeInfo = nodeInfo
              }
              if(index2 > index1 || (index2 == index1 && element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_PRECEDING)) {
                tmpNodeInfo = nodeInfo
              }
            }
          }

        }
        // console.log(tmpNodeInfo);
        return tmpNodeInfo
        // console.log(this.$refs[tmpNodeInfo.id][0].$el);
      },
      getLinkUnderTheMouse(x, y) {
        let tmpLinkInfo
        // console.log(this.links);
        for(let linkId in this.links) {
          let linkInfo = this.links[linkId]
          let { top, left, width, height } = linkInfo
          if(x >= left && x <= left + width && y >= top && y <= top + height) {
            let element1 = this.$refs[linkId][0].$el
            if(!tmpLinkInfo) {
              tmpLinkInfo = linkInfo
            }else {
              let element2 = this.$refs[tmpLinkInfo.id][0].$el
              let index1 = tmpLinkInfo.index
              let index2 = linkInfo.index
              if(index2 > index1) {
                tmpLinkInfo = linkInfo
              }
              if(index2 > index1 || (index2 == index1 && element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_PRECEDING)) {
                tmpLinkInfo = linkInfo
              }
            }
          }

        }
        // console.log(tmpLinkInfo);
        return tmpLinkInfo
        // console.log(this.$refs[tmpNodeInfo.id][0].$el);
      },
      getElUnderTheMouse(x, y) {
        let result;
        let underMouseLinkInfo = this.getLinkUnderTheMouse(x, y);
        let underMouseNodeInfo = this.getNodeUnderTheMouse(x, y);
        if(underMouseLinkInfo && underMouseNodeInfo) {
          let index1 = underMouseNodeInfo.index
          let index2 = underMouseLinkInfo.index
          if(index1 > index2) {
            result = underMouseNodeInfo
          }else if(index1 < index2) {
            result = underMouseLinkInfo
          }else {
            let element1 = this.$refs[underMouseNodeInfo.id][0].$el
            let element2 = this.$refs[underMouseLinkInfo.id][0].$el
            if(element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_PRECEDING) {
              result = element1
            }else {
              result = element2
            }
          }
        }else if(underMouseLinkInfo) {

        }
      },
      // drawLink(e) {
      //   let boardRect = this.$refs.drawing_board.getBoundingClientRect()
      //   let mouseX = e.clientX - boardRect.left
      //   let mouseY = e.clientY - boardRect.top
      //   let id = this.isDrawingLinkId
      //   let end
      //   this.$refs[id][0].$el.childNodes[0].style.pointerEvents = 'none'
      //   let underneathElement = document.elementFromPoint(e.clientX, e.clientY)
      //   this.$refs[id][0].$el.childNodes[0].style.pointerEvents = 'auto'
      //   if (underneathElement.classList.contains('node')) {
      //     end = this.getNearestNodeLinkPoint(e, underneathElement)
      //     console.log(end);
          
      //   } else {
      //     end = {
      //       x: mouseX,
      //       y: mouseY
      //     }
      //   }
      //   console.log(end);
        
      //   this.$store.commit('board/updateLinkInfo', {
      //     id,
      //     end
      //   })
      // },
      // getNearestNodeLinkPoint(e, underneathElement) {
      //   let nodeId = underneathElement.id
      //   let nodeCom = this.$refs[nodeId][0]
      //   let ctx = underneathElement.getContext('2d')
      //   let boardRect = this.$refs.drawing_board.getBoundingClientRect()
      //   let mouseX = e.clientX - boardRect.left
      //   let mouseY = e.clientY - boardRect.top
      //   let rect = nodeCom.$el.getBoundingClientRect();
      //   let offsetX = e.clientX - rect.left;
      //   let offsetY = e.clientY - rect.top;
      //   let nodeInfo = this.nodes[nodeId]
      //   let isOnBorder = ctx.isPointInStroke(offsetX, offsetY)
      //   if (isOnBorder) {
      //     return {
      //       x: mouseX,
      //       y: mouseY
      //     }
      //   } else {
      //     let closestNodeCoord = this.findClosestNode(nodeInfo.dots, { x: offsetX, y: offsetY })
      //     console.log(11,closestNodeCoord);
      //     console.log(22,rect);
          
      //     return {
      //       x: rect.left + closestNodeCoord.x - boardRect.left,
      //       y: rect.top + closestNodeCoord.y - boardRect.top
      //     }
      //   }
      // },
      // findClosestNode(nodes, point) {
      //   let closestNode = null;
      //   let minDistance = Infinity;

      //   nodes.forEach(node => {
      //     // 计算每个节点与给定点的距离
      //     const distance = Math.sqrt(
      //       Math.pow(node.x - point.x, 2) + Math.pow(node.y - point.y, 2)
      //     );

      //     // 比较距离，找到最近的节点
      //     if (distance < minDistance) {
      //       minDistance = distance;
      //       closestNode = node;
      //     }
      //   });

      //   return {
      //     x: closestNode.x,
      //     y: closestNode.y
      //   };
      // }
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