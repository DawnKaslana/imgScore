const mysql = require('../mysql');
const {stringify} = require('csv-stringify');


const isExist = (user_id, file_name) => {
    console.log(user_id,file_name)
    return new Promise((resolve, reject) => {
      mysql('score').select('*').where({user_id, file_name})
      .then((result)=>{
        if (result.length){
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
  }

const addScore = (user_id, file_name, score) => {
    return new Promise((resolve, reject) => {
        mysql('score')
            .insert({user_id, file_name,score})
            .then((result)=>{
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
    })
}
const putScore = (user_id, file_name, score) => {
    return new Promise((resolve, reject) => {
        mysql('score')
            .where({user_id, file_name})
            .update({score})
            .then((result)=>{
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
    })
}

const saveScore = (req, res) => {
    console.log(req.body)
    let user_id = req.body.user_id
    let list = req.body.saveScoreList

    list.forEach((item)=>{
        console.log(item)
        isExist(user_id, item.file_name).then((exist)=>{
            if (exist) putScore(user_id, item.file_name, item.score)
            else addScore(user_id, item.file_name, item.score)
        })
    })

    res.send('score saved')
}

const exportScore = (req, res) => {
    console.log(req.query)
    let user_id = req.query.user_id;

    mysql('score').select('file_name','score').where({user_id})
        .then((result)=>{
            stringify(result, {
                header: true
            }, function (err, output) {
                res.send(output)
            })
        }).catch((err) => {
            console.error(err)
        })
}

const getScore = (user_id) => {
    return new Promise((resolve, reject) => {
        mysql('user').rightJoin('score',{'user.user_id':'score.user_id'})
            .select('file_name','user_name', 'score')
            .where({'user.user_id':user_id})
            .then((result)=>{
                console.log(result)
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
    })
}

const exportAllScore = (req, res) => {
    let fields = []
    let fileList = []

    mysql('user').select('*')
        .then((result)=>{
            result.forEach(item => {
                fields.push(item.user_name)
            })
            console.log(fields)
        }).catch((err) => {
            console.error(err)
    })

    //column1
    mysql('file').select('*')
        .then((result)=>{
            result.forEach(item => {
                fileList.push(item.file_name)
            })
            fields[0].file_name = fileList
            console.log(fields)
            //console.log(fileList)
        }).catch((err) => {
            console.error(err)
    })

    

    //column2...
    for (let i=1; i<fields.length; i++){
        console.log(i)
        fields[i][fields[i]] = getScore(i)
    }
}

module.exports = {
    saveScore, exportScore, exportAllScore,
}

