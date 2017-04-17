const H = require('highland')
const glob = require('glob')
const fs = require('fs')
const lda = require('lda')

glob("/Volumes/Byeeee/zines/*/meta/data.json", {}, function (er, files) {

  var counter = 0

  H(files)
    .map((f)=>{
      var data = JSON.parse(fs.readFileSync(f, 'utf8'))
      data.lda = []
      var text = []


      Object.keys(data.pageData).forEach(key => {
        if (data.pageData[key].text && data.pageData[key].text[0] && data.pageData[key].text[0].desc)
          text.push(data.pageData[key].text[0].desc)
      })

      text = text.join(' ').replace(/\n/g,' ')
      var documents = text.match( /[^\.!\?]+[\.!\?]+/g )

      var result = lda(documents, 2, 5);

      // console.log(data.iaSubject)
      for (var i in result) {
        var row = result[i];
        // console.log('Topic ' + (parseInt(i) + 1));
        
        // For each term.
        for (var j in row) {
          var term = row[j];
          
          if (term.term.length>2){
            // console.log(term.term + ' (' + term.probability + '%)');  
            data.lda.push(term.term)
          } 
        }
        
      }
      console.log(counter++);
      
      fs.writeFileSync(f,JSON.stringify(data))
      
    
    })  
    .done(()=>{


    })


})
