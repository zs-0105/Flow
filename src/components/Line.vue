<template>
  <div class='container'>
    <canvas></canvas>
  </div>
</template>

<script>
  export default {
    components: {},
    // props: {
    //     lineInfo: {
    //         type: Object,
    //         required: true
    //     }
    // },
    data () {
      return {
        lineInfo: {
            id: Date.now(),
            start: 001,
            end: 002,
        }
      }
    },
    methods: {},
  }
</script>

<style scoped>
  /* @import url(); 引入公共css类 */

</style>