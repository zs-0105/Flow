<template>
  <div class="pixel-input">
    <div class="value" :class="{disableColor:disabled}" @dblclick="startEditing" v-show="!isEditing">
      {{ value }}px
    </div>
    <input class="editor" type="number" v-model="inputValue" @keyup.enter="endEditing" @blur="endEditing" v-show="isEditing" ref="input" />
    <div class="controls" v-show="!isEditing">
      <div class="arrow-up" :class="{disableUpBorder:disabled}" @click="incrementValue"></div>
      <div class="arrow-down" :class="{disableDownBorder:disabled}" @click="decrementValue"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: 0,
      inputValue: '',
      isEditing: false,
    };
  },
  props:{
    disabled:{
        type:Boolean,
        required:true
    }
  },
  methods: {
    startEditing() {
      if(this.disabled) return;
      this.inputValue = this.value.toString();
      this.isEditing = true;
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    endEditing() {
      const newValue = parseInt(this.inputValue);
      if (!isNaN(newValue)) {
        this.value = newValue;
      }
      this.isEditing = false;
    },
    incrementValue() {
      if(this.disabled) return;
      this.value++;
    },
    decrementValue() {
      if(this.disabled) return;
      if (this.value > 0) {
        this.value--;
      }
    },
  },
};
</script>

<style scoped>
.pixel-input {
  height: 100%;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.value {
  cursor: pointer;
  user-select: none;
}

.editor {
  width: 50px;
  height: 20px;
  padding: 0;
  margin: 0;
  text-align: center;
}

.controls {
  display: flex;
  flex-direction: column;
}

.arrow-up {
  width: 0;
  height: 0;
  margin-left: 5px;
  margin-bottom: 2px;
  border-style: solid;
  border-width: 0 4px 6px 4px;
  border-color: transparent transparent #000 transparent;
  cursor: pointer;
}
.arrow-down {
  width: 0;
  height: 0;
  margin-left: 5px;
  margin-top: 2px;
  border-style: solid;
  border-width: 6px 4px 0 4px;
  border-color: #000 transparent transparent transparent;
  cursor: pointer;
}
.disableUpBorder{
  border-color: transparent transparent #ccc transparent !important;
}
.disableDownBorder{
  border-color: #ccc transparent transparent transparent !important;
}
</style>
