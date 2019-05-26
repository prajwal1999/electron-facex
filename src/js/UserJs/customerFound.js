const remote = require('electron').remote
const app = remote.require('./app.js')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const signOut = require('../../js/signOut.js').signOut

let sign_out = ()=>{
  signOut()
}

var global_imageName, global_imageData, global_realImagedata, global_storeId, global_res_name, global_res_email, global_res_number

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
let file2 = path.join(UserDataPathName, 'found_response.json')
fs.readFile(file2, 'utf8', (err, data)=>{
    if(err){
        console.log(err)
    }else{
        obj = JSON.parse(data)
        global_res_name= obj.name
        global_res_email = obj.email
        global_res_number = obj.number
        document.getElementById('name').innerHTML = global_res_name
        document.getElementById('email').innerHTML = global_res_email
        document.getElementById('number').innerHTML = global_res_number
    }
})

let ok = ()=>{
    fs.unlink(file, (err)=>{
        if(err){
            console.error(err)
        }
        else{
            fs.unlink(file2, (err2)=>{
                if(err2){
                    console.log(err2)
                }
                else{
                    let CurrWindow = remote.getCurrentWindow()
                    app.openWindow('UserView/home')
                    CurrWindow.close()
                }
            })  
        }
    })
}

let wrong = ()=>{
    fs.unlink(file2, (err2)=>{
        if(err2){
            console.log(err2)
        }
        else{
            let CurrWindow = remote.getCurrentWindow()
            app.openWindow('UserView/customerNotFound')
            CurrWindow.close()
        }
    }) 
}