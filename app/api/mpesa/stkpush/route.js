import { NextResponse } from 'next/server'

async function getAccessToken() {
  const consumer_key = process.env.MPESA_CONSUMER_KEY
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET
  const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64')

  const response = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  )

  const data = await response.json()
  return data.access_token
}

export async function POST(request) {
  try {
    const { phone, amount, orderId } = await request.json()

    const access_token = await getAccessToken()

    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

    // Format phone number
    let formattedPhone = phone.replace(/\s/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1)
    }
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1)
    }

    const response = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.ceil(amount),
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: `GENUINE-${orderId}`,
          TransactionDesc: 'Genuine Shop Payment',
        }),
      }
    )

    const data = await response.json()

    if (data.ResponseCode === '0') {
      return NextResponse.json({
        success: true,
        checkoutRequestId: data.CheckoutRequestID,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: data.ResponseDescription || 'Payment request failed',
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Server error: ' + error.message,
    })
  }
}