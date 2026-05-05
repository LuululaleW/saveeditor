// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import { rehypeLazyLoadImages } from './src/plugins/rehype-lazy-image.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://saveeditor.top',
  base: './',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
    worker: {
      format: 'es'
    }
  },

  integrations: [
    react(),
    sitemap({ lastmod: new Date() }),
    AstroPWA({
      mode: 'production',
      base: '/',
      scope: '/',
      includeAssets: ['favicon.svg'],
      registerType: 'autoUpdate',
      manifest: {
        name: 'Save Editor Online',
        short_name: 'SaveEditor',
        description: 'Free, secure, and universal online save file editor.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          }
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,wasm}'],
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\//],
      },
    }),
  ],
  adapter: cloudflare(),
  i18n: {
    defaultLocale: "en",
    locales: ["en", "id"],
    routing: {
      prefixDefaultLocale: false
    }
  },
  markdown: {
    rehypePlugins: [rehypeLazyLoadImages],
  }
});
