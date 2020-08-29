import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'
import firebase from 'firebase'

import './firebase' // initiates firebase
import './store/filters' // registers global filters with vue

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

import Buefy from 'buefy'
import './styles/main.scss'
Vue.use(Buefy)

// authorization checker, redirects to login screen if user signs out
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    return firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        next({
          path: '/',
          query: {
            redirect: to.fullPath
          }
        })
      } else {
        next()
      }
    })
  } else {
    next()
  }
})

const unsubsribe = firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    router.push('/')
  }
  unsubsribe()
})
