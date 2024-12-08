<template>
  <div class='container'>
    <div class="el_group_wrap">
        <div class="el_group_title" @click="titleClick('hideMyIcon')">
            <i class="arrow_icon" :class="{rotate: hideMyIcon}"></i>
            <span class="title">我的图型</span>
        </div>
        <div class="elements_wrap" :class="{hide:hideMyIcon}">
            <div class="element" v-for="item in baseCanvas" :key="item.name" @mouseenter="elementMouseEnter(item, 'myIconShow')" @mouseleave="elementMouseLeave('myIconShow')">
                <canvas :ref="item.name" :class="item.name" width="26" height="26" @mousedown="elementMouseDown($event, item)"></canvas>
            </div>
        </div>
        <div class="canvas_show_wrap" v-show="showOpt['myIconShow']">
            <el-card style="width:200px;height:150px">
                <div class="canvas_show_content_wrap">
                    <canvas ref="myIconShow" class="myIconShow" width="100" height="100"></canvas>
                    <span>{{currentCanvas}}</span>
                </div>
            </el-card>
        </div>
    </div>

    <div class="el_group_wrap">
        <div class="el_group_title" @click="titleClick('hideBaseIcon')">
            <i class="arrow_icon" :class="{rotate: hideBaseIcon}"></i>
            <span class="title">基础图形</span>
        </div>
        <div class="elements_wrap" :class="{hide:hideBaseIcon}">
            <div class="element" v-for="item in baseCanvas" :key="item.name" @mouseenter="elementMouseEnter(item, 'baseIconShow')" @mouseleave="elementMouseLeave('baseIconShow')">
                <canvas :class="item.name" width="26" height="26"></canvas>
            </div>
        </div>
        <div class="canvas_show_wrap" v-show="showOpt['baseIconShow']">
            <el-card style="width:200px;height:150px">
                <div class="canvas_show_content_wrap">
                    <canvas ref="baseIconShow" class="baseIconShow" width="100" height="100"></canvas>
                    <span>{{currentCanvas}}</span>
                </div>
            </el-card>
        </div>
    </div>


    <div class="el_group_wrap">
        <div class="el_group_title" @click="titleClick('hideFlowIcon')">
            <i class="arrow_icon" :class="{rotate: hideFlowIcon}"></i>
            <span class="title">Flowchart 流程图</span>
        </div>
        <div class="elements_wrap">
            <div class="element" :class="{hide:hideFlowIcon}">
                    
            </div>
        </div>
        <div class="canvas_show_wrap" v-show="showOpt['flowIconShow']">
            <el-card style="width:200px;height:150px">
                <div class="canvas_show_content_wrap">
                    <canvas ref="flowIconShow" class="flowIconShow" width="100" height="100"></canvas>
                    <span>{{currentCanvas}}</span>
                </div>
            </el-card>
        </div>
    </div>
  </div>
</template>

<script>
import canvas from '@/utils/canvas.js'
  export default {
    components: {},
    computed: {
    },
    props: {
        isElMouseDown: {
            type: Boolean,
            default: false
        },
        dragElInfo: {
            type: Object,
            default: () => {}
        }
    },
    mounted() {
    },
    data () {
      return {
        hideMyIcon: false,
        hideBaseIcon: false,
        hideFlowIcon: false,
        baseCanvas: [
            // {
            //     name: 'rectangle',
            //     funName: 'drawRectangle',
            //     cname: '矩形',
            //     info: {
            //         width: 26,
            //         height: 16,
            //         borderWidth: 1
            //     },
            // },
            {
                name: 'roundRect',
                funName: 'drawRoundRect',
                cname: '圆角矩形',
                info: {
                    width: 26,
                    height: 16,
                    cornerRadius: 5,
                    borderWidth: 1
                },
                dots: []
            },
            {
                name: 'circle',
                funName: 'drawCircle',
                cname: '圆形',
                info: {
                    radius: 12,
                    borderWidth: 1,
                    width: 26,
                    height: 26
                },
                dots: []
            },
            {
                name: 'triangle',
                funName: 'drawTriangle',
                cname: '三角形',
                info: {
                    width: 26,
                    height: 26,
                    borderWidth: 1,
                },
                dots: [
                    {
                        "id": 1,
                        "x": 50,
                        "y": 1,
                        "active": false
                    },
                    {
                        "id": 2,
                        "x": 74,
                        "y": 50,
                        "active": false
                    },
                    {
                        "id": 3,
                        "x": 50,
                        "y": 99,
                        "active": false
                    },
                    {
                        "id": 4,
                        "x": 24,
                        "y": 50,
                        "active": false
                    }
                ]
            },
            {
                name: 'rhombus',
                funName: 'drawRhombus',
                cname: '菱形',
                info: {
                    width: 26,
                    height: 20,
                    borderWidth: 1,
                },
                dots: []
            }
        ],
        currentCanvas:'',
        showOpt: {
            myIconShow: false,
            baseIconShow: false,
            flowIconShow: false
        },
        // isElMouseDown: false,
        // dragElInfo: '',
        dragImageRef: ''
      }
    },
    mounted() {
        this.initBaseCanvas()
    },
    methods: {
        titleClick(key) {
            this[key] = !this[key]
        },
        initBaseCanvas() {
            for(let item of this.baseCanvas) {
                // let selector = `.${item.name}`
                let selector = this.$refs[item.name]
                if(selector instanceof Array) {
                    selector = selector[0]
                }
                let info = item.info || {}
                canvas[item.funName](selector, info)
            }
        },
        elementMouseEnter(canvasInfo, ref) {
            let el = this.$refs[ref]
            let {cname, funName} = canvasInfo
            canvas.clearCanvas(el)
            canvas[funName](el)
            this.currentCanvas = cname
            this.showOpt[ref] = true
        },
        elementMouseLeave(ref) {
            this.showOpt[ref] = false
        },
        elementMouseDown (event, info) {
            this.$emit('setIsElMouseDown', true)
            this.$emit('setDragNodeInfo', info)
        },
    },
  }
</script>

<style lang="scss" scoped>
  /* @import url(); 引入公共css类 */
.el_group_wrap {
    border-bottom: thin solid #ccc;
    padding: 10px 0;
    position: relative;
}
.el_group_title {
    text-align: left;
    padding: 10px;
    display: flex;
    align-items: center;
    .arrow_icon {
        display: inline-block;
        width: 0;
        height: 0;
        margin-left: 5px;
        border-style: solid;
        border-width: 6px 4px 0 4px;
        border-color: #000 transparent transparent transparent;
        transition: transform 0.2s ease;
    }
    .title {
        position: relative;
        margin: 0 5px;
        font-size: 14px;
        font-weight: 700;
        color: #212930;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: default;
        user-select: none;
    }

    .rotate {
        transform: rotate(-90deg);
    }
}
.elements_wrap {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 0 10px;
    .element {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5px;
        width: 36px;
        height: 36px;
    }
}

.canvas_show_wrap {
    position: absolute;
    top: 20px;
    left: calc(100% + 2px);
    z-index: 99;
    .canvas_show_content_wrap {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}
.dragging {
  cursor: move;
}
</style>
<style>
.img {
    position: fixed;
}
</style>