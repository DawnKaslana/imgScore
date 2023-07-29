const mysql = require('../mysql');
const fs = require('fs');

const imgFolder = './images/';

const getFileList = (req, res) => {
  console.log(req.query)
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

const updateFileList = (req, res) => {
  let files = []
  fs.readdirSync(imgFolder).forEach(file => {
    files.push({file_name:file})
  });

  mysql('file').truncate().then(()=>{
    mysql('file').insert(files)
    .then((result)=>{
      console.log(result)
      res.send('updated')
    }).catch((err) => {
      console.error(err)
    })
  })
}

const getFile = (req, res) => {
  let filename = req.query.filename
  fs.readFile(imgFolder+filename, function(err, originBuffer) {
    res.send(originBuffer)
    // 接下来该如何实现把读取的数据流保存为图片,  图片读取时编码格式固定为 utf8
  });

}


module.exports = {
  getFileList, getFile, updateFileList, getFileNumber
}