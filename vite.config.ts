import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

// Stats: Antonio's own Umami, beside Vercel Web Analytics. No cookies, Do Not Track respected, and a
// click on a link to another site counts as an "outbound" event. Loads only when the project's
// Production settings give PUBLIC_UMAMI_HOST and PUBLIC_UMAMI_WEBSITE_ID.
const outbound = `document.addEventListener('click', (e) => {
  const a = e.target instanceof Element ? e.target.closest('a[href]') : null
  if (!a) return
  const u = new URL(a.href, location.href)
  if (!/^https?:$/.test(u.protocol) || u.host === location.host) return
  window.umami?.track('outbound', { to: u.hostname, url: u.origin + u.pathname })
}, true)`

function stats() {
  return {
    name: 'stats',
    transformIndexHtml() {
      const host = process.env.PUBLIC_UMAMI_HOST
      const id = process.env.PUBLIC_UMAMI_WEBSITE_ID
      if (!host || !id) return []
      return [
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: `${host}/p.js`,
            'data-website-id': id,
            'data-domains': 'the-bent-one-book.stronghandssoftheart.com',
            'data-do-not-track': 'true',
          },
          injectTo: 'head' as const,
        },
        { tag: 'script', children: outbound, injectTo: 'head' as const },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [svelte(), stats()],
})
