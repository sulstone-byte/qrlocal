import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'
import { useState } from 'react'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export default function Home() {
  const [email, setEmail] = useState('')
  const [qrUrl, setQrUrl] = useState('')

  const generateQR = async () => {
    const uniqueUrl = `https://qrlocal-8ryl.vercel.app/checkin/${crypto.randomUUID()}`
    const qrDataUrl = await QRCode.toDataURL(uniqueUrl)

    await supabase
      .from('qrcodes')
      .insert({ url: uniqueUrl, email })

    setQrUrl(qrDataUrl)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">QRLocal</h1>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />
        <button
          onClick={generateQR}
          className="w-full bg-blue-600 text-white p-3 rounded font-semibold"
        >
          Gerar QR Code
        </button>
        {qrUrl && (
          <div className="mt-6 text-center">
            <img src={qrUrl} alt="QR Code" className="mx-auto" />
            <p className="mt-2 text-sm text-gray-600">
              Enviado para: {email}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}