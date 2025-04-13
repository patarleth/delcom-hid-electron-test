const HID = require('node-hid');
HID.setDriverType('libusb');

/*
  {
  "vendorId": 4037,
  "productId": 45184,
  "path": "DevSrvsID:4333504954",
  "serialNumber": "",
  "manufacturer": "Delcom Products Inc.",
  "product": "USB IO Controller ",
  "release": 31,
  "interface": 0,
  "usagePage": 65280
}
*/
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Blinken {
    static OFF = 255
    static GREEN = 254
    static RED = 253
    static YELLOW = 251
    static ORANGE = 251

    static devices() {
        return HID.devices()
    }

    static canBlink(next) {
        return (next.manufacturer === "Delcom Products Inc.")
    }

    lastColor = Blinken.OFF
    changeHandlers = {}
    blinking = false
    onTime = 200
    offTime = 200

    constructor(hidLight) {
        this.device = hidLight;
        this.hid = new HID.HID(hidLight.vendorId, hidLight.productId)
    }

    onStatusChange(status, fn) {
        this.changeHandlers[status] = fn
    }

    stop() {
        if (this.blinking) {
            //console.log("stopping blinking")
        }
        this.blinking = false
    }

    async blink(onTime, offTime) {
        if (onTime) {
            this.onTime = onTime
        }
        if (offTime) {
            this.offTime = offTime
        }
        if (this.lastColor !== Blinken.OFF) {
            this.blinking = true
            while (this.blinking) {
                this.hidLightFeature(this.lastColor)
                await sleep(this.onTime)

                if (this.blinking) {
                    this.hidLightFeature(Blinken.OFF)
                    await sleep(this.offTime)
                }
            }
        }
    }
    hidLightFeature(color) {
        switch (color) {
            case Blinken.RED:
                this.hidLightFeatureRed(false)
                break
            case Blinken.GREEN:
                this.hidLightFeatureGreen(false)
                break
            case Blinken.YELLOW:
                this.hidLightFeatureYellow(false)
                break
            case Blinken.ORANGE:
                this.hidLightFeatureOrange(false)
                break
            case Blinken.OFF:
                this.hidLightFeatureOff(false)
                break
            default:
                console.log("unknown blinken color code " + color)
        }
    }
    setColor(byteArray, color, setLastColor) {
        this.hid.write(byteArray)
        if (setLastColor) {
            this.lastColor = color
        }
    }
    hidLightFeatureOff(setLastColor = true) {
        this.setColor([0x65, 0x0C, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00], Blinken.OFF, setLastColor)
        if (this.changeHandlers[Blinken.OFF]) {
            this.changeHandlers[Blinken.OFF]()
        }
        // console.log("after off - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after off - device current value [255,1,255,255,0,0,0,0]
    }
    hidLightFeatureGreen(setLastColor = true) {
        this.setColor([0x65, 0x0C, 0x01, 0xFF, 0x00, 0x00, 0x00, 0x00], Blinken.GREEN, setLastColor)
        if (this.changeHandlers[Blinken.GREEN]) {
            this.changeHandlers[Blinken.GREEN]()
        }
        // console.log("after green - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after green - device current value [255,1,254,255,0,0,0,0]
    }
    hidLightFeatureRed(setLastColor = true) {
        this.setColor([0x65, 0x0C, 0x02, 0xFF, 0x00, 0x00, 0x00, 0x00], Blinken.RED, setLastColor)
        if (this.changeHandlers[Blinken.RED]) {
            this.changeHandlers[Blinken.RED]()
        }
        // console.log("after red - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after red - device current value [255,1,253,255,0,0,0,0]
    }
    hidLightFeatureYellow(setLastColor = true) {
        this.setColor([0x65, 0x0C, 0x04, 0xFF, 0x00, 0x00, 0x00, 0x00], Blinken.YELLOW, setLastColor)
        if (this.changeHandlers[Blinken.YELLOW]) {
            this.changeHandlers[Blinken.YELLOW]()
        }
        // console.log("after yellow - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after yellow - device current value [255,1,251,255,0,0,0,0]
    }
    hidLightFeatureOrange(setLastColor = true) {
        this.setColor([0x65, 0x0C, 0x04, 0xFF, 0x00, 0x00, 0x00, 0x00], Blinken.ORANGE, setLastColor)
        if (this.changeHandlers[Blinken.ORANGE]) {
            this.changeHandlers[Blinken.ORANGE]()
        }
        // console.log("after yellow - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after yellow - device current value [255,1,251,255,0,0,0,0]
    }
    hidLightStatus() {
        var current = this.hid.getFeatureReport(1, 8)
        var ledVal = current[2]
        this.lastColor = ledVal
        return ledVal
    }
    async close() {
        console.log("closing hid device " + JSON.stringify(this.device))
        this.stop()
        var waitTime = (this.onTime > this.offTime) ? this.onTime : this.offTime
        await sleep(waitTime)
        try {
            this.hid.close()
            console.log("hid device closed")
        } catch (error) {
            console.log(error)
        }
    }
}

exports.Blinken = Blinken