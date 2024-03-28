import { defineConfig, loadEnv } from 'vite';
import envCompatible from 'vite-plugin-env-compatible';
import fs from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react'
// https://vitejs.dev/config/

export default ({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()))

  const HOST = process.env.VITE_HOST || '127.0.0.1';
  const PORT = process.env.VITE_PORT || 3000;
  return defineConfig({
    plugins: [react(), envCompatible()],
    server: {
      host: HOST,
      port: PORT,

      /*    settings for https testing, omitting...   
            https: {
              cert: fs.readFileSync(path.resolve('../../localhost+2.pem')),
              key: fs.readFileSync(path.resolve('../../localhost+2-key.pem')),
            } */
    }
  })
}
