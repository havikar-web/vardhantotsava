import { NextResponse } from 'next/server';

const DEFAULT_PHONE_ID = '1337239006142926';
const DEFAULT_TOKEN = 'EAA3srEndgnwBSoBJqylF683YKswnIEOeYC1aGFYE2MHu8rBVGHLDhvx5MfucH3ISPm06x40A7FAiKALrkFWc7BlB9VAEvjvnPtkC8HNE6USZBLcPhaZAux4ykwZBuYlfTV8pzm3R11H0ZABhFGZB7hgkAUMRTWQtCU7ZBbeU88zgead9ch36CZCZC8ZBr6h2TYS7YtQZDZD';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, templateName, parameters = [], buttonParam } = body;

    if (!to || !templateName) {
      return NextResponse.json({ ok: false, error: 'Recipient phone and templateName are required' }, { status: 400 });
    }

    let cleanTo = String(to).replace(/\D/g, '');
    if (cleanTo.startsWith('0') && cleanTo.length === 11) {
      cleanTo = cleanTo.slice(1);
    }
    const formattedTo = cleanTo.length === 10 ? '91' + cleanTo : cleanTo;

    const token = process.env.WHATSAPP_TOKEN || DEFAULT_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_PHONE_ID;

    // Determine language and component structure
    const isEnUs = templateName === 'hav_otp1' || templateName === 'samuha_confirmation' || templateName === 'hello_world';
    const langCode = isEnUs ? 'en_US' : 'en';

    const components: any[] = [];

    // Body parameters
    if (templateName === 'hav_otp1') {
      const code = String(parameters[0] || '123456');
      components.push({
        type: 'body',
        parameters: [
          { type: 'text', text: code },
          { type: 'text', text: String(parameters[1] || 'Verification') },
          { type: 'text', text: String(parameters[2] || '10 mins') },
          { type: 'text', text: String(parameters[3] || '918296925577') }
        ]
      });
      // Copy Code button
      components.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          { type: 'text', text: code }
        ]
      });
    } else {
      if (parameters.length > 0) {
        const formattedParams = parameters.map((p: any) => {
          let str = String(p ?? '').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
          if (!str) str = 'Mantrakshata';
          if (str.startsWith('*') && str.endsWith('*') && str.length >= 2) return str;
          if (/^https?:\/\//i.test(str) || str.includes('http://') || str.includes('https://') || str.includes('*')) return str;
          return `*${str}*`;
        });
        components.push({
          type: 'body',
          parameters: formattedParams.map((text: string) => ({ type: 'text', text }))
        });
      }

      if (buttonParam) {
        components.push({
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            { type: 'text', text: String(buttonParam).replace(/[\r\n\t]+/g, '').trim() }
          ]
        });
      }
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedTo,
      type: 'template',
      template: {
        name: templateName,
        language: { code: langCode },
        components
      }
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn('Meta WhatsApp API error:', data);
      const errorMsg = data.error?.message || data.error?.error_data?.details || 'Meta API rejected request';
      return NextResponse.json({ ok: false, error: errorMsg, raw: data }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      messageId: data.messages?.[0]?.id,
      status: data.messages?.[0]?.message_status || 'accepted'
    });
  } catch (error: any) {
    console.error('WhatsApp dispatch route error:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Internal dispatch error' }, { status: 500 });
  }
}
