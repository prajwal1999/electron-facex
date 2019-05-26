const remote = require('electron').remote
const app = remote.require('./app.js')
const fs = require('fs')
const path = require('path')

let UserDataPathName = path.join(remote.app.getPath('userData'), 'Local Storage')
let file2 = path.join(UserDataPathName, 'tempData.json')
let file3 = path.join(UserDataPathName, 'found_response.json')
let signOut = ()=>{
    fs.unlink(file2, (err)=>{
        console.log(err)
    })
    fs.unlink(file3, (err)=>{
        console.log(err)
    })

    setTimeout(()=>{
        let CurrWindow = remote.getCurrentWindow()
        app.openWindow('login')
        CurrWindow.close()
    }, 150)
}

module.exports.signOut = signOut