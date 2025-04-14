const { app, BrowserWindow, nativeImage, ipcMain } = require('electron')
const { Blinken } = require('./main/blinken')
const { BlinkenTLSServer, BlinkenTLSClient } = require('./main/client-server')

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
var blinkenServer = null
var blinkenClient = null

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

var handleCurrent = (ledVal) => {
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
}

ipcMain.handle('hid_light_current', async (event) => {
  var ledVal = Blinken.OFF
  if (blinken) {
    handleCurrent(blinken.hidLightStatus())
  } else {
    blinkenClient.send(hid_light_current, "on")
  }
})

ipcMain.handle('hid_light_red', async (event) => {
  if (blinken) { blinken.hidLightFeatureRed() }
  if (blinkenClient) {
    blinkenClient.send('hid_light_red', "on")
  }
})
ipcMain.handle('hid_light_green', async (event) => {
  if (blinken) { blinken.hidLightFeatureGreen() }
  if (blinkenClient) {
    blinkenClient.send('hid_light_green', "on")
  }
})
ipcMain.handle('hid_light_yellow', async (event) => {
  if (blinken) { blinken.hidLightFeatureYellow() }
  if (blinkenClient) {
    blinkenClient.send('hid_light_yellow', "on")
  }
})
ipcMain.handle('hid_light_orange', async (event) => {
  if (blinken) { blinken.hidLightFeatureYellow() }
  if (blinkenClient) {
    blinkenClient.send('hid_light_orange', "on")
  }
})
ipcMain.handle('hid_light_off', async (event) => {
  if (blinken) {
    blinken.hidLightFeatureOff()
    blinken.stop()
  }
  if (blinkenClient) {
    blinkenClient.send('hid_light_off', "on")
  }
})
ipcMain.handle('hid_light_blink', async (event) => {
  if (blinken.blinking) {
    
  } else {
    blinken.blink()
    if (blinkenClient) {
      blinkenClient.send('hid_light_blink', "on")
    }
  }
})
ipcMain.handle('hid_light_blink_ontime', async (event, val) => {
  if (blinken) { blinken.onTime = val }
  if (blinkenClient) {
    blinkenClient.send('hid_light_blink_ontime', val)
  }
  //console.log("blinken.onTime " + blinken.onTime)
})
ipcMain.handle('hid_light_blink_offtime', async (event, val) => {
  if (blinken) { blinken.offTime = val }
  if (blinkenClient) {
    blinkenClient.send('hid_light_blink_offtime', val)
  }
  //console.log("blinken.offTime " + blinken.offTime)
})

const createWindow = () => {
  const win = new BrowserWindow({
    width: 550,
    height: 580,
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

  // create the blinken light EVEN if the device is not found
  blinken = new Blinken(device)

  // only fires when the light is plugged in, create blinken with device and enable server 
  blinken.onStatusChange(Blinken.RED, () => { win.webContents.send("hid_light_red", "on") })
  blinken.onStatusChange(Blinken.GREEN, () => { win.webContents.send("hid_light_green", "on") })
  blinken.onStatusChange(Blinken.YELLOW, () => { win.webContents.send("hid_light_yellow", "on") })
  blinken.onStatusChange(Blinken.ORANGE, () => { win.webContents.send("hid_light_orange", "on") })
  blinken.onStatusChange(Blinken.OFF, () => { win.webContents.send("hid_light_off", "on") })

  if (device) {
    // the Delcom HID device is plugged in so create a server for it
    blinkenServer = new BlinkenTLSServer()
    blinkenServer.addHandler("hid_light_red", (data) => { blinken.hidLightFeatureRed() })
    blinkenServer.addHandler("hid_light_green", (data) => { blinken.hidLightFeatureGreen() })
    blinkenServer.addHandler("hid_light_yellow", (data) => { blinken.hidLightFeatureYellow() })
    blinkenServer.addHandler("hid_light_orange", (data) => { blinken.hidLightFeaturOrange() })
    blinkenServer.addHandler("hid_light_off", (data) => { blinken.hidLightFeatureOff() })

    blinkenServer.addHandler("hid_light_blink", (data) => { blinken.blink() })
    blinkenServer.addHandler("hid_light_blink_ontime", (data) => { blinken.onTime = data })
    blinkenServer.addHandler("hid_light_blink_offtime", (data) => { blinken.offTime = data })

    blinkenServer.start()
  } else {
    console.log("Delcom light not found defaulting to TLS client mode\n")
    // using a self-signed cert, so sue me
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    blinkenClient = new BlinkenTLSClient()
    blinkenClient.addHandler("hid_light_current", (data) => { handleCurrent(data); win.webContents.send("hid_light_current", data) })

    blinkenClient.addHandler("hid_light_red", (data) => { win.webContents.send("hid_light_red", data) })
    blinkenClient.addHandler("hid_light_green", (data) => { win.webContents.send("hid_light_green", data) })
    blinkenClient.addHandler("hid_light_yellow", (data) => { win.webContents.send("hid_light_yellow", data) })
    blinkenClient.addHandler("hid_light_orange", (data) => { win.webContents.send("hid_light_orange", data) })
    blinkenClient.addHandler("hid_light_off", (data) => { win.webContents.send("hid_light_off", data) })

    blinkenClient.addHandler("hid_light_blink", (data) => { win.webContents.send("hid_light_blink", data) })
    blinkenClient.addHandler("hid_light_blink_ontime", (data) => { win.webContents.send("hid_light_blink_ontime", data) })
    blinkenClient.addHandler("hid_light_blink_offtime", (data) => { win.webContents.send("hid_light_blink_ontime", data) })
  }
}

app.on('before-quit', () => {
  if (blinken) {
    blinken.close()
  }
  if (blinkenClient) {
    blinkenClient.close()
  }
  if (blinkenServer) {
    blinkenServer.close()
  }
})

app.whenReady().then(() => {
  createWindow()
})
