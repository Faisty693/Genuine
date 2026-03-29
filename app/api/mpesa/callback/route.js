import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()

    const resultCode = body?.Body?.stkCallback?.ResultCode
    const metadata = body?.Body?.stkCallback?.CallbackMetadata?.Item
    const checkoutRequestId = body?.Body?.stkCallback?.CheckoutRequestID

    const { createClient } = await import('../../../../lib/supabase/server')
    const supabase = await createClient()

    if (resultCode === 0) {
      const mpesaCode = metadata?.find(i => i.Name === 'MpesaReceiptNumber')?.Value
      const amount = metadata?.find(i => i.Name === 'Amount')?.Value

      await supabase.from('payments')
        .update({ mpesa_code: mpesaCode, status: 'completed' })
        .eq('checkout_request_id', checkoutRequestId)

      const { data: payment } = await supabase.from('payments')
        .select('order_id').eq('checkout_request_id', checkoutRequestId).single()

      if (payment) {
        await supabase.from('orders').update({ status: 'paid' }).eq('id', payment.order_id)

        const { data: order } = await supabase.from('orders').select('*').eq('id', payment.order_id).single()
        const { data: orderItems } = await supabase.from('order_items')
          .select('*, products(supplier_price)').eq('order_id', payment.order_id)

        if (orderItems) {
          for (const item of orderItems) {
            await supabase.from('supplier_payouts').insert({
              supplier_id: item.supplier_id,
              order_id: payment.order_id,
              amount: item.products.supplier_price * item.quantity,
              is_paid: false,
            })
          }
        }

        if (order?.customer_id) {
          await supabase.from('notifications').insert({
            user_id: order.customer_id,
            title: 'Payment Confirmed!',
            body: `Your payment of KSh ${amount} was received. Order is being prepared.`,
            order_id: payment.order_id,
          })
        }

        const { sendOrderEmailToAdmin, sendOrderEmailToSupplier, sendOrderConfirmationToCustomer } =
          await import('../../../../lib/notifications/email')

        await sendOrderEmailToAdmin({
          order, items: orderItems,
          customerName: order.customer_name,
          address: order.delivery_address,
          total: order.total,
        })

        const supplierIds = [...new Set(orderItems.map(i => i.supplier_id).filter(Boolean))]
        for (const supplierId of supplierIds) {
          const { data: supplier } = await supabase.from('suppliers')
            .select('user_id, business_name').eq('id', supplierId).single()
          const { data: supplierUser } = await supabase.from('users')
            .select('email').eq('id', supplier.user_id).single()
          const supplierItems = orderItems.filter(i => i.supplier_id === supplierId)
          await sendOrderEmailToSupplier({
            supplierEmail: supplierUser.email,
            order, items: supplierItems,
            address: order.delivery_address,
            customerName: order.customer_name,
          })
        }

        if (order?.customer_id) {
          const { data: customer } = await supabase.from('users')
            .select('email').eq('id', order.customer_id).single()
          if (customer?.email) {
            await sendOrderConfirmationToCustomer({
              customerEmail: customer.email,
              order, items: orderItems, total: order.total,
            })
          }
        }
      }
    } else {
      await supabase.from('payments')
        .update({ status: 'failed' })
        .eq('checkout_request_id', checkoutRequestId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ success: false })
  }
}