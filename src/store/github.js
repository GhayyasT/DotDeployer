let GitHub = {}

const Base64 = require('js-base64').Base64
const applicationKey = Base64.decode(process.env.VUE_APP_APPLICATIONKEY)
const applicationId = process.env.VUE_APP_APPLICATIONID
const installationId = process.env.VUE_APP_INSTALLATIONID

const jwt = require('jsonwebtoken')
const requestPromise = require('request-promise')

const generateJWT = () => {
  const token = jwt.sign({}, applicationKey, {
    algorithm: 'RS256',
    issuer: applicationId,
    expiresIn: 20 // seconds
  });
  return token
}

GitHub.requestToken = () => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      uri: `https://api.github.com/installations/${installationId}/access_tokens`,
      json: true,
      headers: {
        Authorization: `Bearer ${generateJWT()}`,
        Accept: 'application/vnd.github.machine-man-preview+json',
        'User-Agent': 'Dot Deployer'
      }
    }
    requestPromise(options).then((result) => {
      resolve(result.token)
    }).catch((error) => {
      reject(error)
    })
  })
}

export default GitHub
