<template>
  <div class="select-wrapper" :class="{active:showOptions}" :style="{width}" ref="wrapper">
    <div class="select-header" @click="toggleOptions">
      <div v-if="type == 'text'" style="width:100%" class="ellipsis header_text" :class="{disableColor:disabled}">{{ options[currentIndex].label }}</div>
      <div v-else style="width:100%">
        <svg-icon :icon-class="iconClass" :style="{color : disabled? '#ccc' : '#000'}" class="iconSize1"/>
      </div>
      <i :class="`arrow-icon ${showOptions ? 'active' : ''} ${disabled ? 'disableBorderColor' : ''}`"></i>
    </div>
    <ul class="select-options" :style="{width:dropWidth,height:dropHeight}" v-show="showOptions">
      <li v-for="(option, index) in options" :key="index" :style="{'text-align': textAlign}" @click="selectOption(option,index)">
        <i class="el-icon-check" v-show="currentIndex == index"></i>
        <div class="dropdown_content">
          <svg-icon v-if="option.icon" :icon-class="option.icon" class="iconSize1"/>
          <div v-if="option.svg" class="svg_wrap"><svg-icon  :icon-class="option.svg" :class="option.iconSizeClass?option.iconSizeClass:'iconSize2'"/></div>
          <span v-else :style="{'font-family':option.label}" class="font_wrap">{{option.label}}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showOptions: false,
      selectedOption: {},
      currentIndex: 0,
    };
  },
  props:{
    disabled:{
      type:Boolean,
      default:false
    },
    width:{
      type:String,
      default:'100px'
    },
    dropWidth:{
      type:String,
      default:'180px'
    },
    dropHeight:{
      type:String,
      default:''
    },
    textAlign:{
      type:String,
      default:'center'
    },
    options:{
      type:Array,
      default:[]
    },
    defaultActive:{
      type:Number,
      default:0
    },
    type:{
      type:String,
      default:'text'
    },
    iconClass:{
      type:String
    },
  },
  methods: {
    toggleOptions() {
      if(this.disabled) return;
      this.showOptions = !this.showOptions;
    },
    selectOption(option,index) {
      this.selectedOption = option;
      this.showOptions = false;
      this.currentIndex = index;
      this.$emit('currentChange', option, index)
    },
  },
  mounted() {
    // 点击下拉框外部区域时隐藏下拉框
    document.addEventListener('click', (e) => {
      if (!this.$refs.wrapper.contains(e.target)) {
        this.showOptions = false;
      }
    });
    // 默认选中第一个选项
    this.selectedOption = this.options[0];
    this.currentIndex = this.defaultActive;
  },
};
</script>

<style scoped>
.select-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 5px;
  border-radius: 5px;
}
.select-header {
  padding-right: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  position: relative;
}
.header_text{
  text-align: center;
  font-size: 15px;
}
.arrow-icon {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 5px;
  border-style: solid;
  border-width: 6px 4px 0 4px;
  border-color: #000 transparent transparent transparent;
  transition: transform 0.2s ease;
  position: absolute;
  top: calc(50% - 3px);
  right: 5px;
}
.arrow-icon.active {
  transform: rotate(180deg);
}
.select-options {
  position: absolute;
  top: 100%;
  left: calc(-50% + 10px);
  z-index: 99999999999;
  margin: 0;
  padding: 6px;
  list-style: none;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: auto;
  box-shadow: 0 4px 10px 0 rgba(0,0,0,.1);
}
.select-options li {
  width: 100%;
  padding: 5px 10px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  position: relative;
  border-radius: 5px;
}
.select-options li .dropdown_content{
  width: 100%;
}
.select-options li .el-icon-check{
  position: absolute;
  top: calc(50% - 8px);
  right: 5px;
}
.select-options li:hover {
  background-color: #F3F5F9;
}

.el-icon-check
.svg_wrap{
  margin: 0 10px;
  display: inline-block;
  width: 100px;
}
.iconSize1{
  width: 20px !important;
  height: 20px !important;
}
.iconSize2{
  width: 100px !important;
}
.iconSize3{
  width: 100px !important;
  height: 25px !important;
}
.iconSize4{
  width: 100px !important;
  height: 30px !important;
}
.font_wrap{
  display: inline-block;
  margin: 0 10px;
  font-size: 13px;
}
.disableBorderColor{
  border-color: #ccc transparent transparent transparent !important;
}
</style>
