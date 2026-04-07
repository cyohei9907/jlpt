export const GCP_BUCKET_URL = import.meta.env.VITE_GCP_BUCKET_URL || 'https://storage.cloud.google.com/test-jlpt'

export function getResourceUrl(path) {
  if (!path || path === 'None') return null
  return `${GCP_BUCKET_URL}/${path}`
}

export const TYPE_LABELS = {
  type_1: '文字・語彙',
  type_2: '文法',
  type_3: '読解',
  type_4: '聴解',
}
