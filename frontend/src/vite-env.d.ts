/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
  readonly VITE_INTERNET_IDENTITY_URL: string
  readonly VITE_IC_HOST: string
  readonly VITE_SECURE_MESSAGING_CANISTER_ID: string
  readonly DEV: boolean
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}