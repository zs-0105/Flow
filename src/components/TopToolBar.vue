<template>
  <div class='container'>
    <ul class="flow_toolbar_left">
      <el-tooltip effect="dark" :enterable="false" content="撤销 (Ctr+Z)" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['undo']}">
          <svg-icon icon-class="undo" :style="{color : disableOpt['undo']? '#ccc' : '#000'}"/>
        </li>
      </el-tooltip>
      
      <el-tooltip effect="dark" :enterable="false" content="恢复 (Ctr+Y)" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['redo']}">
          <svg-icon icon-class="redo" :style="{color : disableOpt['redo']? '#ccc' : '#000'}"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="刷格式(Ctr+Shift+C)" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['brush']}">
          <svg-icon icon-class="brush" :style="{color : disableOpt['brush']? '#ccc' : '#000'}" class="iconSize"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="背景颜色" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['bkColor']}">
          <svg-icon icon-class="background" :style="{color : disableOpt['bkColor']? '#ccc' : '#000'}" class="iconSize"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="插入图片(I)" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['insertImg']}">
          <svg-icon icon-class="img" :style="{color : disableOpt['insertImg']? '#ccc' : '#000'}" class="iconSize"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="插入链接(Ctrl+K)" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['insertLink']}">
          <svg-icon icon-class="link" :style="{color : disableOpt['insertLink']? '#ccc' : '#000'}" class="iconSize"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="字体" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['fontFamily']}">
          <my-dropdown :disabled="disableOpt['fontFamily']"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="字号" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['fontSize']}">
          <pixel-input :disabled="disableOpt['fontSize']"></pixel-input>
        </li>
      </el-tooltip>
    </ul>

  </div>
</template>

<script>
import MyDropdown from "@/components/MyDropdown.vue";
import PixelInput from "@/components/PixelInput.vue"
  export default {
    components: {
      MyDropdown,
      PixelInput
    },
    data () {
      return {
        disableOpt:{
          redo: false,
          undo: false,
          brush: false,
          bkColor: false,
          insertImg: false,
          insertLink: false,
          fontFamily: false,
          fontSize: false
        },
      }
    },
    methods: {},
  }
</script>

<style lang="scss" scoped>
  /* @import url(); 引入公共css类 */
/* .el-menu{
  height: 100%;
}
.el-menu--horizontal>.el-menu-item{
  height: 40px;
  line-height: 40px;
}
.el-menu--horizontal>.el-menu-item.is-active {
  border-bottom: none;
} */
.flow_toolbar_left{
  width: 70%;
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .flow_toolbar_item{
    height: 70%;
    padding: 5px;
    margin: 0 10px;
    cursor: pointer;
    border-radius: 5px;
    vertical-align: middle;
    .iconSize{
      width: 18px !important;
      height: 18px !important;
    }
    &:hover{
      background-color: #EAECEE;
    }
  }
  .disable{
    cursor: default !important;
    &:hover{
      background-color: transparent !important;
    }
  }
}

</style>