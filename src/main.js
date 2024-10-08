import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import SvgIcon from '@/components/svg/SvgIcon.vue' // svg组件
import EventBus from './utils/eventBus.js'

// 注册到全局
Vue.component('svg-icon', SvgIcon)
const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./icons/svg', false, /\.svg$/)
requireAll(req)

Vue.use(EventBus)
Vue.use(ElementUI);
Vue.config.productionTip = false

new Vue({
  router,
  // store,
  render: h => h(App)
}).$mount('#app')
