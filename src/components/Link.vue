<template>
  <div class='link_container' :id="id" :style="{top: top + 'px', left: left + 'px', width: width + 'px', height: height + 'px'}">
    <canvas ref="link"></canvas>
  </div>
</template>

<script>
  const PADDING = 10
  export default {
    components: {},
    props: {
        linkInfo: {
          type: Object,
          required: true
        }
    },
    computed: {
      id() {
        return this.linkInfo.id
      },
      top() {
        let startPointTop = this.linkInfo.start.y
        let endPointTop = this.linkInfo.end.y
        let mintop = Math.min(startPointTop, endPointTop)
        return mintop - PADDING
      },
      left() {
        let startPointLeft = this.linkInfo.start.x
        let endPointLeft = this.linkInfo.end.x
        let minleft = Math.min(startPointLeft, endPointLeft)
        return minleft - PADDING
      },
      width() {
        let startPointLeft = this.linkInfo.start.x
        let endPointLeft = this.linkInfo.end.x
        let maxleft = Math.max(startPointLeft, endPointLeft)
        return maxleft - this.left + PADDING
      },
      height() {
        let startPointTop = this.linkInfo.start.y
        let endPointTop = this.linkInfo.end.y
        let maxtop = Math.max(startPointTop, endPointTop)
        return maxtop - this.top + PADDING
      },
    },
    data () {
      return {
        padding: 4
      }
    },
    mounted() {
      this.drawLink(this.linkInfo)
    },
    watch: {
      linkInfo: {
        handler(newval) {
          this.drawLink(newval)
        },
        deep: true
      },
    },
    methods: {
      drawLink(linkInfo) {
        let canvas = this.$refs.link
        let { start, end, points, startArrowType, endArrowType, linkType, linkWidth, linkColor } = linkInfo
        canvas.width = this.width
        canvas.height = this.height
        switch(linkType) {
          case 'polylink' :

          break;
          case 'curvedlink' :

          break;
          case 'straightlink' :
            this.drawStraightLink(linkInfo, canvas)
          break;
        }
      },
      drawStraightLink(info, canvas) {
        let ctx = canvas.getContext('2d');
        let { start, end, linkWidth, startArrowType, endArrowType } = info
        let top = this.top, left = this.left
        // let canvasRect = canvas.getBoundingClientRect()
        // let boardRect = this.$parent.$el.getBoundingClientRect()
        let from = {
          x: start.x - left,
          y: start.y - top
        }
        let to = {
          x: end.x - left,
          y: end.y - top
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log(from, to);
        console.log(canvas.width, canvas.height);
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowLength = 10; // 箭头长度
        ctx.lineWidth = linkWidth;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        // // 绘制箭头部分
        ctx.lineTo(
          to.x - arrowLength * Math.cos(angle - Math.PI / 6),
          to.y - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
          to.x - arrowLength * Math.cos(angle + Math.PI / 6),
          to.y - arrowLength * Math.sin(angle + Math.PI / 6)
        );

        ctx.stroke();
        ctx.closePath();
      }
    },
  }
</script>

<style scoped>
  /* @import url(); 引入公共css类 */
.link_container {
  position: absolute;
}
</style>