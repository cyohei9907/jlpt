const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')

let client = null

function getClient() {
  if (!client) client = new SecretManagerServiceClient()
  return client
}

const cache = {}

async function getSecret(name) {
  if (cache[name]) return cache[name]

  // Allow env vars to override (local dev or direct config)
  if (process.env[name]) {
    cache[name] = process.env[name]
    return cache[name]
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
  if (!projectId) throw new Error(`Cannot load secret ${name}: no project ID set`)

  console.log(`Loading secret: ${name} from project ${projectId}`)
  const [version] = await getClient().accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/latest`,
  })
  cache[name] = version.payload.data.toString('utf8')
  console.log(`Secret ${name} loaded (${cache[name].length} chars)`)
  return cache[name]
}

async function loadSecrets() {
  const [clientId, clientSecret, jwtSecret] = await Promise.all([
    getSecret('GOOGLE_CLIENT_ID'),
    getSecret('GOOGLE_CLIENT_SECRET'),
    getSecret('JWT_SECRET'),
  ])
  return { clientId, clientSecret, jwtSecret }
}

module.exports = { getSecret, loadSecrets }
