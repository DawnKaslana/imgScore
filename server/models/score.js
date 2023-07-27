const mysql = require('../mysql');

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

const showScore = (req, res) => {
    console.log(req.query)
  let user_id = req.query.user_id
  mysql('score').select('*').where({user_id})
  .then((result)=>{
    let list = {}
    result.forEach(item => {
        list[item.file_name] = item.score
    });
    res.send(list)
  }).catch((err) => {
    console.error(err)
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

    res.send('ok')
}

module.exports = {
    showScore, saveScore
}

