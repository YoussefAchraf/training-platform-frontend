

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CHATBOT_WEBHOOK_URL?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
