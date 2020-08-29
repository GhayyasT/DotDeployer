import Vue from 'vue'
import Router from 'vue-router'

import Navbar from '@/components/Navbar'

import Login from '@/views/Login'
import Install from '@/views/Install'
import Admin from '@/views/Admin'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'login',
      components: {
        navbar: null,
        main: Login
      },
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/install',
      name: 'install',
      components: {
        navbar: Navbar,
        main: Install
      },
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin',
      name: 'admin',
      components: {
        navbar: Navbar,
        main: Admin
      },
      meta: {
        requiresAuth: true
      }
    }
  ]
})
