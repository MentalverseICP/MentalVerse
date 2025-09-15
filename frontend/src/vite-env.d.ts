/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
  readonly VITE_INTERNET_IDENTITY_URL: string
  readonly VITE_IC_HOST: string
  readonly VITE_SECURE_MESSAGING_CANISTER_ID: string
  readonly VITE_API_BASE_URL: string
  readonly DFX_NETWORK: string
  readonly VITE_IC_NETWORK: string
  readonly VITE_CANISTER_MENTALVERSE_BACKEND: string
  readonly VITE_CANISTER_MVT_TOKEN: string
  readonly VITE_CANISTER_SECURE_MESSAGING: string
  readonly DEV: boolean
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}