const H = require('highland')
const glob = require('glob')
const fs = require('fs')


glob("/Volumes/Byeeee/zines/*/meta/data.json", {}, function (er, files) {

  var counter = 0
  var indexDatas = []

  H(files)
    .map((f)=>{
      var data = JSON.parse(fs.readFileSync(f, 'utf8'))
      var text = []
      var labels = []
      var hasFaces = false
      var colors = []
      Object.keys(data.pageData).forEach(key => {
        if (data.pageData[key].text && data.pageData[key].text[0] && data.pageData[key].text[0].desc)
          text.push(data.pageData[key].text[0].desc)

          if (data.pageData[key].lables){            
            data.pageData[key].lables.forEach((l)=>{
              if (labels.indexOf(l.desc)===-1) labels.push(l.desc)
            })
          }

          if (data.pageData[key].faces && data.pageData[key].faces.length>0){
            hasFaces = true
          }  

          if (data.pageData[key].properties && data.pageData[key].properties.colors){
            data.pageData[key].properties.colors.forEach((color)=>{
              if (color.score >= 25){
                if (colors.indexOf(color.hex)===-1) colors.push(color.hex)
              }
            })
            
          }  

      })

      textLength = text.join(' ').replace(/\n/g,' ').split(' ').length
      
      var titlePage = Object.keys(data.pageData)[0]

      titlePage = `https://s3.amazonaws.com/zinediscovery/${data.iaId}/thumbs/${titlePage}`

      // console.log(titlePage)

      data.iaSubject = data.iaSubject.split(';')
      data.iaSubject = data.iaSubject.map((s)=>{
        s = s.trim()
        if (s.length>0) return s        
      })



      var indexData = {
        iaTitle: data.iaTitle,
        iaDescription: data.iaDescription,
        iaSubject: data.iaSubject,
        iaCreator: data.iaCreator,
        iaURL: data.iaURL,
        pageCount: data.pageCount,
        labels: labels,
        colors: colors,
        id: data.iaId,
        hasFaces: hasFaces,
        titlePage: titlePage,
        lda:data.lda,
        wordCount: textLength
      }
      // console.log(indexData)
      indexDatas.push(indexData)

      console.log(counter++)      
      
    
    })  
    .done(()=>{
      fs.writeFileSync(`/Volumes/Byeeee/zines/index.json`,JSON.stringify(indexDatas))


    })


})
