import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import reload from 'vite-plugin-full-reload'


export default defineConfig({
  plugins: [
    reload(['./docs/**/*', './posts/*']),
    sveltekit()
  ]
})
