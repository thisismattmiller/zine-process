const fs = require('fs')
const gm = require('gm').subClass({imageMagick: true})
const glob = require('glob')
const H = require('highland')
const resizeSteps = [10]
glob("/Volumes/Byeeee/zines/**", {}, function (er, files) {


  var resize = function (data, callback) {

    if (!data){
      cb(null,null)
      return null
    }

    var size = function(data, cb){
      gm(data.source)
        .resize(data.size)
        .quality(100)
        .write(data.target, function (err) {
          if (err) console.log(err)
          cb(null,null)
        })
    }



    H(resizeSteps)
      .map((sizeStep) =>{
        var newFilename = `${data.thumbsDir}/${data.fileName.replace('.jp2','.jpg')}`.toString()
        if (fs.existsSync(newFilename)){
          if (fs.statSync(newFilename).size < 4000000){
            return ''
          }
        }
        return {source:data.fileSource,target: newFilename, size: `${sizeStep}%`}
      })
      .compact()
      .map(H.curry(size))
      .nfcall([])
      .series()
      .done(()=>{
        callback(null,data)
      })

  }

  
  H(files)
    .map((f) =>{
      if (f.endsWith('.jp2')){
        var pathToNewDir = `/${f.split('/')[1]}/${f.split('/')[2]}/${f.split('/')[3]}/${f.split('/')[4]}`
        var fileName = f.split('/')[f.split('/').length-1]
        console.log(fileName)
        if (!fs.existsSync(`${pathToNewDir}/thumbs/`)){
          fs.mkdirSync(`${pathToNewDir}/thumbs/`)
        }
        
        // // do we have it converted already?
        // console.log(pathToNewDir)

        // if (fs.statSync(f).size > 4000000){
        //   console.log('toolarge',f)
        //   console.log(fs.statSync(f).size)
        // }else{

        // }
        console.log(pathToNewDir)

        return { fileSource: f, fileName:fileName, thumbsDir: `${pathToNewDir}/thumbs/` }


      }else{
        return ''
      }


    })
    .compact()
    .map(H.curry(resize))
    .nfcall([])
    .parallel(4)
    .map((data) =>{

      
    })
    .done(()=>{})




})



// gm('workingForAnOppressiveGovernmentAndOtherEssays_0008.jp2')
// .identify(function (err, data) {
// console.log(err)
//   if (!err) console.log(data)
// })
// .autoOrient()
// .write('oriented.jpg', function (err) {
//   if (err) console.log(err)
// });
