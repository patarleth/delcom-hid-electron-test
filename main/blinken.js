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
class Blinken {
    static OFF = 255
    static GREEN = 254
    static RED = 253
    static YELLOW = 251
    static ORANGE = 251

    static devices() {
        return HID.devices()
    }

    constructor(hidLight) {
        this.device = hidLight;
        this.hid = new HID.HID(hidLight.vendorId, hidLight.productId)
    }
    
    changeHandlers = {}

    onStatusChange(status, fn) {
        this.changeHandlers[status] = fn
    }

    hidLightFeatureOff() {
        this.hid.write([0x65, 0x0C, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00])
        if(this.changeHandlers[Blinken.OFF]) {
            this.changeHandlers[Blinken.OFF]()
        }
        // console.log("after off - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after off - device current value [255,1,255,255,0,0,0,0]
    }
    hidLightFeatureGreen() {
        this.hid.write([0x65, 0x0C, 0x01, 0xFF, 0x00, 0x00, 0x00, 0x00])
        if(this.changeHandlers[Blinken.GREEN]) {
            this.changeHandlers[Blinken.GREEN]()
        }
        // console.log("after green - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after green - device current value [255,1,254,255,0,0,0,0]
    }
    hidLightFeatureRed() {
        this.hid.write([0x65, 0x0C, 0x02, 0xFF, 0x00, 0x00, 0x00, 0x00])
        if(this.changeHandlers[Blinken.RED]) {
            this.changeHandlers[Blinken.RED]()
        }
        // console.log("after red - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after red - device current value [255,1,253,255,0,0,0,0]
    }
    hidLightFeatureYellow() {
        this.hid.write([0x65, 0x0C, 0x04, 0xFF, 0x00, 0x00, 0x00, 0x00])
        if(this.changeHandlers[Blinken.YELLOW]) {
            this.changeHandlers[Blinken.YELLOW]()
        }
        // console.log("after yellow - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after yellow - device current value [255,1,251,255,0,0,0,0]
    }
    hidLightFeatureOrange() {
        this.hid.write([0x65, 0x0C, 0x04, 0xFF, 0x00, 0x00, 0x00, 0x00])
        if(this.changeHandlers[Blinken.ORANGE]) {
            this.changeHandlers[Blinken.ORANGE]()
        }
        // console.log("after yellow - device current value " + JSON.stringify(hid.getFeatureReport(1, 8)))
        // after yellow - device current value [255,1,251,255,0,0,0,0]
    }
    hidLightStatus() {
        var current = this.hid.getFeatureReport(1, 8)
        var ledVal = current[2]
        return ledVal
    }
    close() {
        console.log("closing hid device " + JSON.stringify(this.device))
        try {
            this.hid.close()
            console.log("hid device closed")
        } catch (error) {
            console.log(error)
        }
    }
}

exports.Blinken = Blinken