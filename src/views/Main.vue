<template>
  <div class="flow_container">
    <div class="flow_top_tool_bar">
      <top-tool-bar></top-tool-bar>
    </div>
    <div class='flow_main'>
    <split-pane split="vertical" :default-percent="10">
      <template slot="paneL">
        <div class="flow_element"><!-- 拖拽元素列表 -->
          111
        </div>
      </template>
      <template slot="paneR">
        <div class="flow_canvas_info">
            <split-pane split="vertical" :default-percent="90">
            <template slot="paneL">
              <div class="canvans_main">
                  222
              </div>
            </template>
            <template slot="paneR">
              <div class="canvans_info">
                3333
              </div>
            </template>
          </split-pane>
        </div>
      </template>
    </split-pane>
  </div>
  </div>
</template>

<script>
import TopToolBar from '@/components/TopToolBar.vue'
import SplitPane from 'vue-splitpane'
  export default {
    components: {
      SplitPane,
      TopToolBar
    },
    data () {
      return {}
    },
    methods: {},
  }
</script>

<style scoped>
  /* @import url(); 引入公共css类 */
.flow_container{
    width: 100%;
    height: 100%;
}
.flow_top_tool_bar{
  width: 100%;
  height: 40px;
}
.flow_main{
    width: 100%;
    height: calc(100% - 40px);
    border: 1px solid #ccc;
}

.flow_canvas_info{
  width: 100%;
  height: 100%;
}
</style>