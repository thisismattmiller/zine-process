const H = require('highland')
const glob = require('glob')
const fs = require('fs')
const parseString = require('xml2js').parseString;

glob("/Volumes/Byeeee/zines/**", {}, function (er, files) {

  var getImages = function(path, callback){
    glob(`${path}/*.jpg`, {}, function (er, files) {
      callback(null,files)
    })
  }


  var allIndex = {}
  var count = 0

  var parseIAXml = function(jpgs,callback){

    var xmlFile = jpgs[0].split('/')
    var zineId = xmlFile[4]

    allIndex[zineId].iaTitle = null
    allIndex[zineId].iaDescription = null
    allIndex[zineId].iaSubject = null
    allIndex[zineId].iaCreator = null
    allIndex[zineId].iaId = null
    allIndex[zineId].iaLanguage = null
    allIndex[zineId].iaURL = null
    allIndex[zineId].iaArk = null

    xmlFile = `${xmlFile[0]}/${xmlFile[1]}/${xmlFile[2]}/${xmlFile[3]}/${xmlFile[4]}/${xmlFile[4]}_meta.xml`
    var xml = fs.readFileSync(xmlFile, 'utf8')
    parseString(xml, function (err, result) {
      allIndex[zineId].iaTitle = result.metadata.title[0]
      allIndex[zineId].iaDescription = result.metadata.description[0]
      allIndex[zineId].iaSubject = result.metadata.subject[0]
      allIndex[zineId].iaCreator = result.metadata.creator[0]
      allIndex[zineId].iaId = result.metadata.identifier[0]
      if (result.metadata.language) allIndex[zineId].iaLanguage = result.metadata.language[0]
      allIndex[zineId].iaURL = result.metadata['identifier-access'][0]
      allIndex[zineId].iaArk = result.metadata['identifier-ark'][0]
      callback(null,jpgs)
    })    
  }


  H(files)
    .map((f)=>{
      if (!f.endsWith('/pages')) return ''
      return f
    })
    .compact()
    .map(H.curry(getImages))
    .nfcall([])
    .parallel(1)
    .map((jpgs)=>{
      console.log(count++)


      //write out the completed ones
      Object.keys(allIndex).forEach((zineId) =>{
        var path = allIndex[zineId].pathToMeta.toString()
        delete allIndex[zineId].pathToMeta
        fs.writeFileSync(`${path}data.json`,JSON.stringify(allIndex[zineId]))
        delete allIndex[zineId]
      })

      var pathToMeta = jpgs[0].split('/')
      pathToMeta = `${pathToMeta[0]}/${pathToMeta[1]}/${pathToMeta[2]}/${pathToMeta[3]}/${pathToMeta[4]}/meta/`

      // create the over all data index for it
      allIndex[jpgs[0].split('/')[4]] = {zine: jpgs[0].split('/')[4], pageCount: jpgs.length, pageData: {}, pathToMeta: pathToMeta}
      return jpgs
    })
    .map(H.curry(parseIAXml))
    .nfcall([])
    .parallel(1)
    .flatten()
    .map((jpg)=>{

      var zineId = jpg.split('/')[4]
      var pageId = jpg.split('/')[6]

      var fileLabels = jpg.replace('/pages/','/meta/').replace('.jpg','_labels.json')
      var fileText = jpg.replace('/pages/','/meta/').replace('.jpg','_text.json')
      var fileProperties = jpg.replace('/pages/','/meta/').replace('.jpg','_properties.json')
      var fileFaces = jpg.replace('/pages/','/meta/').replace('.jpg','_faces.json')

      var lables = {}
      var text = {}
      var properties = {}
      var faces = {}

      try{
        lables = JSON.parse(fs.readFileSync(fileLabels, 'utf8'))
      }catch (e){
        console.log('No',fileLabels)
      }
      try{
        text = JSON.parse(fs.readFileSync(fileText, 'utf8'))
      }catch (e){
        console.log('No',fileText)
      }
      try{
        properties = JSON.parse(fs.readFileSync(fileProperties, 'utf8'))
      }catch (e){
        console.log('No',fileProperties)
      }
      try{
        faces = JSON.parse(fs.readFileSync(fileFaces, 'utf8'))
      }catch (e){
        console.log('No',fileFaces)
      }
      allIndex[zineId].pageData[pageId] = {}
      allIndex[zineId].pageData[pageId].lables = lables
      allIndex[zineId].pageData[pageId].text = text
      allIndex[zineId].pageData[pageId].properties = properties
      allIndex[zineId].pageData[pageId].faces = faces

      // if (fs.existsSync(newFilename)){
      // console.log(JSON.stringify(allIndex[zineId],null,2))

    })  
    .done(()=>{

      //write out the final one
      Object.keys(allIndex).forEach((zineId) =>{
        var path = allIndex[zineId].pathToMeta.toString()
        delete allIndex[zineId].pathToMeta
        fs.writeFileSync(`${path}data.json`,JSON.stringify(allIndex[zineId]))
        delete allIndex[zineId]
      })

    })


})
