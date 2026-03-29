import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderEmailToAdmin({ order, items, customerName, address, total }) {
  await resend.emails.send({
    from: 'Genuine <onboarding@resend.dev>',
    to: 'bfaisty422@gmail.com',
    subject: `🛍️ New Order #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; margin-bottom: 8px;">GENUINE</h1>
        <p style="color: #888; margin-bottom: 32px;">New order received</p>
        
        <div style="background: #111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h2 style="font-size: 14px; color: #888; margin-bottom: 16px;">ORDER #${order.id.slice(0, 8).toUpperCase()}</h2>
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>${item.product_name} x${item.quantity}</span>
              <span>KSh ${(item.price_at_purchase * item.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
          <div style="border-top: 1px solid #333; margin-top: 16px; padding-top: 16px; font-weight: 700; font-size: 18px;">
            Total: KSh ${total.toLocaleString()}
          </div>
        </div>

        <div style="background: #111; border-radius: 8px; padding: 20px;">
          <h2 style="font-size: 14px; color: #888; margin-bottom: 16px;">CUSTOMER</h2>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Address:</strong> ${address}</p>
        </div>
      </div>
    `,
  })
}

export async function sendOrderEmailToSupplier({ supplierEmail, order, items, address, customerName }) {
  await resend.emails.send({
    from: 'Genuine <onboarding@resend.dev>',
    to: supplierEmail,
    subject: `📦 New Order to Prepare #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; margin-bottom: 8px;">GENUINE</h1>
        <p style="color: #888; margin-bottom: 32px;">You have a new order to prepare</p>
        
        <div style="background: #111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h2 style="font-size: 14px; color: #888; margin-bottom: 16px;">ITEMS TO PREPARE</h2>
          ${items.map(item => `
            <div style="margin-bottom: 8px;">
              <span>${item.product_name} x${item.quantity}</span>
            </div>
          `).join('')}
        </div>

        <div style="background: #111; border-radius: 8px; padding: 20px;">
          <h2 style="font-size: 14px; color: #888; margin-bottom: 16px;">DELIVERY DETAILS</h2>
          <p><strong>Customer Name:</strong> ${customerName}</p>
          <p><strong>Delivery Address:</strong> ${address}</p>
          <p style="color: #888; font-size: 12px; margin-top: 16px;">
            Note: Do not contact the customer directly. All communication goes through Genuine.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendOrderConfirmationToCustomer({ customerEmail, order, items, total }) {
  await resend.emails.send({
    from: 'Genuine <onboarding@resend.dev>',
    to: customerEmail,
    subject: `✅ Order Confirmed #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 4px; margin-bottom: 8px;">GENUINE</h1>
        <p style="color: #888; margin-bottom: 32px;">Your order has been confirmed!</p>
        
        <div style="background: #111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h2 style="font-size: 14px; color: #888; margin-bottom: 16px;">ORDER #${order.id.slice(0, 8).toUpperCase()}</h2>
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>${item.product_name} x${item.quantity}</span>
              <span>KSh ${(item.price_at_purchase * item.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
          <div style="border-top: 1px solid #333; margin-top: 16px; padding-top: 16px; font-weight: 700; font-size: 18px;">
            Total: KSh ${total.toLocaleString()}
          </div>
        </div>

        <p style="color: #888; font-size: 13px;">
          Your order is being prepared and will be delivered soon. Thank you for shopping with Genuine!
        </p>
      </div>
    `,
  })
}