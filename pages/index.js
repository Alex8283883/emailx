import useSWR from 'swr'

const EMAIL_ADDRESS = 'onionx@dcpa.net'
const BEARER_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE3NDgwNzQ2ODAsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJhZGRyZXNzIjoib25pb254QGRjcGEubmV0IiwiaWQiOiI2ODMxODA4YzJiMTFkNzhhYmQwMTllOTEiLCJtZXJjdXJlIjp7InN1YnNjcmliZSI6WyIvYWNjb3VudHMvNjgzMTgwOGMyYjExZDc4YWJkMDE5ZTkxIl19fQ.uJ0spRCRurMDTiRPiLMJbC-05B7vx12Bholn-BufKzScQyYhf0zKykeEJ2cENiPEgk4tzsuEIRP46e7s9k8F3Q'

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
  }).then(res => res.json())

export default function Home() {
  const { data: messages } = useSWR(
    'https://api.mail.tm/messages',
    fetcher,
    { refreshInterval: 3000 }
  )

  const latest = messages?.['hydra:member']?.find(
    msg => msg.from.address === 'no-reply@skinape.com'
  )

  const { data: email } = useSWR(
    latest ? `https://api.mail.tm/messages/${latest.id}` : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  if (!email) return <p style={{ color: 'red' }}>Waiting for email from no-reply@skinape.com...</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Latest Email from skinape</h1>
      <p dangerouslySetInnerHTML={{ __html: email.html?.[0] || email.text || 'No content' }} />
    </div>
  )
}
