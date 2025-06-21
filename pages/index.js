
import { useEffect, useState } from 'react'
import useSWR from 'swr'

const EMAIL_ADDRESS = 'onionx@dcpa.net'
const BEARER_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE3NDgwNzQ2ODAsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJhZGRyZXNzIjoib25pb254QGRjcGEubmV0IiwiaWQiOiI2ODMxODA4YzJiMTFkNzhhYmQwMTllOTEiLCJtZXJjdXJlIjp7InN1YnNjcmliZSI6WyIvYWNjb3VudHMvNjgzMTgwOGMyYjExZDc4YWJkMDE5ZTkxIl19fQ.uJ0spRCRurMDTiRPiLMJbC-05B7vx12Bholn-BufKzScQyYhf0zKykeEJ2cENiPEgk4tzsuEIRP46e7s9k8F3Q'

const fetcher = async (url) => {
  try {
    const res = await fetch(url, {
      headers: { Authorization: "Bearer " + BEARER_TOKEN },
    })
    if (!res.ok) {
      throw new Error("Fetch failed with status " + res.status)
    }
    return await res.json()
  } catch (err) {
    console.error('Fetch error:', err)
    return { error: err.message }
  }
}

export default function Home() {
  const [startFetch, setStartFetch] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartFetch(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const { data: messages } = useSWR(
    startFetch ? 'https://api.mail.tm/messages' : null,
    fetcher,
    { refreshInterval: 1500 }
  )

  const latest = messages?.['hydra:member']?.find(
    msg => msg.from.address === 'no-reply@skinape.com'
  )

  const { data: email } = useSWR(
    startFetch && latest ? 'https://api.mail.tm/messages/' + latest.id : null,
    fetcher,
    { refreshInterval: 1500 }
  )

  if (!startFetch) return <p style={{ color: 'gray' }}>Preparing to fetch...</p>
  if (messages?.error || email?.error) return <p style={{ color: 'red' }}>Error: {messages?.error || email?.error}</p>
  if (!email) return <p style={{ color: 'orange' }}>Waiting for email from no-reply@skinape.com...</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Latest Email from skinape</h1>
      <p dangerouslySetInnerHTML={{ __html: email.html?.[0] || email.text || 'No content' }} />
    </div>
  )
}
