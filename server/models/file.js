const mysql = require('../mysql');
const fs = require('fs');

const imgFolder = './images';

const getFileList = (req, res) => {
  let page = req.query.page
  let user_id = req.query.user_id
  mysql('file')
  .leftJoin('score', function() {
    this
      .on('file.file_name', '=', 'score.file_name')
      .onIn('score.user_id', [user_id,null])
  })
  .select('file.file_id','file.file_name','score.score')
  .whereBetween('file_id', [page*10-9, page*10])
  .then((result)=>{
    res.send(result)
  }).catch((err) => {
    console.error(err)
  })
}

const getFileNumber = (req, res) => {
  mysql('file').count({count:'file_name'})
  .then((result)=>{
    res.send(result[0])
  }).catch((err) => {
    console.error(err)
  })
}

const readDir = (filePath,files) => {
  fs.readdirSync(filePath).forEach(item => {
    let subfilePath = filePath+'/'+item
    let stat = fs.statSync(subfilePath)
    if(stat.isFile()) files.push({file_name:subfilePath.slice(9)})
    else readDir(subfilePath,files)
  })
}

const updateFileList = (req, res) => {
  let files = []
  readDir(imgFolder,files)

  mysql('file').truncate().then(()=>{
    mysql('file').insert(files)
    .then((result)=>{
      res.send('updated')
    }).catch((err) => {
      console.error(err)
    })
  })
}

const getFile = (req, res) => {
  let filename = req.query.filename

  fs.readFile(imgFolder+'/'+filename, function(err, originBuffer) {
    res.send(originBuffer)
    // 接下来该如何实现把读取的数据流保存为图片,  图片读取时编码格式固定为 utf8
  });

}


module.exports = {
  getFileList, getFile, updateFileList, getFileNumber
}