const { remote, ipcRenderer } = require('electron')

var onColor = 'red'
var offColor = null

var svg = null
var grayPart = null
var whitePart = null

var redButton = null
var greenButton = null
var orangeButton = null
var offButton = null

var blinkButton = null
var ontimeRange = null
var ontimeBadge = null
var offtimeRange = null
var offtimeBadge = null

var lightOff = () => {
    grayPart.style.fill = offColor
    whitePart.style.fill = "#FFFFFF" 
}

var lightOrange = () => { 
    grayPart.style.fill = "orange"
    whitePart.style.fill = "yellow" 
}

var lightBlue = () => {
    grayPart.style.fill = "blue"
    whitePart.style.fill = "#ADD8E6"
}

var lightGreen = () => { 
    grayPart.style.fill = "green"
    whitePart.style.fill = "#90EE90" 
}

var lightRed = () => {
    grayPart.style.fill = "red"
    whitePart.style.fill = "#FFCCCB"
}

ipcRenderer.on('hid_light_red', function(e, msg) { lightRed() })
ipcRenderer.on('hid_light_green', function(e, msg) { lightGreen() })
ipcRenderer.on('hid_light_yellow', function(e, msg) { lightOrange() })
ipcRenderer.on('hid_light_orange', function(e, msg) { lightOrange() })
ipcRenderer.on('hid_light_off', function(e, msg) { lightOff() })

var sendLightRed = (event) => {
    ipcRenderer.invoke('hid_light_red', "on")
}
var sendLightGreen = (event) => {
    ipcRenderer.invoke('hid_light_green', "on")
}
var sendLightOrange = (event) => {
    ipcRenderer.invoke('hid_light_orange', "on")
}
var sendLightOff = (event) => {
    ipcRenderer.invoke('hid_light_off', "on")
}
var sendBlink = (event) => {
    ipcRenderer.invoke('hid_light_blink', "on")
}

var sendLightCurrent = () => {
    ipcRenderer.invoke('hid_light_current')
}

var setOntimeBadge = (event) => {
    ontimeBadge.innerHTML = ontimeRange.value+"ms"
}
var sendOntime = (event) => {
    ipcRenderer.invoke('hid_light_blink_ontime', parseInt(ontimeRange.value))
}

var setOfftimeBadge = (event) => {
    offtimeBadge.innerHTML = offtimeRange.value+"ms"
}
var sendOfftime = (event) => {
    ipcRenderer.invoke('hid_light_blink_offtime', parseInt(offtimeRange.value))
}

window.onload = function(e) {
    console.log('renderer.js to the rescue!')
    svg = document.getElementById("light_svg").contentDocument
    if(svg) {
        grayPart = svg.getElementById("grayPart")
        whitePart = svg.getElementById("whitePart")
        offColor = grayPart.style.fill
    } else {
        console.log("svg not found")
    }

    redButton = document.getElementById("red_button")
    redButton.onclick = sendLightRed
    
    greenButton = document.getElementById("green_button")
    greenButton.onclick = sendLightGreen
        
    orangeButton = document.getElementById("orange_button")
    orangeButton.onclick = sendLightOrange
    
    offButton = document.getElementById("off_button")
    offButton.onclick = sendLightOff

    blinkButton = document.getElementById("blink_button")
    blinkButton.onclick = sendBlink
    
    ontimeBadge = document.getElementById("ontime_badge")
    ontimeRange = document.getElementById("ontime_range")
    ontimeRange.onchange = sendOntime
    ontimeRange.oninput = setOntimeBadge
    
    offtimeBadge = document.getElementById("offtime_badge")
    offtimeRange = document.getElementById("offtime_range")
    offtimeRange.onchange = sendOfftime
    offtimeRange.oninput = setOfftimeBadge
    
    sendLightCurrent()
}

