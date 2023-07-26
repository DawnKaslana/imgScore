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
  let user_id = req.query.user_id
  mysql('score').select({user_id})
  .then((result)=>{
    res.send(result)
  }).catch((err) => {
    console.error(err)
  })
}

const saveScore = (req, res) => {
    console.log(req.body)
    let user_id = req.body.user_id
    let list = req.body.scoreList

    for (let item in list) {
        isExist(user_id, item).then(exist => {
            if (!exist){
                mysql('score').insert({user_id, file_name:item, score:list[item]})
                .then((result)=>{
                    console.log(result)
                    res.send('ok')
                }).catch((err) => {
                    console.error(err)
                })
            } else {
                mysql('score')
                .where({user_id, file_name:item})
                .update({score:list[item]})
                .then((result)=>{
                    console.log(result)
                    res.send('ok')
                }).catch((err) => {
                    console.error(err)
                })
            }
        }) 
    }


}

module.exports = {
    showScore, saveScore
}

