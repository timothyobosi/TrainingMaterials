import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { config } from 'dotenv'

config()

console.log(process.env.VITE_API_BASE_URL);

export default defineConfig({
  // server:{
  //   proxy:{
  //     '/api':{
  //       target:process.env.VITE_API_TARGET,
  //       changeOrigin:true,
  //       secure:false,
  //     },
  //   },
  // },
  plugins: [react()],
})
