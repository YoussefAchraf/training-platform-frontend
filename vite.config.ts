import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { VitePWA } from 'vite-plugin-pwa'
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


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.SITE_URL || 'http://localhost:3000'

  return {
    plugins: [
      react(),
      Sitemap({
        hostname: siteUrl,
        dynamicRoutes: DYNAMIC_ROUTES,
        changefreq: 'monthly',
        priority: { '/': 1, '/login': 0.8, '/signup': 0.8, '*': 0.5 },
        robots: [{ userAgent: '*', allow: ALLOWED_ROUTES, disallow: DISALLOWED_ROUTES }],
      }),
      obfuscateBuild(),
      
      
      
      
      
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectRegister: null,
        manifest: false,
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
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
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
  }
})
