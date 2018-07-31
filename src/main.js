import Vue from 'vue';
import App from './App';
import router from './router';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';    // 默认主题
//import '../static/css/theme-green/index.css';       // 浅绿色主题
import "babel-polyfill";

Vue.use(ElementUI, { size: 'small' });

var instance = axios.create({
    baseURL: 'http://10.102.52.8:9999/api/v1/',
    timeout: 10000
});
Vue.prototype.$axios = instance;

Vue.prototype.$axios.interceptors.request.use(config => {    // 这里的config包含每次请求的内容
    // 判断localStorage中是否存在api_token
    if (localStorage.getItem('api_token')) {
        //  存在将api_token写入 request header
        config.data.sessionCode = localStorage.getItem('api_token');
        config.data.loginKey = localStorage.getItem('ms_username');
    }
    return config;
}, err => {
    return Promise.reject(err);
});

Vue.prototype.$axios.interceptors.response.use(response =>{
    if (response.data.header.rspCode != 4) {
        return response;
    }
    localStorage.removeItem('ms_username');
    localStorage.removeItem('sessionCode');
    router.push('login');

    },error  => {
      //return Promise.reject(response.data.header.rspDesc);
    }
);

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    const role = localStorage.getItem('ms_username');
    if(!role && to.path !== '/login'){
        next('/login');
    }else if(to.meta.permission){
        // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
        role === 'admin' ? next() : next('/403');
    }else{
        // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
        if(navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor'){
            Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
                confirmButtonText: '确定'
            });
        }else{
            next();
        }
    }
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
