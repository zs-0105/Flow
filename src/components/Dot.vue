<template>
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
</template>

<script>
  export default {
    components: {},
    data () {
      return {}
    },
    methods: {},
  }
</script>

<style scoped>
  /* @import url(); 引入公共css类 */

</style>