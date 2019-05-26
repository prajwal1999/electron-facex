const remote = require('electron').remote
const app = remote.require('./app.js')
const axiox = require('axios')
const fs = require('fs')
const path = require('path')
const encrypt = require('crypto')

let $ = (id)=>{
    return document.getElementById(id)
}

let hash = (pass)=> {
    let key = "sekret key faceX"
    let enc = encrypt.createCipher("aes-256-ctr", key).update(pass, "utf8", "hex")
    return enc
}


$('change-pass').onclick = (event)=>{
    console.log('wofihrg')
    let CurrWindow = remote.getCurrentWindow()
    app.openWindow('changePass')
    CurrWindow.close()
}

$('ok-btn').onclick = (event)=> {
    let pass = $('pass-input').value
    let pathName = path.join(remote.app.getPath('userData'), 'Local Storage')
    let file = path.join(pathName, 'data.json')
    
    fs.readFile(file, 'utf8', (err, data)=>{
        if(err){
            console.log('err in reading file', err)
        }else {
            let obj = JSON.parse(data)
            if(hash(pass) == obj.password){
                console.log('good to go')
                let CurrWindow = remote.getCurrentWindow()
                app.openWindow('UserView/home')
                CurrWindow.close()
            }
            else{
                console.log('password is incorrect')
            }
        }
    })
}
