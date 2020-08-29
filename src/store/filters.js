import Vue from 'vue'

const _ = require('lodash')

let filters = {
  commaFormat (value) {
    if (typeof value === 'number') {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },
  capitalize (value) {
    function capFirstLetter (word) {
      let array = word.split('')
      array[0] = array[0].toUpperCase()
      return array.join('')
    }
    if (value) {
      if (typeof value === 'string') {
        const dashToSpace = value.split('-').join(' ').split('_').join(' ')
        const array = dashToSpace.split(' ')
        return array.map(capFirstLetter).join(' ')
      } else {
        return value
      }
    } else {
      return ''
    }
  },
  chopString (value, limit) {
    if (value) {
      if (value.length > limit) {
        return value.substring(0, limit) + '...'
      } else {
        return value
      }
    }
  }
}

// Register Filters
_.keys(filters).forEach((filterName) => {
  Vue.filter(filterName, filters[filterName])
})
