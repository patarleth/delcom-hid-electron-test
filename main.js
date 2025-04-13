const { app, BrowserWindow, nativeImage, ipcMain } = require('electron')
const { Blinken } = require('./main/blinken')

const path = require('path')

const { Tray, Menu } = require('electron/main')
const { icons } = require('./icons')

const env = process.env.NODE_ENV || 'prod';

if (env === 'development') {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
  } catch (_) { console.log('Error'); }
}

var blinken = null

var hidLightFeatureBusted = (hid, ledVal) => {
  var buf = new ArrayBuffer(8)
  var view = new DataView(buf)
  view.setInt8(0, 101)
  view.setInt8(1, 12)
  if (ledVal) {
    view.setInt8(2, ledVal)
  } else {
    view.setInt8(2, 1)
  }
  view.setInt8(3, 256)
  view.setInt8(4, 0)
  view.setInt8(5, 0)
  view.setInt8(6, 0)
  view.setInt8(7, 0)
  view.close()

  hid.write(new Int8Array(buf))
}

ipcMain.handle('hid_light_current', async (event) => {
  var ledVal = blinken.hidLightStatus()
  if (ledVal == Blinken.OFF) {
    //off
    win.webContents.send("hid_light_off", "on")
  } else if (ledVal == Blinken.GREEN) {
    //green
    win.webContents.send("hid_light_green", "on")
  } else if (ledVal == Blinken.RED) {
    //red
    win.webContents.send("hid_light_red", "on")
  } else if (ledVal == Blinken.YELLOW) {
    // yellow
    win.webContents.send("hid_light_yellow", "on")
  }
})

ipcMain.handle('hid_light_red', async (event) => {
  blinken.hidLightFeatureRed()
})
ipcMain.handle('hid_light_green', async (event) => {
  blinken.hidLightFeatureGreen()
})
ipcMain.handle('hid_light_yellow', async (event) => {
  blinken.hidLightFeatureYellow()
})
ipcMain.handle('hid_light_orange', async (event) => {
  blinken.hidLightFeatureYellow()
})
ipcMain.handle('hid_light_off', async (event) => {
  blinken.hidLightFeatureOff()
  blinken.stop()
})
ipcMain.handle('hid_light_blink', async (event) => {
  blinken.blink()
})

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 800,
    icon: nativeImage.createFromDataURL(icons.app),
    webPreferences: {
      preload: path.join(app.getAppPath(), 'renderer.js'),
      nodeintegration: true,
      contextIsolation: false
    }
  })
  global.win = win

  win.setIcon(nativeImage.createFromDataURL(icons.app))
  win.loadFile('index.html').then(() => {
  })

  if (env === 'development') {
    win.webContents.openDevTools()
  }

  var devices = Blinken.devices();
  var device = null
  for (var i = 0; i < devices.length; i++) {
    if (Blinken.canBlink(devices[i])) {
      device = devices[i]
      break
    }
  }
  if (device) {
    blinken = new Blinken(device)
    blinken.onStatusChange(Blinken.RED, () => {win.webContents.send("hid_light_red", "on")})
    blinken.onStatusChange(Blinken.GREEN, () => {win.webContents.send("hid_light_green", "on")})
    blinken.onStatusChange(Blinken.YELLOW, () => {win.webContents.send("hid_light_yellow", "on")})
    blinken.onStatusChange(Blinken.ORANGE, () => {win.webContents.send("hid_light_orange", "on")})
    blinken.onStatusChange(Blinken.OFF, () => {win.webContents.send("hid_light_off", "on")})    
  }
}

app.on('before-quit', () => {
  if (blinken) {
    blinken.close()
  }
})

app.whenReady().then(() => {
  createWindow()
})
