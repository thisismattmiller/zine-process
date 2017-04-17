
// Imports the Google Cloud client library
const Vision = require('@google-cloud/vision')
// Your Google Cloud Platform project ID
const projectId = 'brave-octane-164321'
// Instantiates a client
const visionClient = Vision({
  projectId: projectId
})
const H = require('highland')
const glob = require('glob')
const fs = require('fs')

glob("/Volumes/Byeeee/zines/**", {}, function (er, files) {

  var options = {
    verbose: true
  };

  var detectLabels = function(data, callback){




    var outFilename = `${data.metaDir}${data.filename.replace('.jpg','_labels.json')}`
    if (fs.existsSync(outFilename)){
      callback(null,data)
      return false
    }
    visionClient.detectLabels(data.fullFilenamePath, options, function(err, results, apiResponse) {
     if (err) {
      console.log(JSON.stringify(err,null,2))

      setTimeout(()=>{
        callback(null,data)
      },1000)
      // process.exit(1)

     }else{      
      fs.writeFileSync(outFilename,JSON.stringify(results))
      setTimeout(()=>{
        callback(null,data)
      },10)
      
     }
    })
  }

  var detectText = function(data, callback){




    var outFilename = `${data.metaDir}${data.filename.replace('.jpg','_text.json')}`
    if (fs.existsSync(outFilename)){
      callback(null,data)
      return false
    }
    visionClient.detectText(data.fullFilenamePath, options, function(err, results, apiResponse) {
     if (err) {
      console.log(JSON.stringify(err,null,2))

      setTimeout(()=>{
        callback(null,data)
      },1000)
      // process.exit(1)

     }else{      
      fs.writeFileSync(outFilename,JSON.stringify(results))
      setTimeout(()=>{
        callback(null,data)
      },10)
      
     }
    })
  }


  var detectProperties = function(data, callback){




    var outFilename = `${data.metaDir}${data.filename.replace('.jpg','_properties.json')}`
    if (fs.existsSync(outFilename)){
      callback(null,data)
      return false
    }
    visionClient.detectProperties(data.fullFilenamePath, options, function(err, results, apiResponse) {
     if (err) {
      console.log(JSON.stringify(err,null,2))

      setTimeout(()=>{
        callback(null,data)
      },1000)
      // process.exit(1)

     }else{      
      fs.writeFileSync(outFilename,JSON.stringify(results))
      setTimeout(()=>{
        callback(null,data)
      },10)
      
     }
    })
  }

  var detectFaces = function(data, callback){




    var outFilename = `${data.metaDir}${data.filename.replace('.jpg','_faces.json')}`
    if (fs.existsSync(outFilename)){
      callback(null,data)
      return false
    }
    visionClient.detectFaces(data.fullFilenamePath, options, function(err, results, apiResponse) {
     if (err) {
      console.log(JSON.stringify(err,null,2))

      setTimeout(()=>{
        callback(null,data)
      },1000)
      // process.exit(1)

     }else{      
      fs.writeFileSync(outFilename,JSON.stringify(results))
      setTimeout(()=>{
        callback(null,data)
      },10)
      
     }
    })
  }


  H(files)
    .map((f)=>{
      if (!f.endsWith('.jpg')) return ''
      return f
    })
    .compact()
    .map((f)=>{
      var split = f.split('/')
    	var filename = split[split.length-1]
      var url = `http://s3.amazonaws.com/zinediscovery/${split[split.length-3]}/${split[split.length-2]}/${split[split.length-1]}`
      var metaDir = `${split[0]}/${split[1]}/${split[2]}/${split[3]}/${split[4]}/meta/`
      if (!fs.existsSync(metaDir)){
        fs.mkdirSync(metaDir)
      }
      console.log(filename,url)
      return {fullFilenamePath: f, filename: filename, url: url, metaDir: metaDir}
    })
    .map(H.curry(detectLabels))
    .nfcall([])
    .parallel(5)
    .map(H.curry(detectText))
    .nfcall([])
    .parallel(5)
    .map(H.curry(detectProperties))
    .nfcall([])
    .parallel(5)
    .map(H.curry(detectFaces))
    .nfcall([])
    .parallel(5)    
    .done(()=>{})


})

// var img = 'http://s3.amazonaws.com/zinediscovery/10AosDeZapatismoLaRebelinChiapaneca/pages/10AnosDeZapatismo-laRebelionChiapaneca_0006.jpg';

// var types = [
//   'face',
//   'label',
//   'crops',
//   'properties',
//   'safeSearch',
//   'text'
// ];

// visionClient.detect(img, types, function(err, detection, apiResponse) {
//  if (err) console.log(JSON.stringify(err,null,2))
//  // console.log(detection)
//  // console.log(apiResponse)


// });

// var options = {
//   verbose: true
// };

// visionClient.detectLabels(img, options, function(err, crops, apiResponse) {
//  if (err) console.log(JSON.stringify(err,null,2))
//  console.log(crops)

// })