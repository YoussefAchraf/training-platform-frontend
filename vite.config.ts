import { defineConfig, loadEnv, normalizePath } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'node:path'
import JavaScriptObfuscator from 'javascript-obfuscator'






const DYNAMIC_ROUTES = ['/login', '/signup']
const ALLOWED_ROUTES = ['/', ...DYNAMIC_ROUTES]
const DISALLOWED_ROUTES = [
  '/dashboard',
  '/account',
  '/providers',
  '/trainings',
  '/clients',
  '/sessions',
  '/calendar',
  '/instructors',
  '/admin',
  '/superadmin',
  '/developer',
  '/feedback',
  '/reports',
  '/pending-approval',
  '/survey',
]








function obfuscateBuild(): Plugin {
  return {
    name: 'obfuscate-medium',
    apply: 'build',
    enforce: 'post',
    renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith('.js')) return null
      
      
      
      
      
      
      if (chunk.fileName === 'sw.js') return null
      const result = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        
        
        
        
        
        reservedStrings: ['\\.js$', '\\.css$'],
        simplify: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        selfDefending: false,
        debugProtection: false,
        disableConsoleOutput: false,
        splitStrings: false,
        unicodeEscapeSequence: false,
      })
      return { code: result.getObfuscatedCode(), map: null }
    },
  }
}












function preloadFonts(): Plugin {
  return {
    name: 'preload-critical-fonts',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      const bundle = ctx.bundle
      if (!bundle) return html
      const weights = ['inter-latin-400-normal', 'inter-latin-600-normal']
      const tags = weights
        .map((weight) =>
          Object.values(bundle).find((item) => item.fileName.includes(weight) && item.fileName.endsWith('.woff2')),
        )
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map(
          (item) =>
            `<link rel="preload" as="font" type="font/woff2" href="/${item.fileName}" crossorigin>`,
        )
      if (tags.length === 0) return html
      return html.replace('</head>', `${tags.join('\n    ')}\n  </head>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.SITE_URL || 'http://localhost:3000'
  // Mirrors nginx's own proxy_pass in docker/default.conf.template, so
  // `npm run dev` behaves the same as the production container now that
  // VITE_API_URL/VITE_CHATBOT_WEBHOOK_URL are same-origin relative paths -
  // BACKEND_UPSTREAM/CHATBOT_UPSTREAM are plain (non-VITE_) vars, read here
  // only, never shipped to the browser.
  const backendUpstream = env.BACKEND_UPSTREAM || 'http://localhost:4000'
  const chatbotUpstream = env.CHATBOT_UPSTREAM || 'http://localhost:5678'

  return {
    plugins: [
      react(),
      Sitemap({
        hostname: siteUrl,
        dynamicRoutes: DYNAMIC_ROUTES,
        // Without this, the plugin's dist/*.html scan picks up 404.html as
        // if it were a real indexable page and lists /404 in the sitemap.
        exclude: ['/404'],
        changefreq: 'monthly',
        priority: { '/': 1, '/login': 0.8, '/signup': 0.8, '*': 0.5 },
        robots: [{ userAgent: '*', allow: ALLOWED_ROUTES, disallow: DISALLOWED_ROUTES }],
      }),
      obfuscateBuild(),
      preloadFonts(),
      // Copies flag-icons' css+flags folders as raw files, served via a
      // plain <link> in index.html - keeps them out of Vite's CSS/asset
      // pipeline entirely (see index.html's comment for why), and out of
      // the PWA precache manifest below (globIgnores: 'vendor/**') since
      // there's no need to precache all ~250 countries' flags for offline
      // use - the handful actually shown just load over the network like
      // any other image, same as they would on a non-PWA site.
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(path.resolve(__dirname, 'node_modules/flag-icons/css/flag-icons.min.css')),
            dest: 'vendor/flag-icons/css',
            rename: { stripBase: true },
          },
          {
            // Copied as the two flat 4x3/1x1 leaf folders individually
            // (rather than the whole flags/ tree at once) - stripBase
            // flattens whatever's under src, and both folders share
            // filenames (ad.svg exists in each), so copying them together
            // silently let one variant overwrite the other.
            src: normalizePath(path.resolve(__dirname, 'node_modules/flag-icons/flags/4x3')),
            dest: 'vendor/flag-icons/flags/4x3',
            rename: { stripBase: true },
          },
          {
            src: normalizePath(path.resolve(__dirname, 'node_modules/flag-icons/flags/1x1')),
            dest: 'vendor/flag-icons/flags/1x1',
            rename: { stripBase: true },
          },
        ],
      }),
      // manifest: false - public/site.webmanifest is already hand-maintained
      // (icons, maskable variants, theme colors) from earlier PWA-icon work;
      // injectManifest (not generateSW) because push notifications need a
      // hand-written `push`/`notificationclick` handler in src/sw.ts
      // alongside Workbox's precaching, which generateSW doesn't allow.
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectRegister: null,
        manifest: false,
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          globIgnores: ['vendor/**'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Vendor deps rarely change between deploys; app code changes on
          // every one. Splitting them into their own long-lived chunks means
          // a returning visitor's browser cache for React/motion/react-query
          // survives a normal app deploy instead of being invalidated by it
          // (the index chunk that DOES change every deploy stays much smaller).
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) {
              return 'vendor-react'
            }
            if (id.includes('/motion/') || id.includes('/framer-motion/')) {
              return 'vendor-motion'
            }
            if (id.includes('/@tanstack/')) {
              return 'vendor-query'
            }
            return undefined
          },
        },
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: backendUpstream,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/webhook/chatbot/message': {
          target: chatbotUpstream,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: backendUpstream,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/webhook/chatbot/message': {
          target: chatbotUpstream,
          changeOrigin: true,
        },
      },
    },
  }
})
