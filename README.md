# electron test

The app does nothing. I mean it. Just a playground for messing with the uikit, well.. toolkit. If new to Electron, this app framework splits the work into two processes - chrome for ui and node for native backend. Communication between the ps, is handled using ipcMain and ipcRenderer.

[main.js](main.js) contains the app's node functions and is responsible for init's the app/window and registering functions for 'ipcMain' which exposes them to the ui

[renderer.js](renderer.js) is for chrome and connects the button ids to messages sent using the ipcRenderer lib from electron. This setup allows the UI to asyc call functions in the node app.

[index.html](index.html) ...uh.. yah.. is the html :slightly_smiling_face: 

NOTE: In this very stupid & ugly app, I do not set any js onclick functions in the view. All onclick functions are registered in renderer.js on window.onload No actual reason... just wanted the separation of concerns clear while learning uikit and electron.