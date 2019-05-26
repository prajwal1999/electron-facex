const remote = require('electron').remote
const app = remote.require('./app.js')
const axiox = require('axios')
const fs = require('fs')
const path = require('path')

// console.log(app.app.getPath('userData'))

let $ = (id)=>{
    return document.getElementById(id)
}


// console.log(process.defaultApp)
let pathName = path.join(remote.app.getPath('userData'), 'Local Storage')

$('ok-btn').onclick = (event)=>{
    let file = path.join(pathName, 'data.json')
    let storeId = $('storeId-input').value
    let userData = {}
    userData.storeId = storeId
    content = JSON.stringify(userData)

    axiox.post('http://ec2-13-234-136-115.ap-south-1.compute.amazonaws.com:3000/v0.01a/verifyInstallation', {
        storeId: storeId
    })
    .then((res)=>{
        console.log(res.status)
        if(res.status == 200){
            fs.writeFile(file, content, 'utf8',(err)=>{
                if(err){
                    return console.log(err)
                }
                else{
                    console.log("the file was created")
                    let CurrWindow = remote.getCurrentWindow()
                    app.openWindow('setPass')
                    CurrWindow.close()
                }
            })
        }
    })
    .catch((err)=>{
        console.log(err)
    })

    
    
    

}

