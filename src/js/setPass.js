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


let updataData = (pass) => {
    let pathName = path.join(remote.app.getPath('userData'), 'Local Storage')
    let file = path.join(pathName, 'data.json')
    fs.readFile(file, 'utf8', (err, data)=>{
        if(err){
            console.log('err in reading file', err)
        }else {
            let obj = JSON.parse(data)
            obj.password = hash(pass)
            content = JSON.stringify(obj)
            fs.writeFile(file, content, 'utf8', (err)=>{
                if(err){
                    console.log(err)
                }
                else{
                    let CurrWindow = remote.getCurrentWindow()
                    app.openWindow('login')
                    CurrWindow.close()
                }
            })
        }
    })
}


$('ok-btn').onclick = ()=>{
    let pass = $('pass-input').value
    let Cpass = $('Cpass-input').value
    console.log(pass, Cpass)
    if(pass == Cpass){
        updataData(pass)
    }
}
