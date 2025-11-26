interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_GOOGLE_SEARCH_API_KEY: string;
  readonly VITE_GOOGLE_SEARCH_ENGINE_ID: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}