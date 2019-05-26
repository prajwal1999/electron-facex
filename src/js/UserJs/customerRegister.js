const remote = require('electron').remote
const app = remote.require('./app.js')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const s3 = require('../../js/UserJs/s3helper.js')
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
let file2 = path.join(UserDataPathName, 'data.json')
fs.readFile(file2, 'utf8', (err, data)=>{
    if(err){
        console.log(err)
    }
    else{
        obj = JSON.parse(data)
        global_storeId= obj.storeId
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

document.getElementById('ok-btn').addEventListener("click", (event)=>{
    event.preventDefault()
    buf = new Buffer(global_imageData.replace(/^data:image\/\w+;base64,/, ""),'base64')
    let regParams = {
        "Bucket":"photorecog",
        "Key": global_imageName,
        "ContentType":'image/jpeg',
        "Body": buf,
        "ContentEncoding": 'base64',
        "ACL":"private",
        "Metadata": {
          "name": $('#inputName').val(),
          "number": $('#inputNumber').val(),
          "email": $('#inputEmail').val(),
          "storeId": global_storeId
        }
      }
    
      let regParams2 = {
        "bucket":"photorecog",
        "photo": global_imageName,
        "collectionId": "testCollection"
      }

    let name = $('#inputName').val()
    let email = $('#inputEmail').val()
    let number = $('#inputNumber').val()
    if(name == "" || email == "" || number == ""){
        console.log("please fill all the details")
    }
    else{
        s3.uploadS3(regParams, (data, err)=>{
            if(err){
                console.log('error in upload s3', err)
            }
            else{
                axios.post('http://ec2-13-234-136-115.ap-south-1.compute.amazonaws.com:3000/v0.01a/registerUser', regParams2)
                .then(function (response) {
                     console.log('registering data', response.data)
                     cancel()
                 })
                 .catch(function (error) {console.log('s3 image upload', error)});
                    console.log('data is true', data)
                }
        })
    }
})

