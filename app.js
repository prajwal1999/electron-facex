const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win


// given function returns path where the app is running
console.log(process.platform)

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 600,
    height: 1000,
    webPreferences: {
      nodeIntegration: true
    }
  })


  // and load the index.html of the app.
  let UserDataPathName = path.join(app.getPath('userData'), 'Local Storage')
  let file = path.join(UserDataPathName, 'data.json')
  fs.readFile(file, 'utf8', (err, data)=>{
    if(err){
      console.log('err is', err)
      win.loadURL(path.join('file://',__dirname, 'src/views/index.html'))
    } else{
      let obj = JSON.parse(data)
      console.log(obj)
      if(obj.storeId && obj.password){
        console.log(obj.storeId, obj.password)
        win.loadURL(path.join('file://',__dirname, 'src/views/login.html'))
      }
      else if(obj.storeId){
        console.log(obj.storeId)
        win.loadURL(path.join('file://',__dirname, 'src/views/setPass.html'))
      }
      else{
        win.loadURL(path.join('file://',__dirname, 'src/views/index.html'))
      } 
    }
  })


  // win.loadURL(path.join('file://',__dirname, 'src/views/UserView/home.html'))

  // Open the DevTools.
//   win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

exports.openWindow = (filename)=>{
    let win2 = new BrowserWindow({ 
        width: 600, 
        height: 1000,
        webPreferences: {
            nodeIntegration: true
        }
    })

    let file2 = 'src/views/' + filename + '.html'

    win2.loadURL(path.join('file://',__dirname, file2))
}