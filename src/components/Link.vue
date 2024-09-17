<template>
  <div class='link_container' :id="id"
    :style="{
        top: top + 'px',
        left: left + 'px',
        width: width + 'px',
        height: height + 'px',
        'z-index': index
      }"
    >
    <!-- @mousemove="onLinkMousemove" -->
    <canvas class="canvas_link" ref="link" @click="onLinkClick" @mousemove="onLinkMousemove" @dblclick="onLinkDblclick" @mousedown="onLinkMouseDown"></canvas>
    <textarea class="link_text_input" ref="textInput" v-show="showEditor"
      @blur="textInputBlur"
      @input="inputText"
      @keydown="inputKeyDown"
      :style="{
        top: editorY + 'px',
        left: editorX + 'px',
        width: editorWidth ? editorWidth + 'px' : '',
        height: editorHeight ? editorHeight + 'px' : ''
      }"
    > </textarea>
    <div class="link_text" 
      v-for="(item, id) in linkInfo.texts" 
      :key="id" :id="id" 
      :style="{left: item.x + 'px', top: item.y + 'px'}"
      @dblclick="textDblClick(id, $event)"
      v-show="item.showText"
      v-html="item.value.replace(/\n/g, '<br/>')"
      >
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
  const ELPADDING = 10
  const EDITORDEFAULTWIDTH = 100
  const EDITORDEFAULTHEIFHT = 18
  const EDITORPADDING = 5
  const FONTSIZE = 15
  export default {
    components: {},
    props: {
        linkInfo: {
          type: Object,
          required: true,
        }
    },
    computed: {
      ...mapState('board', ['mouseInfo']),
      id() {
        return this.linkInfo.id
      },
      top() {
        let startPointTop = this.linkInfo.start.y
        let endPointTop = this.linkInfo.end.y
        let mintop = Math.min(startPointTop, endPointTop)
        return mintop - ELPADDING
      },
      left() {
        let startPointLeft = this.linkInfo.start.x
        let endPointLeft = this.linkInfo.end.x
        let minleft = Math.min(startPointLeft, endPointLeft)
        return minleft - ELPADDING
      },
      width() {
        let startPointLeft = this.linkInfo.start.x
        let endPointLeft = this.linkInfo.end.x
        let maxleft = Math.max(startPointLeft, endPointLeft)
        return maxleft - this.left + ELPADDING
      },
      height() {
        let startPointTop = this.linkInfo.start.y
        let endPointTop = this.linkInfo.end.y
        let maxtop = Math.max(startPointTop, endPointTop)
        return maxtop - this.top + ELPADDING
      },
      index() {
        return this.linkInfo.index
      },
      // cursor() {
      //   if(this.isMouseNearStart || this.isMouseNearEnd) return 'move'
      //   console.log(this.isNearLink && !this.isDrawIng ? 'pointer' : 'default');
      //   return this.isNearLink && !this.isDrawIng ? 'pointer' : 'default'
      // }
    },
    data () {
      return {
        padding: 4,
        showEditor: false,
        editorX: 0,
        editorY: 0,
        editorMapId: '',
        editorWidth: 0,
        editorHeight: 0,
        isNearLink: false,
        isDrawIng: true,
        newTextCoordsPercentage: {
          px: 0,
          py: 0
        },
        editorInitX: 0,
        editorInitY: 0,
        isMouseNearStart: false,
        isMouseNearEnd: false
      }
    },
    mounted() {
      // this.drawLink(this.linkInfo)
      this.setEvent()
    },
    watch: {
      linkInfo: {
        handler(newval) {
          this.drawLink(newval)
        },
        deep: true
      },
      isDrawIng: {
        handler(newval) {
          this.$store.commit('board/updateMouseInfo', {
            isDrawingLink: newval,
          })
        }
      }
    },
    methods: {
      setEvent() {
        document.addEventListener('mousemove', (e) => {
          if(this.isDrawIng) {
            let boardRect = this.$parent.$refs.drawing_board.getBoundingClientRect()
            let mouseX = e.clientX - boardRect.left
            let mouseY = e.clientY - boardRect.top
            let id = this.linkInfo.id
            this.$refs.link.style.pointerEvents = 'none'
            let underneathElement = document.elementFromPoint(e.clientX, e.clientY)
            if (underneathElement && underneathElement.classList.contains('canvas_link')) {
              underneathElement.style.pointerEvents = 'none'
            }
            if(this.isMouseNearStart) {
              let start
              if (underneathElement && underneathElement.classList.contains('node')) {
                start = this.getNearestNodeLinkPoint(e, underneathElement)
              } else {
                start = {
                  x: mouseX,
                  y: mouseY
                }
              }
              this.$store.commit('board/updateLinkInfo', {
                id,
                start
              })
            }else{
              let end
              if (underneathElement && underneathElement.classList.contains('node')) {
                end = this.getNearestNodeLinkPoint(e, underneathElement)
              } else {
                end = {
                  x: mouseX,
                  y: mouseY
                }
              }
              this.$store.commit('board/updateLinkInfo', {
                id,
                end
              })
            }
            // this.drawLink(this.linkInfo)
          }
        })
        document.addEventListener('mouseup', (e) => {
          if (this.isDrawIng) {
            let underneathElement = document.elementFromPoint(e.clientX, e.clientY)
            console.log(underneathElement);
            if (underneathElement && underneathElement.classList.contains('node')) {
              let nodeId = underneathElement.id
              let nodeInfo = this.$parent.nodes[nodeId]
              if (!this.isMouseNearStart) {
                let inLinks = JSON.parse(JSON.stringify(nodeInfo.inLinks))
                let existIndex = inLinks.findIndex(i => i.id == this.id)
                if (existIndex >= 0) {
                  inLinks[existIndex] = {
                    id: this.id,
                    offsetX: this.linkInfo.end.x - nodeInfo.left,
                    offsetY: this.linkInfo.end.y - nodeInfo.top
                  }
                } else {
                  inLinks.push({
                    id: this.id,
                    offsetX: this.linkInfo.end.x - nodeInfo.left,
                    offsetY: this.linkInfo.end.y - nodeInfo.top
                  })
                }
                console.warn('board/updateNodeInfo');
                // 删除旧连接node中inlink
                if (this.linkInfo.targetNodeId && nodeId !== this.linkInfo.targetNodeId) {
                  debugger
                  console.log(this.linkInfo , this.$parent.links[this.id]);
                  
                  let oldInlinks = JSON.parse(JSON.stringify(this.$parent.nodes[this.linkInfo.targetNodeId].inLinks))
                  let index = oldInlinks.findIndex(i => i.id == this.id)
                  oldInlinks.splice(index, 1)
                  this.$store.commit('board/updateNodeInfo', {
                    id: this.linkInfo.targetNodeId,
                    inLinks: oldInlinks
                  })
                }
                this.$store.commit('board/updateNodeInfo', {
                  id: nodeId,
                  inLinks
                })
                this.$store.commit('board/updateLinkInfo', {
                  id: this.id,
                  targetNodeId: nodeId
                })
              } else {
                let outLinks = JSON.parse(JSON.stringify(nodeInfo.outLinks))
                let existIndex = outLinks.findIndex(i => i.id == this.id)
                if (existIndex >= 0) {
                  outLinks[existIndex] = {
                    id: this.id,
                    offsetX: this.linkInfo.start.x - nodeInfo.left,
                    offsetY: this.linkInfo.start.y - nodeInfo.top
                  }
                } else {
                  outLinks.push({
                    id: this.id,
                    offsetX: this.linkInfo.start.x - nodeInfo.left,
                    offsetY: this.linkInfo.start.y - nodeInfo.top
                  })
                }
                console.warn('board/updateNodeInfo');
                // 删除旧连接node中outlink
                if (this.linkInfo.sourceNodeId && nodeId !== this.linkInfo.sourceNodeId) {
                  let oldOutlinks = JSON.parse(JSON.stringify(this.$parent.nodes[this.linkInfo.sourceNodeId].outLinks))
                  let index = oldOutlinks.findIndex(i => i.id == this.id)
                  oldOutlinks.splice(index, 1)
                  this.$store.commit('board/updateNodeInfo', {
                    id: this.linkInfo.sourceNodeId,
                    outLinks: oldOutlinks
                  })
                }
                this.$store.commit('board/updateNodeInfo', {
                  id: nodeId,
                  outLinks
                })
                this.$store.commit('board/updateLinkInfo', {
                  id: this.id,
                  sourceNodeId: nodeId
                })
              }
            } else {
              // 断连
              if (!this.isMouseNearStart) {
                let targetNodeId = this.$parent.links[this.id].targetNodeId
                if (targetNodeId) {
                  let nodeInfo = this.$parent.nodes[targetNodeId]
                  let inLinks = JSON.parse(JSON.stringify(nodeInfo.inLinks))
                  let existIndex = inLinks.findIndex(i => i.id == this.id)
                  if (existIndex >= 0) {
                    inLinks.splice(existIndex, 1)
                  }
                  this.$store.commit('board/updateNodeInfo', {
                    id: targetNodeId,
                    inLinks
                  })
                } 
                this.$store.commit('board/updateLinkInfo', {
                  id: this.id,
                  targetNodeId: ''
                })
              } else {
                let sourceNodeId = this.$parent.links[this.id].sourceNodeId
                if (sourceNodeId) {
                  let nodeInfo = this.$parent.nodes[sourceNodeId]
                  let outLinks = JSON.parse(JSON.stringify(nodeInfo.outLinks))
                  let existIndex = outLinks.findIndex(i => i.id == this.id)
                  if (existIndex >= 0) {
                    outLinks.splice(existIndex, 1)
                  }
                  this.$store.commit('board/updateNodeInfo', {
                    id: sourceNodeId,
                    outLinks
                  })
                }
                this.$store.commit('board/updateLinkInfo', {
                  id: this.id,
                  sourceNodeId: ''
                })
              }
            }
          }
          // if (this.isDrawingLink) {
            setTimeout(() => {
              this.$refs.link.style.pointerEvents = 'auto' 
            });
            this.isDrawIng = false
          // }

        })
        // console.log('mousemove'+this.linkInfo.id);
        // this.$bus.$on('mousemove'+this.linkInfo.id, this.onLinkMousemove)
      },
      drawLink(linkInfo) {
        let canvas = this.$refs.link
        let { start, end, points, startArrowType, endArrowType, linkType, linkWidth, linkColor } = linkInfo
        if(start.x == end.x && start.y == end.y) return;
        canvas.width = this.width;
        canvas.height = this.height;
        switch(linkType) {
          case 'polylink' :

          break;
          case 'curvedlink' :

          break;
          case 'straightlink' :
            this.drawStraightLink(linkInfo, canvas)
          break;
        }
        this.updateTextsPosition()
      },
      updateTextsPosition() {
        for(let id in this.linkInfo.texts) {
          let textInfo = this.linkInfo.texts[id]
          let value = textInfo.value
          let px = textInfo.px
          let py = textInfo.py
          let { x, y } = this.getTextCoords(px, py, value)
          textInfo.x = x
          textInfo.y = y
        }
      },
      drawStraightLink(info, canvas) {
        let ctx = canvas.getContext('2d');
        let { start, end, linkWidth, startArrowType, endArrowType } = info
        let top = this.top, left = this.left
        const size = 10
        let from = {
          x: start.x - left,
          y: start.y - top
        }
        let to = {
          x: end.x - left,
          y: end.y - top
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = linkWidth;
        // ctx.beginPath();
        // ctx.moveTo(from.x, from.y);
        // ctx.lineTo(to.x, to.y);
        // ctx.stroke();
        // this.drawArrow(ctx, from.x, from.y, to.x, to.y, size)
        // this.drawSolidArrow(ctx, from.x, from.y, to.x, to.y, size)
        this.drawDashedArrow(ctx, from.x, from.y, to.x, to.y, size)
        
      },
      drawArrow(ctx, x1, y1, x2, y2, size) {
        // 计算箭头的角度
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        // 开始绘制主线
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();  // 绘制箭头的主线

        // 绘制箭头的左侧线
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - size * Math.cos(angle - Math.PI / 6),
          y2 - size * Math.sin(angle - Math.PI / 6)
        );
        ctx.stroke();

        // 绘制箭头的右侧线
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - size * Math.cos(angle + Math.PI / 6),
          y2 - size * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();

        // 设置文本样式
        ctx.font = "12px Arial";  // 设置文本字体和大小
        ctx.fillStyle = "black";  // 设置文本颜色
        
        // ctx.closePath(); 不需要了，因为每条路径已经有自己的 beginPath 和 stroke
      },
      drawDashedArrow(ctx, x1, y1, x2, y2, size) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x1, y1)
        ctx.lineTo(
          x2 - size * Math.cos(angle),
          y2 - size * Math.sin(angle)
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - size * Math.cos(angle - Math.PI / 8), 
          y2 - size * Math.sin(angle - Math.PI / 8)
        );
        ctx.stroke();
        ctx.lineTo(
          x2 - size * Math.cos(angle + Math.PI / 8), 
          y2 - size * Math.sin(angle + Math.PI / 8)
        );
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = '#fff'
        ctx.fill();
      },
      drawSolidArrow(ctx, x1, y1, x2, y2, size){
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x1, y1)
        ctx.lineTo(
          x2 - size * Math.cos(angle),
          y2 - size * Math.sin(angle)
        );
        ctx.moveTo(x2, y2);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - size * Math.cos(angle - Math.PI / 8), 
          y2 - size * Math.sin(angle - Math.PI / 8));
        ctx.lineTo(
          x2 - size * Math.cos(angle + Math.PI / 8), 
          y2 - size * Math.sin(angle + Math.PI / 8));
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      },
      onLinkMouseDown(event) {
        if(this.isMouseNearStart || this.isMouseNearEnd) {
          this.isDrawIng = true
        } else {
          this.dispatchEvent(event, 'mousedown')
        }
        return this.isMouseNearStart || this.isMouseNearEnd
      },
      onLinkClick(event) {
        this.dispatchEvent(event, 'click')
      },
      onLinkMousemove(event) {
        // console.log(event);
        if(this.isDrawingLink) {
          return;
        }
        let rect2 = this.$parent.$refs.drawing_board.getBoundingClientRect()
        let mouseX = event.clientX - rect2.left;
        let mouseY = event.clientY - rect2.top;
        let lineStartX = this.linkInfo.start.x
        let lineStartY = this.linkInfo.start.y
        let lineEndX = this.linkInfo.end.x
        let lineEndY = this.linkInfo.end.y
        let { isNearLink } = this.isMouseNearLink(mouseX, mouseY, lineStartX, lineStartY, lineEndX, lineEndY, 10)
        this.isNearLink = isNearLink
        if(!this.isDrawIng) {
          let isNearStart = this.getMouseIsNearPointer(mouseX, mouseY, lineStartX, lineStartY, 10)
          let isNearEnd = this.getMouseIsNearPointer(mouseX, mouseY, lineEndX, lineEndY, 10)
          this.isMouseNearStart = isNearStart
          this.isMouseNearEnd = isNearEnd
        }
        this.dispatchEvent(event, 'mousemove')

        // let cursor = ''
        // if(this.isMouseNearStart || this.isMouseNearEnd) {
        //   cursor = 'move'
        // } else if (this.isNearLink && !this.isDrawIng) {
        //   cursor = 'pointer'
        // }
        this.$store.commit('board/updateMouseInfo', {
          isNearLinkStart: this.isMouseNearStart,
          isNearLinkEnd: this.isMouseNearEnd,
          isDrawingLink: this.isDrawIng,
          isNearLink: this.isNearLink
        })
      },
      getMouseIsNearPointer(mouseX, mouseY, pointX, pointY, threshold) {
          const distance = Math.sqrt((mouseX - pointX) ** 2 + (mouseY - pointY) ** 2);
          return distance <= threshold;
      },
      onLinkDblclick(event) {
        let rect = this.$parent.$refs.drawing_board.getBoundingClientRect()
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let lineStartX = this.linkInfo.start.x
        let lineStartY = this.linkInfo.start.y
        let lineEndX = this.linkInfo.end.x
        let lineEndY = this.linkInfo.end.y
        let { isNearLink , x, y } = this.isMouseNearLink(mouseX, mouseY, lineStartX, lineStartY, lineEndX, lineEndY, 10)
        let isNearStart = this.getMouseIsNearPointer(mouseX, mouseY, lineStartX, lineStartY, 10)
        let isNearEnd = this.getMouseIsNearPointer(mouseX, mouseY, lineEndX, lineEndY, 10)
        if(isNearLink && !isNearStart && !isNearEnd) {
          this.editorMapId = ''
          this.showEditor = true
          this.editorX = x - this.left - EDITORDEFAULTWIDTH / 2
          this.editorY = y - this.top - EDITORDEFAULTHEIFHT / 2
          this.editorInitX = this.editorX
          this.editorInitY = this.editorY
          this.$refs.textInput.value = ''
          this.editorWidth = EDITORDEFAULTWIDTH
          this.editorHeight = EDITORDEFAULTHEIFHT
          this.$nextTick(() => {
            this.$refs.textInput.focus()
          })
          this.newTextCoordsPercentage.px = (x - lineStartX) / (lineEndX - lineStartX)
          this.newTextCoordsPercentage.py = (y - lineStartY) / (lineEndY - lineStartY)
        }
        this.dispatchEvent(event, 'dblclick')
      },
      dispatchEvent(event, type) {
        let ctx = this.$refs.link.getContext('2d');
        let rect = this.$refs.link.getBoundingClientRect();
        let offsetX = event.clientX - rect.left;
        let offsetY = event.clientY - rect.top;
        let isInContent = ctx.isPointInPath(offsetX, offsetY)
        // let isPointInStroke = ctx.isPointInPath(offsetX, offsetY)
        if (!isInContent) {
          this.$refs.link.style.pointerEvents = 'none';
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
          this.$refs.link.style.pointerEvents = 'auto';
        }
      },
      isMouseNearLink(mouseX, mouseY, lineStartX, lineStartY, lineEndX, lineEndY, threshold) {
          const AMX = mouseX - lineStartX;
          const AMY = mouseY - lineStartY;
          const ABX = lineEndX - lineStartX;
          const ABY = lineEndY - lineStartY;

          const dotProduct = AMX * ABX + AMY * ABY;
          const magnitudeAB = Math.sqrt(ABX * ABX + ABY * ABY);

          const projectionLength = dotProduct / magnitudeAB;

          if (projectionLength <= 0) {
            // 鼠标点在线段起点之前
            return Math.sqrt(AMX * AMX + AMY * AMY);
          }

          if (projectionLength >= magnitudeAB) {
            // 鼠标点在线段终点之后
            const BMX = mouseX - lineEndX;
            const BMY = mouseY - lineEndY;
            return Math.sqrt(BMX * BMX + BMY * BMY);
          }
          // 鼠标点在线段中间，计算最近点
          const nearestX = lineStartX + (ABX / magnitudeAB) * projectionLength;
          const nearestY = lineStartY + (ABY / magnitudeAB) * projectionLength;
          // 鼠标点在线段中间，计算垂直距离
          const MMX = AMX - projectionLength * (ABX / magnitudeAB);
          const MMY = AMY - projectionLength * (ABY / magnitudeAB);
          return {
            isNearLink: Math.sqrt(MMX * MMX + MMY * MMY) <= threshold,
            x: nearestX,
            y: nearestY
          };
      },
      inputKeyDown(event) {
          if (event.keyCode === 13 && !event.shiftKey) {
            event.target.blur()
          }
      },
      inputText(event) {
        let value = event.target.value
        if(!this.linkInfo.texts) this.linkInfo.texts = {}
        if(!this.editorMapId) {
          let id = 'text_' + Date.now()
          this.editorMapId = id
          let px = this.newTextCoordsPercentage.px
          let py = this.newTextCoordsPercentage.py
          this.$set(this.linkInfo.texts,id, {
            value,
            px,
            py,
            showText: false
          })
          this.$forceUpdate()
        }else {
          this.$forceUpdate()
          this.linkInfo.texts[this.editorMapId].value = value
          let { width , height } = this.getTextWidthAndHeight(value, FONTSIZE)
          let editorOriginWidth = this.editorWidth
          let editorOriginX = this.editorX
          this.editorHeight = height / 8 * EDITORDEFAULTHEIFHT
          this.editorY = this.editorInitY - (this.editorHeight / 2) + EDITORDEFAULTHEIFHT / 2
          if(width + EDITORPADDING * 2 >= EDITORDEFAULTWIDTH) {
            this.editorWidth = width + EDITORPADDING * 2
            this.editorX = editorOriginX - (width - editorOriginWidth + EDITORPADDING * 2) /  2
          }else {
            this.editorWidth = EDITORDEFAULTWIDTH
          }
          if(this.editorWidth == EDITORDEFAULTWIDTH && editorOriginWidth > EDITORDEFAULTWIDTH) {
            this.editorX = this.editorInitX
            this.editorY = this.editorInitY
          }
        }
      },
      textInputBlur(event) {
        let id = this.editorMapId
        let value = event.target.value
        if(!value && !id) return this.showEditor = false
        if(!value) {
          delete this.linkInfo.texts[id]
          this.showEditor = false
          return;
        }
        this.$forceUpdate();
        this.$nextTick(() => {
          let textInfo = this.linkInfo.texts[id]
          let px = textInfo.px
          let py = textInfo.py
          let { x, y } = this.getTextCoords(px, py, value)
          textInfo.x = x
          textInfo.y = y
          this.$forceUpdate();
        })
        this.showEditor = false
        this.linkInfo.texts[this.editorMapId].showText = true
        this.editorMapId = ''
      },
      getTextCoords(px, py, text) {
        let { x, y } = this.getTextCoordsByPercentage(px, py)
        let { width, height } = this.getTextWidthAndHeight(text, FONTSIZE)
        return {
          x : x - width / 2 + EDITORPADDING * 2,
          y : y - height / 8 * EDITORDEFAULTHEIFHT  / 2 + EDITORPADDING * 2
        }
      },
      getTextCoordsByPercentage(px, py) {
        let x, y
        let startX = this.linkInfo.start.x
        let startY = this.linkInfo.start.y
        let endX = this.linkInfo.end.x
        let endY = this.linkInfo.end.y
        if(endX - startX > 0) {
          x = (endX - startX) * px
        }else {
          x = (endX - startX) * (1 - px)
        }
        if(endY - startY > 0) {
          y = (endY - startY) * py
        }else {
          y = (endY - startY) * (1 - py)
        }
        return { x: Math.abs(x), y: Math.abs(y) }
      },
      getTextWidthAndHeight(text, fontSize) {
        const canvas = this.$refs.link
        const context = canvas.getContext("2d");

        // 设置字体大小
        context.font = `${fontSize}px Arial`;
        
        const lines = text.split('\n'); // 拆分文本为行
        let maxWidth = 0; // 存储最宽的行的宽度

        for (const line of lines) {
          // 测量每一行的宽度
          const lineWidth = context.measureText(line).width;

          // 如果当前行更宽，更新最大宽度
          if (lineWidth > maxWidth) {
            maxWidth = lineWidth;
          }
        }
        return {
          width: maxWidth,
          height: lines.length * 8 
        };
      },
      textDblClick(id, event) {
        let textInfo = this.linkInfo.texts[id]
        let text = textInfo.value
        let { width , height } = this.getTextWidthAndHeight(text)
        let offsetWidth = width + EDITORPADDING * 2 <= EDITORDEFAULTWIDTH ? (EDITORDEFAULTWIDTH - width) / 2 : 0
        this.editorWidth = width + EDITORPADDING * 2 <= EDITORDEFAULTWIDTH ? EDITORDEFAULTWIDTH : width + EDITORPADDING * 2
        this.editorHeight = Math.round(height / 8) * EDITORDEFAULTHEIFHT
        this.showEditor = true
        this.editorX = textInfo.x - offsetWidth
        this.editorY = textInfo.y
        this.$refs.textInput.value = text
        this.editorMapId = id
        textInfo.showText = false
        this.$nextTick(() => {
          this.$refs.textInput.focus()
        })
      },
      getNearestNodeLinkPoint(e, underneathElement) {
        let nodeId = underneathElement.id
        let nodeCom = this.$parent.$refs[nodeId][0]
        let ctx = underneathElement.getContext('2d')
        let boardRect = this.$parent.$refs.drawing_board.getBoundingClientRect()
        let mouseX = e.clientX - boardRect.left
        let mouseY = e.clientY - boardRect.top
        let rect = nodeCom.$el.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let offsetY = e.clientY - rect.top;
        let isOnBorder = ctx.isPointInStroke(offsetX - ELPADDING, offsetY - ELPADDING)
        let nodeInfo = this.$parent.nodes[nodeId]
        if (isOnBorder) {
          return {
            x: mouseX,
            y: mouseY
          }
        } else {
          let closestNodeCoord = this.findClosestNode(nodeInfo.dots, { x: offsetX, y: offsetY })
          return {
            x: rect.left + closestNodeCoord.x - boardRect.left + ELPADDING,
            y: rect.top + closestNodeCoord.y - boardRect.top + ELPADDING
          }
        }
      },
      findClosestNode(nodes, point) {
        let closestNode = null;
        let minDistance = Infinity;

        nodes.forEach(node => {
          // 计算每个节点与给定点的距离
          const distance = Math.sqrt(
            Math.pow(node.x - point.x, 2) + Math.pow(node.y - point.y, 2)
          );

          // 比较距离，找到最近的节点
          if (distance < minDistance) {
            minDistance = distance;
            closestNode = node;
          }
        });

        return {
          x: closestNode.x,
          y: closestNode.y
        };
      }
    },
  }
</script>

<style scoped>
  /* @import url(); 引入公共css类 */
.link_container {
  position: absolute;
  pointer-events: none;
  z-index: 0;
}
.link_container canvas {
  pointer-events: auto;
  background-color: transparent;
  z-index: 0;
}
.link_text_input {
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 18px;
  padding: 0 5px;
  font-size: 15px;
  text-align: center;
  resize: none;
  overflow: hidden;
  border-color: #000;
  pointer-events: none;
}
.link_text {
  position: absolute;
  background: #fff;
  cursor: text;
  font-size: 15px;
  user-select: none;
  pointer-events: none;
}
</style>