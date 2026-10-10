import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

// The React plugin must come after the Start plugin.
export default defineConfig({
  server: { port: 3000 },
  plugins: [tanstackStart(), nitro(), viteReact()],
})
