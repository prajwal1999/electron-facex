const remote = require('electron').remote
const app = remote.require('./app.js')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const s3 = require('../../js/UserJs/s3helper.js')
const videoEl = $('#inputVideo').get(0)
const signOut = require('../../js/signOut.js').signOut

let sign_out = ()=>{
  signOut()
}

global.tempData = {}

faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
  })

let startVideo = async()=>{
  navigator.getUserMedia(
      {video:{}},
      stream => {
        videoEl.srcObject = stream
      },
      err => console.error(err)
  )

  let UserDataPathName = path.join(remote.app.getPath('userData'), 'Local Storage')
    let file = path.join(UserDataPathName, 'data.json')
    fs.readFile(file, 'utf8', (err, data)=>{
      if(err){
        console.log(err)
      }
      else{
        obj = JSON.parse(data)
        global.tempData.storeId = obj.storeId6
      }
    })
}

startVideo()
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('../../ML-Api/weights/')
]).then(startVideo)

async function onPlay() { 
    if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
      return setTimeout(() => onPlay())

    const options = getFaceDetectorOptions()
    const result = await faceapi.detectSingleFace(videoEl, options)
    if (result) {
      const canvas = $('#overlay').get(0)
      const dims = faceapi.matchDimensions(canvas, videoEl, true)
      faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))
    }
    else {
      const canvas = $('#overlay').get(0)
      faceapi.draw.drawDetections(canvas, null)
    } 
    setTimeout(() => onPlay())
  }



  const checkSingleFrame = async () =>{
    const options = getFaceDetectorOptions()
    const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      canvas.getContext('2d').drawImage(videoEl, 0, 0);
    let temp_img = document.createElement('img');
      temp_img.src = canvas.toDataURL('image/jpeg');
    let image_result = await faceapi.detectSingleFace(temp_img, options)
    if(image_result){
      const _x = image_result.box['x']-image_result.box['width']/20
      const _y = image_result.box['y']-image_result.box['height']/20
      const _width = image_result.box['width']*1.1
      const _height = image_result.box['height']*1.1     
      let crop_canvas = document.createElement('canvas');
        crop_canvas.width = _width
        crop_canvas.height = _height
      let ctx = crop_canvas.getContext('2d');
        ctx.drawImage(temp_img, _x, _y, _width, _height, 0, 0, _width, _height);
      let croppedImgdata = crop_canvas.toDataURL('image/jpeg')
      return {status: true, imgData: croppedImgdata, realImgdata: temp_img.src}
    } else {
      temp_img.src = '';
      return {status:false}
    } 
  }


  const detectImage = () => {
    let success_result = [];
    let get_multi_frames = setInterval(()=>{
      checkSingleFrame().then((res)=>{
      success_result.push(res)
      })
    }, 70)
    
    setTimeout(async ()=>{
      let success = false;
      clearInterval(get_multi_frames)

      for(let i=0; i < success_result.length; i++){ 
        if(success_result[i].status != false){
          global.tempData.imageName =  setImageName()
          global.tempData.imageData = success_result[i].imgData
          global.tempData.realImagedata = success_result[i].realImgdata
          success = true
          break
        } else{
          console.log('status is false')
          }
      }
      if(!success){
        $('#not-detected-div').removeClass('d-none')
        setTimeout(()=>{
          $('#not-detected-btn').click()
        }, 2000)
      } else{
        $('#spinner').removeClass('d-none')
      }
    }, 520)   
  }

  // function for setting image name
 function setImageName(){
      let storeId = global.tempData.storeId
      let d = new Date()
      let year = d.getUTCFullYear().toString()
      let month = d.getUTCMonth() + 1
        if(month < 10){month = '0'+month.toString()}
        else{month = month.toString()}
      let date = d.getUTCDate().toString()
      let hours = d.getUTCHours()
      let minute = d.getUTCMinutes()
      let second = d.getUTCSeconds()
      return storeId.toString() + date + month + year + hours + minute + second
}


let register = ()=>{
  detectImage()
  setTimeout(()=>{
    let pathName = path.join(remote.app.getPath('userData'), 'Local Storage')
    let file = path.join(pathName, 'tempData.json')
    let contentObj = {}
    contentObj.imageName = global.tempData.imageName
    contentObj.imageData = global.tempData.imageData
    contentObj.realImagedata = global.tempData.realImagedata
    content = JSON.stringify(contentObj)
    fs.writeFile(file, content, 'utf8', (err)=>{
      if(err){
        return console.log(err)
      }
      else{
        let CurrWindow = remote.getCurrentWindow()
        app.openWindow('UserView/customerRegister')
        CurrWindow.close()
      }
    })
  },600)
}

let verifyImage = ()=>{
  detectImage()
  setTimeout(()=>{
    let pathName = path.join(remote.app.getPath('userData'), 'Local Storage')
    let file = path.join(pathName, 'tempData.json')
    let contentObj = {}
    contentObj.imageName = global.tempData.imageName
    contentObj.imageData = global.tempData.imageData
    contentObj.realImagedata = global.tempData.realImagedata
    content = JSON.stringify(contentObj)
    fs.writeFile(file, content, 'utf8', (err)=>{
      if(err){
        return console.log(err)
      }
    })

    buf = new Buffer(global.tempData.imageData.replace(/^data:image\/\w+;base64,/, ""),'base64')
    let params = {
      "Bucket":"photorecog",
      "Key": global.tempData.imageName + ".jpeg",
      "ContentType":'image/jpeg',
      "Body": buf,
      "ContentEncoding": 'base64',
      "ACL":"private"
    };
  
    let params2 = {
      "bucket":"photorecog",
      "photo": global.tempData.imageName + ".jpeg",
      "collectionId": "testCollection"
    };

    s3.uploadS3(params, (data, err)=>{
      if(err){
        console.log('error in upload s3', err)
      } else{
        console.log('data is true', data)
        axios.post('http://ec2-13-234-136-115.ap-south-1.compute.amazonaws.com:3000/v0.01a/identify', params2)
        .then(function (response) {
          console.log('identify data', response.data)
          if(response.data.found){
            console.log('verified found')
            let pathName = path.join(remote.app.getPath('userData'), 'Local Storage')
            let file = path.join(pathName, 'found_response.json')
            contentObj = {}
            contentObj.name = response.data.name
            contentObj.email = response.data.email
            contentObj.number = response.data.number
            content = JSON.stringify(contentObj)
            fs.writeFile(file, content, 'utf8',(err)=>{
              if(err){
                  return console.log(err)
              }
              else{
                let CurrWindow = remote.getCurrentWindow()
                app.openWindow('UserView/customerFound')
                CurrWindow.close()
              }
            })
          } else{
            console.log('not found')
            let CurrWindow = remote.getCurrentWindow()
            app.openWindow('UserView/customerNotFound')
            CurrWindow.close()
          }
        })
      }
    })

  }, 600)
}

