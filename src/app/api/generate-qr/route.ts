import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const uniqueId = crypto.randomUUID()
    const uniqueUrl = `https://qrlocal-8ryl.vercel.app/checkin/${uniqueId}`
    const qrDataUrl = await QRCode.toDataURL(uniqueUrl)

    // Salvar no Supabase
    const { error } = await supabase
      .from('qrcodes')
      .insert({ url: uniqueUrl, email })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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

    return NextResponse.json({ qrUrl: qrDataUrl, url: uniqueUrl })
  } catch (error: unknown) {
    console.error('Erro ao gerar QR Code:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
