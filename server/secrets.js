const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')

const client = new SecretManagerServiceClient()
const cache = {}

async function getSecret(name) {
  if (cache[name]) return cache[name]

  // In local dev, allow env vars to override
  if (process.env[name]) {
    cache[name] = process.env[name]
    return cache[name]
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/latest`,
  })
  cache[name] = version.payload.data.toString('utf8')
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
