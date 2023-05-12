<template>
  <div class='container'>
    <ul class="flow_toolbar_left">
      <li class="flow_toolbar_item">
        <svg-icon icon-class="back"  class="redo_icon"/>
      </li>
      
    </ul>

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
.el-menu{
  height: 100%;
}
.el-menu--horizontal>.el-menu-item{
  height: 40px;
  line-height: 40px;
}
.el-menu--horizontal>.el-menu-item.is-active {
  border-bottom: none;
}
.redo_icon{
  width: 20px;
  height: 20px;
}
</style>