const _ = require('lodash')
const {
  ipcRenderer
} = require("electron");

const ownerId = (repository) => {
  let owner = repository.owner.login
  let id = repository.id
  return `${owner}/${id}`
}
const ownerName = (repository) => {
  return repository.full_name
}
const flattenObject = (object) => {
  let flattenedObjs = _.toPairs(object).map((obj) => {
    obj[1].key = obj[0]
    return obj[1]
  })
  return flattenedObjs
}
const createActualPath = (path) => {
  // this function will parse a single environment variable from a string
  // marked with a '$' before the varialbe, and return the string
  return new Promise((resolve) => {
    let dollar = path.indexOf('$')
    if (dollar !== -1) {
      let slash = path.indexOf('\\', dollar)
      let variable = ''
      if (slash === -1) {
        variable = path.substring(dollar - 1)
      } else {
        variable = path.substring(dollar - 1, slash)
      }
      let environmentVar = variable.substring(1)
      ipcRenderer.send("get-process-env-variable", environmentVar);
      ipcRenderer.once("environment-variable-found", (event, result) => {
        resolve(path.replace(variable, result))
      })
    } else {
      resolve(path)
    }
  })
}

export {
  ownerId,
  ownerName,
  flattenObject,
  createActualPath
}
