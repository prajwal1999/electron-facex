const remote = require('electron').remote
const app = remote.require('./app.js')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const signOut = require('../../js/signOut.js').signOut

let sign_out = ()=>{
  signOut()
}

var global_imageName, global_imageData, global_realImagedata, global_storeId

let UserDataPathName = path.join(remote.app.getPath('userData'), 'Local Storage')
let file = path.join(UserDataPathName, 'tempData.json')
fs.readFile(file, 'utf8', (err, data)=>{
    if(err){
        console.log(err)
    }else{
        obj = JSON.parse(data)
        global_imageName= obj.imageName
        global_imageData = obj.imageData
        global_realImagedata = obj.realImagedata
        document.getElementById('faceIMG').src = global_imageData
    }
})


let cancel = ()=>{
    fs.unlink(file, (err)=>{
        if(err){
            console.error(err)
        }
        else{
            let CurrWindow = remote.getCurrentWindow()
            app.openWindow('UserView/home')
            CurrWindow.close()
        }
    })
}