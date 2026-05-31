const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')

const PORT = 3100
let mainWindow
let serverProcess
let serverReady = false

// ─── Config (API keys stored in userData) ─────────────────────────────────────
function getConfigPath() {
  return path.join(app.getPath('userData'), 'config.json')
}

function loadConfig() {
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveConfig(data) {
  fs.writeFileSync(getConfigPath(), JSON.stringify(data, null, 2))
}

// ─── Next.js Standalone Server ────────────────────────────────────────────────
function resolveAppRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app')
  }
  return path.join(__dirname, '..')
}

function spawnNextServer() {
  const appRoot = resolveAppRoot()
  const serverScript = path.join(appRoot, '.next', 'standalone', 'server.js')

  if (!fs.existsSync(serverScript)) {
    dialog.showErrorBox(
      'Build Eksik',
      'Next.js build bulunamadı. Terminalde "npm run build" çalıştırın.'
    )
    app.quit()
    return
  }

  const config = loadConfig()
  const env = {
    ...process.env,
    PORT: String(PORT),
    NODE_ENV: 'production',
    HOSTNAME: '127.0.0.1',
    // Inject stored API keys
    ...(config.ANTHROPIC_API_KEY && { ANTHROPIC_API_KEY: config.ANTHROPIC_API_KEY }),
    ...(config.OPENAI_API_KEY && { OPENAI_API_KEY: config.OPENAI_API_KEY }),
    ...(config.GEMINI_API_KEY && { GEMINI_API_KEY: config.GEMINI_API_KEY }),
    ...(config.NEXT_PUBLIC_SUPABASE_URL && { NEXT_PUBLIC_SUPABASE_URL: config.NEXT_PUBLIC_SUPABASE_URL }),
    ...(config.NEXT_PUBLIC_SUPABASE_ANON_KEY && { NEXT_PUBLIC_SUPABASE_ANON_KEY: config.NEXT_PUBLIC_SUPABASE_ANON_KEY }),
  }

  serverProcess = spawn(process.execPath, [serverScript], {
    cwd: path.join(appRoot, '.next', 'standalone'),
    env,
    stdio: 'pipe',
  })

  serverProcess.stdout.on('data', (data) => {
    const msg = data.toString()
    console.log('[Next.js]', msg.trim())
    if (msg.includes('ready') || msg.includes('started') || msg.includes(String(PORT))) {
      serverReady = true
    }
  })

  serverProcess.stderr.on('data', (data) => console.error('[Next.js Error]', data.toString().trim()))
  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error('[Next.js] Server exited with code', code)
    }
  })
}

// ─── Wait for server ──────────────────────────────────────────────────────────
async function waitForServer(maxMs = 30000) {
  const url = `http://127.0.0.1:${PORT}`
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status < 500) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

// ─── Create Window ────────────────────────────────────────────────────────────
async function createWindow() {
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: Math.min(1400, width),
    height: Math.min(900, height),
    minWidth: 900,
    minHeight: 600,
    show: false,
    backgroundColor: '#09090b',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    icon: path.join(resolveAppRoot(), 'public', 'icons', 'icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Loading screen
  mainWindow.loadFile(path.join(__dirname, 'loading.html'))
  mainWindow.show()

  // Wait for server then navigate
  const ok = await waitForServer()
  if (ok) {
    mainWindow.loadURL(`http://127.0.0.1:${PORT}/dashboard`)
  } else {
    mainWindow.loadFile(path.join(__dirname, 'error.html'))
  }
}

// ─── IPC: Config management ───────────────────────────────────────────────────
ipcMain.handle('config:get', () => loadConfig())
ipcMain.handle('config:set', (_, data) => { saveConfig(data); return true })
ipcMain.handle('config:path', () => getConfigPath())

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  spawnNextServer()
  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (serverProcess) { serverProcess.kill(); serverProcess = null }
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (serverProcess) { serverProcess.kill(); serverProcess = null }
})
