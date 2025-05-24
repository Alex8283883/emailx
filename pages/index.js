import useSWR from 'swr'
import { useEffect, useState } from 'react'

const fetcher = url => fetch(url).then(res => res.json())

export default function Home() {
  const [token, setToken] = useState(null)
  const [accountId, setAccountId] = useState(null)
  const [emailId, setEmailId] = useState(null)

  useEffect(() => {
    const login = async () => {
      const domainRes = await fetch('https://api.mail.tm/domains')
      const domainData = await domainRes.json()
      const domain = domainData['hydra:member'][0].domain
      const random = Math.random().toString(36).substring(2, 8)
      const address = `onionx_${random}@${domain}`
      const password = "password"

      await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password })
      })

      const tokenRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password })
      })
      const tokenData = await tokenRes.json()
      setToken(tokenData.token)
    }
    login()
  }, [])

  const { data: messages } = useSWR(token ? ['https://api.mail.tm/messages', token] : null,
    ([url, token]) =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
    { refreshInterval: 5000 }
  )

  const latestMessage = messages?.['hydra:member']?.find(msg =>
    msg.from.address === 'no-reply@skinape.com'
  )

  const { data: email } = useSWR(
    token && latestMessage ? [`https://api.mail.tm/messages/${latestMessage.id}`, token] : null,
    ([url, token]) =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
    { refreshInterval: 5000 }
  )

  if (!token) return <p>Generating mailbox...</p>
  if (!email) return <p style={{ color: 'red' }}>Waiting for email from no-reply@skinape.com...</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Latest Email</h1>
      <p dangerouslySetInnerHTML={{ __html: email.html[0] }}></p>
    </div>
  )
}
