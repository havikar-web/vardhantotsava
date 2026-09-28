/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly RAZORPAY_KEY_ID?: string;
  readonly RAZORPAY_KEY_SECRET?: string;
  readonly RAZORPAY_WEBHOOK_SECRET?: string;
  readonly VITE_WHATSAPP_PHONE_NUMBER_ID?: string;
  readonly VITE_WHATSAPP_WABA_ID?: string;
  readonly VITE_WHATSAPP_TOKEN?: string;
  readonly VITE_WHATSAPP_OTP_TEMPLATE?: string;
  readonly VITE_WHATSAPP_ORDER_TEMPLATE?: string;
  readonly VITE_ADMIN_WHATSAPP_NUMBERS?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_HAVIKAR_URL?: string;
  readonly VITE_PANCHAMGA_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
