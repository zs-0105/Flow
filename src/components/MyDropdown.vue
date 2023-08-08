<template>
  <div class="select-wrapper" ref="wrapper">
    <div class="select-header" @click="toggleOptions">
      <div style="width:70px" class="ellipsis" :class="{disableColor:disabled}">{{ options[currentIndex].label }}</div>
      <i :class="`arrow-icon ${showOptions ? 'active' : ''} ${disabled ? 'disableBorderColor' : ''}`"></i>
    </div>
    <ul class="select-options" v-show="showOptions">
      <li v-for="(option, index) in options" :key="index" @click="selectOption(option,index)">
        <i class="el-icon-check" v-show="currentIndex == index"></i>
        <div v-if="option.svg" class="svg_wrap"><svg-icon  :icon-class="option.svg" class="iconSize"/></div>
        <span v-else :style="{'font-family':option.value}" class="font_wrap">{{option.value}}</span>
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
      currentIndex: 9,
      options: [
        { value: '思源宋体', label: '思源宋体', svg: 'siyuansongti.bb81b7ac' },
        { value: '阿里巴巴普惠', label: '阿里巴巴普惠', svg: 'alibabapuhui.ba134251' },
        { value: '苍耳与墨', label: '苍耳与墨', svg: 'cangeryumo.86210363' },
        { value: 'Beau', label: 'Beau', svg: 'Beau.47524f60' },
        { value: 'Bertha', label: 'Bertha', svg: 'Bertha.1a53de7f' },
        { value: 'Brela', label: 'Brela', svg: 'Brela.b366b384' },
        { value: '黑体', label: '黑体' },
        { value: '楷体', label: '楷体' },
        { value: '宋体', label: '宋体' },
        { value: '微软雅黑', label: '微软雅黑' },
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
    };
  },
  props:{
    disabled:{
      type:Boolean,
      required:true
    }
  },
  methods: {
    toggleOptions() {
      if(this.disabled) return;
      this.showOptions = !this.showOptions;
    },
    selectOption(option,index) {
      this.selectedOption = option;
      this.showOptions = false;
      this.currentIndex = index
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
  },
};
</script>

<style scoped>
.select-wrapper {
  position: relative;
}
.select-header {
  width: 80px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
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
}
.arrow-icon.active {
  transform: rotate(180deg);
}
.select-options {
  height: 380px;
  position: absolute;
  top: 120%;
  left: -50%;
  z-index: 99999999999;
  margin: 0;
  padding: 0;
  list-style: none;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: auto;
}
.select-options li {
  width: 170px;
  padding: 5px 10px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
.select-options li:hover {
  background-color: #f2f2f2;
}
.select-options li.active {
  background-color: #007bff;
  color: #fff;
}
.select-options li.active:hover {
  background-color: #0069d9;
}
.svg_wrap{
  margin: 0 10px;
  display: inline-block;
  width: 100px;
}
.iconSize{
  width: 100px !important;
}
.font_wrap{
  width: 100px;
  display: inline-block;
  margin: 0 10px;
  font-size: 13px;
}
.disableBorderColor{
  border-color: #ccc transparent transparent transparent !important;
}
</style>
