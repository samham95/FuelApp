import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  /*   server: {
      https: {
        cert: fs.readFileSync(path.resolve(__dirname, '/home/samham/127.0.0.1+1.pem')),
        key: fs.readFileSync(path.resolve(__dirname, '/home/samham/127.0.0.1+1-key.pem')),
      }
    } */
})
