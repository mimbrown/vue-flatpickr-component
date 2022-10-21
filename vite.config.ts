import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const filePath = fileURLToPath(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(filePath, '..', 'src/index.ts'),
      name: 'VueFlatpickr',
      fileName: 'vue-flatpickr',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'flatpickr'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue'
        }
      }
    },
    // minify: 'terser',
    // terserOptions: {
    //   output: {
    //     comments: false,
    //   },
    //   compress: {
    //     drop_console: true,
    //   },
    // },
  },
})
