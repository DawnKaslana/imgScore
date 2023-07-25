const mysql = require('../mysql');
const fs = require('fs');

const imgFolder = '';

const getFileList = (req, res) => {
  console.log('asdad')
  fs.readdirSync(imgFolder).forEach(file => {
    console.log(file);
  });
}


module.exports = {
  getFileList
}