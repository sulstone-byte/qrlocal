'use client'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'
import { useState } from 'react'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

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
      const uniqueId = crypto.randomUUID()
      const uniqueUrl = `https://qrlocal-8ryl.vercel.app/checkin/${uniqueId}`
      const qrDataUrl = await QRCode.toDataURL(uniqueUrl)

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('qrcodes')
        .insert({ url: uniqueUrl, email })
        .select()
        .single()

      if (error) throw error

      // Enviar email
      await resend.emails.send({
        from: 'QRLocal <noreply@qrlocal.com>',
        to: email,
        subject: 'Seu QR Code QRLocal',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h1 style="color: #1a56db;">QRLocal</h1>
            <p>Olá! Aqui está seu QR Code único:</p>
            <img src="${qrDataUrl}" alt="QR Code" style="max-width: 200px; margin: 20px auto; border: 1px solid #ddd; padding: 10px;"/>
            <p><strong>Link:</strong> <a href="${uniqueUrl}">${uniqueUrl}</a></p>
            <p style="color: #666; font-size: 12px;">Validade: 30 dias</p>
          </div>
        `,
      })

      setQrUrl(qrDataUrl)
      alert(`QR Code enviado com sucesso para ${email}!`)
    } catch (error: any) {
      console.error('Erro:', error)
      alert('Erro ao gerar QR Code: ' + error.message)
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