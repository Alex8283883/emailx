import useSWR from 'swr'
import { useEffect, useState } from 'react'

const fetcher = (url, token) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.json())

export default function Home() {
  const [token, setToken] = useState(null)

  // Set your actual email and password (already registered on https://mail.tm)
  const address = "onionx@mail.tm"
  const password = "Manuy002"

  useEffect(() => {
    const login = async () => {
      try {
        const tokenRes = await fetch('https://api.mail.tm/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, password })
        })
        const tokenData = await tokenRes.json()
        if (tokenData.token) {
          setToken(tokenData.token)
        } else {
          console.error('Failed to authenticate:', tokenData)
        }
      } catch (err) {
        console.error('Login error:', err)
      }
    }
    login()
  }, [])

  const { data: messages } = useSWR(
    token ? ['https://api.mail.tm/messages', token] : null,
    ([url, t]) => fetcher(url, t),
    { refreshInterval: 5000 }
  )

  const latest = messages?.['hydra:member']?.find(
    msg => msg.from.address === 'no-reply@skinape.com'
  )

  const { data: email } = useSWR(
    token && latest ? [`https://api.mail.tm/messages/${latest.id}`, token] : null,
    ([url, t]) => fetcher(url, t),
    { refreshInterval: 5000 }
  )

  if (!token) return <p>Logging into mailbox...</p>
  if (!email) return <p style={{ color: 'red' }}>Waiting for email from no-reply@skinape.com...</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Latest Email from skinape</h1>
      <p dangerouslySetInnerHTML={{ __html: email.html?.[0] || email.text || 'No content' }} />
    </div>
  )
}
