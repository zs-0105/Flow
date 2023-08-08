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
        <li class="flow_toolbar_item" style="padding:0" :class="{disable:disableOpt['fontFamily']}">
          <my-dropdown ref="fontFamilyRef" :defaultActive="9" dropWidth="200px" dropHeight="380px" :options="fontFamilyOptions" :disabled="disableOpt['fontFamily']"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="字号" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['fontSize']}">
          <pixel-input :disabled="disableOpt['fontSize']"></pixel-input>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="加粗(Ctrl+B)" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['bold'], active: !disableOpt['bold'] && isBold}" @click="toggle('isBold', disableOpt['bold'])">
          <svg-icon icon-class="bold" :style="{color : disableOpt['bold']? '#ccc' : '#000'}" class="iconSize"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="倾斜(Ctrl+I)" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['lean'], active: !disableOpt['lean'] && isLean}" @click="toggle('isLean', disableOpt['lean'])">
          <svg-icon icon-class="lean" :style="{color : disableOpt['lean']? '#ccc' : '#000'}" class="iconSize"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="下划线(Ctrl+U)" placement="bottom">
        <li class="flow_toolbar_item" :class="{disable:disableOpt['underline'], active: !disableOpt['underline'] && isUnderline}" @click="toggle('isUnderline', disableOpt['underline'])">
          <svg-icon icon-class="underline" :style="{color : disableOpt['underline']? '#ccc' : '#000'}" class="iconSize"/>
        </li>
      </el-tooltip>

      <li class="flow_toolbar_item relative" ref="colorPicker" :class="{disable:disableOpt['fontColor'], active: !disableOpt['fontColor'] && isFontColor}" @click="toggle('isFontColor', disableOpt['fontColor'])">
        <div class="color_wrap">
        <el-tooltip effect="dark" :enterable="false" content="字体颜色" placement="bottom">
          <svg-icon icon-class="fontColor" :style="{color : disableOpt['fontColor']? '#ccc' : '#000'}" class="fontColorIconSize"/>
        </el-tooltip>
        <div class="color_show"></div>
          <my-color-picker :show="isFontColor"></my-color-picker>
        </div>
      </li>

      <el-tooltip effect="dark" :enterable="false" content="文本行高" placement="bottom">
        <li class="flow_toolbar_item" style="padding:0" :class="{disable:disableOpt['lineHeight']}">
          <my-dropdown ref="lineHeightRef" width="50px" type="icon" iconClass="lineHeight" :defaultActive="2" dropWidth="120px" dropHeight="185px" :options="lineHeightOptions" :disabled="disableOpt['lineHeight']"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="文本对齐" placement="bottom">
        <li class="flow_toolbar_item" style="padding:0" :class="{disable:disableOpt['textAlign']}">
          <my-dropdown ref="textAlignRef" width="50px" textAlign="left" type="icon" iconClass="alignCenter" :defaultActive="2" dropWidth="180px" dropHeight="205px" :options="textAlignOptins" :disabled="disableOpt['textAlign']"/>
        </li>
      </el-tooltip>

      <li class="flow_toolbar_item relative" ref="colorPicker2" :class="{disable:disableOpt['colorFill'], active: !disableOpt['colorFill'] && isColorFill}" @click="toggle('isColorFill', disableOpt['colorFill'])">
        <div class="color_wrap">
        <el-tooltip effect="dark" :enterable="false" content="颜色填充" placement="bottom">
          <svg-icon icon-class="colorFill" :style="{color : disableOpt['colorFill']? '#ccc' : '#000'}" class="iconSize"/>
        </el-tooltip>
        <div class="color_show"></div>
          <my-color-picker :show="isColorFill"></my-color-picker>
        </div>
      </li>

      <li class="flow_toolbar_item relative" ref="colorPicker3" :class="{disable:disableOpt['lineColor'], active: !disableOpt['lineColor'] && isLineColor}" @click="toggle('isLineColor', disableOpt['lineColor'])">
        <div class="color_wrap">
        <el-tooltip effect="dark" :enterable="false" content="连线颜色" placement="bottom">
          <svg-icon icon-class="lineColor" :style="{color : disableOpt['lineColor']? '#ccc' : '#000'}" class="iconSize"/>
        </el-tooltip>
        <div class="color_show"></div>
          <my-color-picker :show="isLineColor"></my-color-picker>
        </div>
      </li>

      <el-tooltip effect="dark" :enterable="false" content="连线宽度" placement="bottom">
        <li class="flow_toolbar_item" style="padding:0" :class="{disable:disableOpt['lineWidth']}">
          <my-dropdown ref="lineWidthRef" width="50px" type="icon" :iconClass="disableOpt['lineWidth']?'lineWidthDisabled':'lineWidth'" :defaultActive="2" dropWidth="120px" dropHeight="185px" :options="lineWidthOptions" :disabled="disableOpt['lineWidth']"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="连线样式" placement="bottom">
        <li class="flow_toolbar_item" style="padding:0" :class="{disable:disableOpt['lineStyle']}">
          <my-dropdown ref="lineStyleRef" width="50px" textAlign="left" type="icon" iconClass="lineStyle" :defaultActive="2" dropWidth="145px" dropHeight="130px" :options="lineStyleOptions" :disabled="disableOpt['lineStyle']"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="连线类型" placement="bottom">
        <li class="flow_toolbar_item" style="padding:0" :class="{disable:disableOpt['lineType']}">
          <my-dropdown ref="lineTypeRef" @currentChange="lineTypeChange" width="50px" type="icon" textAlign="left" :iconClass="lineType" :defaultActive="2" dropWidth="145px" dropHeight="130px" :options="lineTypeOptions" :disabled="disableOpt['lineType']"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="开始箭头" placement="bottom">
        <li class="flow_toolbar_item" style="padding:0" :class="{disable:disableOpt['startArrow']}">
          <my-dropdown ref="startArrowRef" @currentChange="startArrowChange" width="50px" type="icon" textAlign="left" :iconClass="startArrow" :defaultActive="0" dropWidth="145px" dropHeight="130px" :options="startArrowOptions" :disabled="disableOpt['startArrow']"/>
        </li>
      </el-tooltip>

      <el-tooltip effect="dark" :enterable="false" content="结束箭头" placement="bottom">
        <li class="flow_toolbar_item" style="padding:0" :class="{disable:disableOpt['endArrow']}">
          <my-dropdown ref="endArrowRef" @currentChange="endArrowChange" width="50px" type="icon" textAlign="left" :iconClass="endArrow" :defaultActive="1" dropWidth="145px" dropHeight="130px" :options="endArrowOptions" :disabled="disableOpt['endArrow']"/>
        </li>
      </el-tooltip>
    </ul>

  </div>
</template>

<script>
import MyDropdown from "@/components/MyDropdown.vue";
import PixelInput from "@/components/PixelInput.vue"
import MyColorPicker from "@/components/MyColorPicker.vue"
  export default {
    components: {
      MyDropdown,
      PixelInput,
      MyColorPicker,
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
          fontSize: false,
          bold: false,
          lean: false,
          underline: false,
          fontColor: false,
          lineHeight: false,
          textAlign: false,
          colorFill: false,
          lineColor: false,
          lineWidth: false,
          lineStyle: false,
          lineType: false,
          startArrow: false,
          endArrow: false
        },
        isBold: true,
        isLean: true,
        isUnderline: true,
        isFontColor: false,
        isFontColor: false,
        isColorFill: false,
        isLineColor: false,
        lineType: 'directLine',
        startArrow: 'line',
        endArrow: 'arrowRight',
        fontFamilyOptions: [
          { value: '思源宋体', label: '思源宋体', svg: 'siyuansongti.bb81b7ac' },
          { value: '阿里巴巴普惠', label: '阿里巴巴普惠', svg: 'alibabapuhui.ba134251' },
          { value: '苍耳与墨', label: '苍耳与墨', svg: 'cangeryumo.86210363' },
          { value: 'Beau', label: 'Beau', svg: 'Beau.47524f60' },
          { value: 'Bertha', label: 'Bertha', svg: 'Bertha.1a53de7f' },
          { value: 'Brela', label: 'Brela', svg: 'Brela.b366b384' },
          { value: '黑体', label: '黑体' },
          { value: '楷体', label: '楷体' },
          { value: '宋体', label: '宋体' },
          { value: '微软雅黑', label: '微软雅黑'},
          { value: 'Arial', label: 'Arial' },
          { value: 'Times New Roman', label: 'Times New Roman' },
          { value: 'Comic Sans MS', label: 'Comic Sans MS' },
          { value: 'Courier New', label: 'Courier New' },
          { value: 'Verdana', label: 'Verdana' },
          { value: 'Garamond', label: 'Garamond' },
          { value: 'Georgia', label: 'Georgia' },
          { value: 'Impact', label: 'Impact' },
          { value: 'Tahoma', label: 'Tahoma' },
          { value: 'Lucida Console', label: 'Lucida Console' },
        ],
        lineHeightOptions: [
          {value: 1.0, label: 1.0},
          {value: 1.25, label: 1.25},
          {value: 1.5, label: 1.5},
          {value: 2.0, label: 2.0},
          {value: 2.5, label: 2.5},
          {value: 3.0, label: 3.0}
        ],
        textAlignOptins: [
          {value: 'left', label: '左对齐', icon: 'alignLeft'},
          {value: 'center', label: '水平居中', icon: 'alignCenter'},
          {value: 'right', label: '右对齐', icon: 'alignRight'},
          {value: 'top', label: '顶端对齐', icon: 'verticalAlignTop'},
          {value: 'middle', label: '垂直居中对齐', icon: 'verticalAlignMiddle'},
          {value: 'bottom', label: '底端对齐', icon: 'alignBottom'},
        ],
        lineWidthOptions: [
          {value: 0, label: '0px'},
          {value: 0.5, label: '0.5px'},
          {value: 1, label: '1px'},
          {value: 1.5, label: '1.5px'},
          {value: 2, label: '2px'},
          {value: 3, label: '3px'},
          {value: 4, label: '4px'},
          {value: 5, label: '5px'},
          {value: 6, label: '6px'},
          {value: 8, label: '8px'},
          {value: 10, label: '10px'},
        ],
        lineStyleOptions: [
          {value: "straightLine", label: '—————'},
          {value: "dottedLine", label: '-------------'},
          {value: "pointLine", label: '·······················'},
          {value: "pointDottedLine", label: '-·-·-·-·-·-·-·-·'}
        ],
        lineTypeOptions: [
          { value: 'directLine', svg: 'directLine', iconSizeClass: 'iconSize3'},
          { value: 'polyLine', svg: 'polyLine', iconSizeClass: 'iconSize4'},
          { value: 'curveLine', svg: 'curveLine', iconSizeClass: 'iconSize3'},
        ],
        startArrowOptions: [
          { value: 'line', svg: 'line', iconSizeClass: 'iconSize3'},
          { value: 'arrowLeft', svg: 'arrowLeft', iconSizeClass: 'iconSize3'},
          { value: 'left', svg: 'left', iconSizeClass: 'iconSize3'},
        ],
        endArrowOptions: [
          { value: 'line', svg: 'line', iconSizeClass: 'iconSize3'},
          { value: 'arrowRight', svg: 'arrowRight', iconSizeClass: 'iconSize3'},
          { value: 'right', svg: 'right', iconSizeClass: 'iconSize3'},
        ]
      }
    },
    mounted(){
      // 点击下拉框外部区域时隐藏下拉框
    document.addEventListener('click', (e) => {
      if (!this.$refs.colorPicker.contains(e.target)) {
        this.isFontColor = false
      }
      if (!this.$refs.colorPicker2.contains(e.target)) {
        this.isColorFill = false
      }
      if (!this.$refs.colorPicker3.contains(e.target)) {
        this.isLineColor = false
      }
    });
    },
    methods: {
      // 转换属性:加粗、倾斜、下划线
      toggle(key, disabled) {
        if(disabled) return;
        this[key] = !this[key]
      },
      lineTypeChange(opt) {
        this.lineType = opt.value
      },
      startArrowChange(opt) {
        this.startArrow = opt.value
      },
      endArrowChange(opt) {
        this.endArrow = opt.value
      }
    },
    computed:{
    }
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
      // height: 18px !important;
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
.relative{
  position: relative;
}
.color_wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.color_show {
  margin-top: 2px;
  width: 18px;
  height: 5px;
  border: 1px solid #f2f4f6;
  border-radius: 2px;
  background-color: #fff;
}
.fontColorIconSize {
  width: 14px !important;
}
</style>