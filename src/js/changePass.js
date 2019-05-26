const remote = require('electron').remote
const app = remote.require('./app.js')
const axiox = require('axios')
const fs = require('fs')
const path = require('path')
const encrypt = require('crypto')

let hash = (pass)=> {
    let key = "sekret key faceX"
    let enc = encrypt.createCipher("aes-256-ctr", key).update(pass, "utf8", "hex")
    return enc
}


const getPassword = ()=>{
    let pathName = path.join(remote.app.getPath('userData'), 'Local Storage')
    let file = path.join(pathName, 'data.json')

    return new Promise((resolve, reject)=>{
        fs.readFile(file, 'utf8', (err, data)=>{
            if(err){
                reject(err)
            } else{
                const obj = JSON.parse(data)
                resolve(obj.password)
            }
        })
    })
}

const savePassword = (pass)=>{
    let pathName = path.join(remote.app.getPath('userData'), 'Local Storage')
    let file = path.join(pathName, 'data.json')
    return new Promise((resolve, reject)=>{
        fs.readFile(file, 'utf8', (err, data)=>{
            if(err){
                console.log('err in reading file', err)
                reject(err)
            }else {
                let obj = JSON.parse(data)
                obj.password = hash(pass)
                content = JSON.stringify(obj)
                fs.writeFile(file, content, 'utf8', (err)=>{
                    if(err){
                        console.log(err)
                        reject(err)
                    }
                    else{
                        resolve(true)
                    }
                })
            }
        })
    })
}


const change = async ()=>{
    let password_from_file
    try {
        password_from_file = await getPassword()
    } catch (error) {
        console.log(error)
        let CurrWindow = remote.getCurrentWindow()
        app.openWindow('setPass')
        CurrWindow.close()
    }
    const currPass = $('#CurrPass-input').val()
    const pass = $('#pass-input').val()
    const Cpass = $('#Cpass-input').val()
    console.log(hash(currPass), password_from_file)
    if(password_from_file == hash(currPass)){
        if(pass == Cpass){
            try {
                const result = await savePassword(pass)
                let CurrWindow = remote.getCurrentWindow()
                app.openWindow('login')
                CurrWindow.close()
            } catch (error) {
                console.log(error)
            }
        } else{
            console.log('password didn\'t match')
        }
    } else{
        console.log('current password is wrong')
    }
}
