'use client' // Trigger Vercel build with corrected imports
import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const generateQR = async () => {
    if (!email || !email.includes('@')) {
      alert('Por favor, insira um email válido.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar QR Code')
      }

      setQrUrl(data.qrUrl)
      alert(`QR Code enviado com sucesso para ${email}!`)
    } catch (error: unknown) {
      console.error('Erro:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert('Erro ao gerar QR Code: ' + errorMessage)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">QRLocal</h1>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={generateQR}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Gerando e enviando...' : 'Gerar QR Code e Enviar por Email'}
        </button>
        {qrUrl && (
          <div className="mt-8 text-center p-4 bg-gray-50 rounded-lg">
            <img src={qrUrl} alt="QR Code" className="mx-auto max-w-xs" />
            <p className="mt-3 text-sm text-gray-600">
              Enviado para: <strong>{email}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
