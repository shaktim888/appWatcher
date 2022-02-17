import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/',
            component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
            meta: { title: '自述文件' },
            children: [
                {
                    path: '/dashboard',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/Dashboard.vue'),
                    meta: { title: '系统首页' }
                },
                {
                    // markdown组件
                    path: '/markdown',
                    component: () => import(/* webpackChunkName: "markdown" */ '../components/page/Markdown.vue'),
                    meta: { title: 'markdown编辑器' }
                },
                {
                    path: '/AppLog',
                    component: () => import(/* webpackChunkName: "AppLog" */ '../components/page/AppLogManager.vue'),
                    meta: { title: 'App日志管理' }
                },
                {
                    path: '/tableAdmin',
                    component: () => import(/* webpackChunkName: "tableAdmin" */ '../components/page/TableManager.vue'),
                    meta: { title: 'table结构管理' }
                },
                {
                    path: '/appCfgAdmin',
                    component: () => import(/* webpackChunkName: "appCfgAdmin" */ '../components/page/AppConfigManager.vue'),
                    meta: { title: 'SDK配置管理' }
                },
                {
                    path: '/404',
                    component: () => import(/* webpackChunkName: "404" */ '../components/page/404.vue'),
                    meta: { title: '404' }
                },
                {
                    path: '/403',
                    component: () => import(/* webpackChunkName: "403" */ '../components/page/403.vue'),
                    meta: { title: '403' }
                },
            ]
        },
        {
            path: '/login',
            component: () => import(/* webpackChunkName: "login" */ '../components/page/Login.vue'),
            meta: { title: '登录' }
        },
        {
            path: '/register',
            component: () => import(/* webpackChunkName: "register" */ '../components/page/Register.vue'),
            meta: { title: '注册界面' },
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});
