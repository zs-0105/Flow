<template>
  <div class="color-picker" v-show="show" @click="wrapClick">
    <div class="color_change">
      <my-dropdown @currentChange="colorGroupChang" :options="colorGruop" width="70px" dropWidth="120px" ref="dropdown" textAlign="left"></my-dropdown>
    </div>
    <div class="color_group">
      <el-tooltip effect="dark" :enterable="false" :content="item" placement="bottom" v-for="item in colors[colorIndex]" :key="item">
        <div class="color_item" :style="{'background-color': item}"></div>
      </el-tooltip>
    </div>
    <div class="color_base">
      <el-tooltip effect="dark" :enterable="false" :content="item" placement="bottom" v-for="item in baseColors" :key="item">
        <div class="color_item" :style="{'background-color': item}"></div>
      </el-tooltip>
    </div>
    <div class="history_title">
      最近使用
    </div>
    <div class="history_color">
      <el-tooltip effect="dark" :enterable="false" :content="item" placement="bottom" v-for="item in historyColors" :key="item">
        <div class="color_item" :style="{'background-color': item}"></div>
      </el-tooltip>
      <div class="empty_history" v-if="historyColors.length == 0">
        暂无数据
      </div>
    </div>
    <div class="color_options">
      <el-tooltip effect="dark" :enterable="false" content="吸色(Esc推出)" placement="bottom">
      <div class="color_draw">
        <div class="svg_wrap">
          <svg-icon icon-class="absorbColor" class="iconSize"/>
        </div>
      </div>
      </el-tooltip>
      <div class="color_edit">
        <div class="hex" v-show="colorWay == 'hex'">
          <div class="input_change" @click="changColor('rgb')">
            Hex
            <div class="exchangeIcon">
              <svg-icon icon-class="exchange" class="exchangeIcon"/>
            </div>
          </div>
          <div class="input_box">
            <input type="text" v-model="color" @input="hexChange" class="input_hex" maxlength="6">
          </div>
        </div>
        <div class="rgb" v-show="colorWay == 'rgb'">
          <div class="input_change" @click="changColor('hex')">
            Rgb
            <div class="exchangeIcon">
              <svg-icon icon-class="exchange" class="exchangeIcon"/>
            </div>
          </div>
          <div class="input_box" :class="{border:showBorder}">
              <input type="text" class="input_r" v-model="r" @input="rgbChange" @focus="inputFocuse" @blur="inputBlur" maxlength="3">
              <input type="text" class="input_g" v-model="g" @input="rgbChange" @focus="inputFocuse" @blur="inputBlur" maxlength="3">
              <input type="text" class="input_b" v-model="b" @input="rgbChange" @focus="inputFocuse" @blur="inputBlur" maxlength="3">
          </div>
        </div>
      </div>
      <div class="color_show">
        <span class="color_show_now" :style="{'background-color':currentRgbColor}"></span>
        <span class="color_show_history" style="display:none"></span>
      </div>
    </div>
    <div class="color_sep"></div>
    <div class="color_more">
      <div class="color_more_bg_wrap">
        <img class="color_more_bg" :src="require('../assets/imgs/color_more.png')" alt="">
        <span>更多颜色</span>
      </div>
      <div class="right_icon">
        <i class="el-icon-arrow-right"></i>
      </div>
    </div>
  </div>
</template>

<script>
import MyDropdown from '@/components/MyDropdown.vue'
import {hexToRgb, getRGBValues, rgbToHex, isValidHexColor} from '@/utils/color.js'
export default {
  data() {
    return {
      colorGruop: [
        {value:'系统色', label:'系统色'},
        {value:'莫兰迪', label:'莫兰迪'},
        {value:'中国风', label:'中国风'},
        {value:'潘通色', label:'潘通色'}
      ],
      colors: [
        ['#EFECEB', '#F2F2F2', '#E7EBED', '#FADCDB', '#FBEADA', '#FCF9EA', '#E5F6DA', '#DBF5F5', '#D2D6F9', '#FADDED', '#DED9D7', '#D9D9D9', '#E0E0E0', '#F5B9B7', '#F8D5B5', '#F6EDC1', '#CAEDB4', '#B7EAEB', '#A6AEF3', '#F6BBDB', '#BEB3AF', '#BFBFBF', '#9E9E9E', '#F19594', '#F4C18F', '#F1E4A2', '#B0E38F', '#94E0E1', '#7985EC', '#F199C8', '#9D8C88', '#A6A6A6', '#616161', '#EC7270', '#F1AC6A', '#E9D66F', '#95DA69', '#70D5D7', '#5B79E8', '#ED77B6', '#5C4038', '#7F7F7F', '#262626', '#A23735', '#A66A30', '#A7932C', '#569230', '#358E90', '#314AA4', '#A23C73'],
        ['#F1F1E8', '#ECECED', '#F3FAF9', '#F4F0EA', '#F9FAEE', '#F8F9F5', '#F5E9ED', '#FCE7EB', '#F9EEE1', '#FEF5EF', '#E3E2D1', '#D9DADB', '#E8F5F4', '#E9E1D5', '#F3F6DD', '#F0F3EC', '#EBD2DC', '#F9CFD7', '#F3DDC3', '#FDEBDF', '#D6D4BA', '#C5C7CA', '#DCEFEE', '#DDD1C1', '#EEF1CB', '#E9ECE2', '#E0BCCA', '#F6B6C4', '#EDCCA5', '#FCE2CF', '#C8C5A3', '#B2B5B8', '#D1EAE9', '#D2C2AC', '#E8EDBA', '#E1E6D9', '#D6A5B9', '#F39EB0', '#E7BB87', '#FBD8BF', '#959270', '#7F8285', '#9EB7B6', '#9F8F79', '#B5BA87', '#AEB3A6', '#A37286', '#C06B7D', '#B48854', '#C8A58C'],
        ['#866B50', '#705138', '#5A5645', '#5C3719', '#775550', '#5A1216', '#B0913E', '#964D22', '#E28342', '#C37940', '#2C2305', '#645822', '#6B5E4C', '#556980', '#70887D', '#5B8483', '#975F42', '#A2825E', '#DDAB4C', '#91A45A', '#4D5255', '#587D8C', '#737C7B', '#B1AD94', '#ADB4A9', '#467E7D', '#94B68E', '#894276', '#C36077', '#D59482', '#144A74', '#495C69', '#314656', '#134857', '#7E8489', '#8F927F', '#B2BBBE', '#67907C', '#539271', '#D2B116', '#322F3B', '#525288', '#8076A3', '#1A94BC', '#5D3131', '#314A43', '#C1651A', '#DE9E44', '#D2B126', '#D2D97A'],
        ['#E3F0E1', '#EEE7F1', '#E4D5D8', '#FDF8DC', '#DFE3F5', '#FFF1D5', '#DFE5DB', '#E2EFF5', '#DEE6E6', '#F9DDD6', '#C7E1C3', '#DED0E4', '#CAAAB1', '#FBF1B8', '#BFC7EA', '#FEE2AB', '#BFCAB6', '#C6DFEA', '#BDCECD', '#F3BBAD', '#ABD1A6', '#CDB8D6', '#AF808A', '#F8EB95', '#9EAAE0', '#FED480', '#A0B092', '#A9CEE0', '#9DB5B5', '#ED9984', '#8FC288', '#BDA1C9', '#955563', '#F6E471', '#7E8ED5', '#FDC556', '#80956D', '#8DBED5', '#7C9D9C', '#E7775B', '#5C8F55', '#8A6E96', '#622230', '#C3B13E', '#4B5BA2', '#CA9223', '#4D623A', '#5A8BA2', '#496A69', '#B44428']
      ],
      baseColors: ['#E9EDF2', '#7F8B98', '#000000', '#E74F4C', '#ED9745', '#E0C431', '#7BD144', '#4CCBCD', '#4669EA', '#E855A4'],
      colorIndex: 0,
      historyColors:[],
      showBorder: false,
      colorWay : 'hex',
      color:'',
      currentRgbColor:'',
      r:'',
      g:'',
      b:''
    };
  },
  components:{
    MyDropdown,
  },
  props:{
    currentColor: {
      type: String,
      default: '#FFF'
    },
    show:{
      type:Boolean,
      default:false
    }
  },
  mounted(){
    this.historyColors = JSON.parse(localStorage.getItem('historyColors')) || []
    this.color = this.currentColor.substr(1)
    this.currentRgbColor = hexToRgb(this.currentColor)
    let rgb = getRGBValues(this.currentRgbColor)
    this.r = rgb.r
    this.g = rgb.g
    this.b = rgb.b
  },
  computed:{
  },
  methods: {
    openPicker() {
      this.isOpen = !this.isOpen;
    },
    selectColor(color) {
      this.currentColor = color;
      this.isOpen = false;
    },
    wrapClick(e){
      e.stopPropagation();
      if (!this.$refs.dropdown.$el.contains(e.target)) {
        this.$refs.dropdown.showOptions = false
      }
    },
    colorGroupChang(option, index){
      this.colorIndex = index
    },
    inputFocuse() {
      this.showBorder = true
    },
    inputBlur() {
      this.showBorder = false
    },
    changColor(val) {
      this.colorWay = val
    },
    hexChange(e) {
      let value = e.target.value
      if (isValidHexColor(value)) {
        let hex = '#' + value
        let rgbStr = hexToRgb(hex)
        let rgb = getRGBValues(rgbStr)
        this.r = rgb.r
        this.g = rgb.g
        this.b = rgb.b
        this.currentRgbColor = rgbStr
        this.updateColorHistory(this.color)
      }
     
    },
    rgbChange(event) {
      var input = event.target;
      var value = input.value;

      // 使用正则表达式验证输入是否为数值
      var regex = /^\d*\.?\d*$/;
      if (!regex.test(value)) {
        // 如果输入不是数值，则清除非法字符
        input.value = value.replace(/[^\d.]/g, '');
      }
      let r = this.r || 0;
      let g = this.g || 0;
      let b = this.b || 0;

      this.color = rgbToHex(r, g, b)
      this.currentRgbColor = `rgb(${r},${g},${b})`
      this.updateColorHistory(this.color)
    },
    updateColorHistory(color) {
      if(!color.startsWith('#')) {
        color = '#' + color
      }
      let index = this.historyColors.findIndex(item => item == color)
      if(index == -1){
        this.historyColors.push(color)
      }else {
        this.historyColors.splice(index, 1, color)
      }
      localStorage.setItem('historyColors', JSON.stringify(this.historyColors))
    }
  }
};
</script>

<style scoped>
.color-picker {
  width: 224px;
  background-color: #fff;
  position: absolute;
  top: calc(100% + 5px);
  left: calc(50% - 112px);
  box-shadow: 0 4px 10px 0 rgba(0,0,0,.1);
  border-radius: 4px;
  border: 1px solid #f3f5f7;
  padding: 8px 12px;
  z-index: 99;
  font-size: 12px;
  cursor: default;
}
.color_change >>> .select-wrapper {
  padding: 2px !important;
}
.color_change >>> .select-wrapper:hover {
  background-color: #EAECEE;
}
.color_change >>> .header_text {
  font-size: 12px !important;
}
.color_change >>> .select-options {
  left: -12px !important;
}
.color_group, .color_base, .history_color {
  display: flex;
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
}
.color_item {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid #ccc;
  position: relative;
  overflow: hidden;
  margin-right: 3px;
  margin-bottom: 3px;
}
.color_item:hover{
  scale: 1.2;
}
.history_title {
  line-height: 20px;
  color: #6c7d8f;
  text-align: left;
}
.color_options {
  height: 28px;
  margin-top: 6px;
  display: flex;
  align-items: center;
}
.color_draw {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  flex: none;
}
.color_draw :hover{
  background-color: #F3F5F9;
}
.color_edit {
  flex: auto;
}
.color_show {
  display: flex;
  flex: none;
  margin-left: 8px;
}
.color_show span {
  width: 16px;
  height: 16px;
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}
.hex, .rgb {
  display: flex;
  align-items: center;
}

.input_change {
  width: 48px;
  height: 22px;
  margin-left: 4px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: default;
  flex: none;
}
.input_change:hover{
  background-color: #F3F5F9;
}
.input_box {
  width: 88px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #e9edf2;
  display: flex;
  overflow: hidden;
  flex: auto;
}
.input_hex {
  padding-left: 8px;
  text-align: left;
}
.input_hex:focus{
  border: 1px solid #409EFF;
}
.input_box input {
    width: 30px;
    line-height: 100%;
    background: #fff;
    padding: 0;
    margin: 0;
    border: none;
    text-align: center;
    flex: auto;
}
.iconSize {
  width: 22px !important;
  height: 22px !important;
}
.svg_wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.exchangeIcon {
  margin: 0 4px ;
  margin-top: 2px;
}
.input_r, .input_g, .input_b:focus{
  border-radius: 0 !important;
}
.input_r {
  border-right: 1px solid #ccc !important;
}
.input_b {
  border-left: 1px solid #ccc !important;
}
.border {
  border: 1px solid #409EFF;
}
.empty_history {
  width: 100%;
  text-align: center;
  color: #ccc;
}
.color_sep {
  height: 1px;
  background: #e9edf2;
  margin: 8px 0;
}
.color_more {
  width: 100%;
  display: flex;
  align-items: center;
  height: 30px;
  border-radius: 5px;
  justify-content: space-between;
}
.color_more:hover {
  background-color: #F3F5F7;
}
.color_more_bg {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.color_more_bg_wrap {
  display: flex;
  align-items: center;
}
</style>
