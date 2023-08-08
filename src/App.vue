<template>
  <div id="FLOW">
    <Main></Main>
  </div>
</template>
<script>
import Main from './views/Main.vue'
  export default {
    components: {
      Main
    },
    data () {
      return {}
    },
    methods: {},
  }
</script>

<style lang="scss">
@import url('../src/assets/css/common.css');
body {
  width: 100vw;
  height: 100vh;
}
#FLOW {
  width: 100%;
  height: 100%;
  text-align: center;
  color: #2c3e50;
  background-color: #F6F7F8;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
