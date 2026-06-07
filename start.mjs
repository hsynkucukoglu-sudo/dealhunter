import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const NEXT_PORT = 3000

const nextProcess = spawn('node', ['frontend-next/.next/standalone/server.js'], {
  cwd: __dirname,
  env: { ...process.env, PORT: String(NEXT_PORT), HOSTNAME: 'localhost' },
  stdio: 'inherit',
})

const backendProcess = spawn('node', ['server.js'], {
  cwd: join(__dirname, 'backend'),
  env: { ...process.env, NODE_ENV: 'production', NEXT_PORT: String(NEXT_PORT) },
  stdio: 'inherit',
})

const exit = (code) => { nextProcess.kill(); backendProcess.kill(); process.exit(code) }
nextProcess.on('exit', (c) => { console.error('Next.js çıktı:', c); exit(c || 1) })
backendProcess.on('exit', (c) => { console.error('Backend çıktı:', c); exit(c || 1) })
process.on('SIGTERM', () => exit(0))
process.on('SIGINT', () => exit(0))
