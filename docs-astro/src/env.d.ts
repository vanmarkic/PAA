/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Environment variable types
interface ImportMetaEnv {
  readonly PUBLIC_SITE_TITLE: string;
  readonly PUBLIC_SITE_DESCRIPTION: string;
  readonly PUBLIC_GITHUB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}