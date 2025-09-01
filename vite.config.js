import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { config } from 'dotenv'

config()

export default defineConfig({
  server:{
    proxy:{
      '/api':{
        target:process.env.VITE_API_TARGET,
        changeOrigin:true,
        secure:false,
      },
    },
  },
  plugins: [react()],
})
