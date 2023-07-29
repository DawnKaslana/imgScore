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


// exportAllScore
const getScoreByUser = (user_id,user_name) => {
    return new Promise((resolve, reject) => {
        mysql('score').select('file_name', 'score')
        .where({user_id})
        .then((scoreResult)=>{
            let result = {}
            result[user_name] = {}
            scoreResult.forEach(item=>{
                result[user_name][item.file_name] = item.score
            })
            resolve(result)
        }).catch((err) => {
            reject(err)
        })
    })
}

const getScores = (users) => {
    return new Promise((resolve, reject) => {
        let funcArr = []
        let result = {}

        for(let user of users){
            result[user.user_name] = {}
            funcArr.push(getScoreByUser(user.user_id,user.user_name))
        }

        Promise.all(funcArr)
        .then((v)=>{
            v.forEach(item=>{
                Object.assign(result,item)
            })
            resolve(result)
        })
        .catch((err) => reject(err));
    })
}

const getUsers = () => {
    return new Promise((resolve, reject) => {
        mysql('user').select('*')
        .then((result)=>{
            resolve(result)
        }).catch((err) => {
            reject(err)
        })
    })
}

const getFiles = () => {
    return new Promise((resolve, reject) => {
        mysql('file').select('*')
        .then((result)=>{
            let fileList = []
            result.forEach(item => {
                fileList.push(item.file_name)
            })
            resolve(fileList)
        }).catch((err) => {
            reject(err)
        })
    })
}

const exportAllScore = (req, res) => {
    let header = ['file_name']
    getUsers().then(users => {
        let userList = []
        users.forEach(user=>{
            header.push(user.user_name)
            userList.push(user.user_name)
        })
        console.log(header)
        getFiles().then(fileList => {
            getScores(users).then(result => {
                let output = header.toString()+'\n'
                fileList.forEach(file=>{
                    let score = ""
                    userList.forEach(item =>{
                        if (result[item][file]){
                            score+=","+result[item][file]
                        }else{
                            score+=","
                        }
                    })
                    output+=file+score+'\n'
                    
                })
                res.send(output)
            })
        })
    })
}

module.exports = {
    saveScore, exportScore, exportAllScore,
}

