const mysql = require('../mysql');

let sexField = ['cumulative_confirmed_female', 'cumulative_confirmed_male','cumulative_deceased_female','cumulative_deceased_male','cumulative_recovered_female','cumulative_recovered_male','cumulative_tested_female','cumulative_tested_male']
let ageField = []
for (let i=0;i<=9;i++){
  ageField.push('cumulative_confirmed_age_'+i)
  ageField.push('cumulative_deceased_age_'+i)
  ageField.push('cumulative_recovered_age_'+i)
  ageField.push('cumulative_tested_age_'+i)
}

const selectInfo = (req, res) => {
  let index = parseInt(req.query.index)
  let result = {}
  mysql('dawn.age')
  .select('*')
  .where('location_key',req.query.location_key)
  .orderBy('date', 'asc')
  .then((data)=>{
    //因為數據不整齊，需要遍歷一次找每個欄位最大直
    if (data.length){
      let arr={}
      ageField.forEach((key,index)=>{
        arr[key]=0
        data.forEach((item)=>{
          item[key] =  parseInt(item[key])
          if (item[key]>arr[key])arr[key] = item[key]
        })
      })
      result.age = arr
    } else {
      result.age = 0
    }
  }).then(()=>{
    mysql('dawn.sex')
    .select(sexField)
    .where('location_key',req.query.location_key)
    .orderBy('date', 'asc')
    .then((data)=>{
      if (data.length){
        let arr={}
        sexField.forEach((key,index)=>{
          arr[key]=0
          data.forEach((item)=>{
            item[key] =  parseInt(item[key])
            if (item[key]>arr[key])arr[key] = item[key]
          })
        })
        result.sex = arr
      } else {
        result.sex = 0
      }
    }).then(()=>{
      mysql(index === 1? 'dawn.epid':'dawn.vacc')
      .select('*')
      .where('location_key',req.query.location_key)
      .where('date','like','%-01')
      .orderBy('date', 'asc')
      .then((data)=>{
        result.line = data.length?data:0
        res.send(result)
      })
    })
  }) .catch((err) => {
    console.error(err)  
  })

}

const selectByDate = (req, res) => {
  mysql('dawn.'+req.query.type)
  .select('*')
  .where('date', req.query.date)
  .then((result)=>{
    arr = {}
    result.forEach(item => {
      arr[item['location_key']] = item
    });
    res.send(arr)
  }).catch((err) => {
    console.error(err)  
  })
}

const selectByMonth = (req, res) => {
  let selectDate = req.query.date.substring(0,7)
  let type = req.query.type
  mysql('dawn.'+type)
  .select('*')
  .where('date', 'like', selectDate+'%')
  .then((result)=>{
    //同國家的加起來 累積用最後一天數據
    resultData = {}
    countryDict = {}
    result.forEach(item => {
      if (!countryDict[item['location_key']]){
        countryDict[item['location_key']] = []
      }
      countryDict[item['location_key']].push(item)
    });
    let keys = Object.keys(countryDict)
    let arr = []
    if (type === 'epid'){
      keys.forEach(country => {
        let new_confirmed = 0
        let new_deceased = 0
        let new_recovered = 0
        let new_tested = 0
        arr = countryDict[country]
        arr.forEach(item =>{
          new_confirmed += parseInt(item.new_confirmed)
          new_deceased += parseInt(item.new_deceased)
          new_recovered += parseInt(item.new_recovered)
          new_tested += parseInt(item.new_tested)
        })
        let lastArr = arr.pop()
        lastArr.new_confirmed = new_confirmed
        lastArr.new_deceased = new_deceased
        lastArr.new_recovered = new_recovered
        lastArr.new_tested = new_tested
        resultData[country] = lastArr
      })
    } else if (type === 'vacc'){
      keys.forEach(country => {
        let new_persons_fully_vaccinated = 0
        let new_persons_vaccinated = 0
        let cumulative_persons_vaccinated = 0
        let cumulative_persons_fully_vaccinated = 0
        arr = countryDict[country]
        arr.forEach(item =>{
          new_persons_fully_vaccinated += parseInt(item.new_persons_fully_vaccinated)
          new_persons_vaccinated += parseInt(item.new_persons_vaccinated)
          if (parseInt(item.cumulative_persons_vaccinated) > cumulative_persons_vaccinated) {
            cumulative_persons_vaccinated = parseInt(item.cumulative_persons_vaccinated)}
          if (parseInt(item.cumulative_persons_fully_vaccinated) > cumulative_persons_fully_vaccinated) {
            cumulative_persons_fully_vaccinated = parseInt(item.cumulative_persons_fully_vaccinated)}
        })
        let lastArr = arr.pop()
        lastArr.new_persons_fully_vaccinated = new_persons_fully_vaccinated
        lastArr.new_persons_vaccinated = new_persons_vaccinated
        lastArr.cumulative_persons_fully_vaccinated = cumulative_persons_fully_vaccinated
        lastArr.cumulative_persons_vaccinated = cumulative_persons_vaccinated
        resultData[country] = lastArr
      })
    }
    res.send(resultData)
  }).catch((err) => {
    console.error(err)  
  })
}

const selectByYear = (req, res) => {
  let selectDate = req.query.date.substring(0,4)
  let type = req.query.type 
  mysql('dawn.'+type)
  .select('*')
  .where('date', 'like', selectDate+'%')
  .andWhere('date', 'not like', '2022-09%')
  .then((result)=>{
    //同國家的加起來 累積用最後一天!!!have value de數據
    resultData = {}
    countryDict = {}
    result.forEach(item => {
      if (!countryDict[item['location_key']]){
        countryDict[item['location_key']] = []
      }
      countryDict[item['location_key']].push(item)
    });
    let keys = Object.keys(countryDict)
    let arr = []
    if (type === 'epid'){
      keys.forEach(country => {
        let new_confirmed = 0
        let new_deceased = 0
        let new_recovered = 0
        let new_tested = 0
        arr = countryDict[country]
        arr.forEach(item =>{
          new_confirmed += parseInt(item.new_confirmed)
          new_deceased += parseInt(item.new_deceased)
          new_recovered += parseInt(item.new_recovered)
          new_tested += parseInt(item.new_tested)
        })
        let lastArr = arr.pop()
        lastArr.new_confirmed = new_confirmed
        lastArr.new_deceased = new_deceased
        lastArr.new_recovered = new_recovered
        lastArr.new_tested = new_tested
        resultData[country] = lastArr
      })
    } else if (type === 'vacc'){
      keys.forEach(country => {
        let new_persons_fully_vaccinated = 0
        let new_persons_vaccinated = 0
        let cumulative_persons_vaccinated = 0
        let cumulative_persons_fully_vaccinated = 0
        arr = countryDict[country]
        arr.forEach(item =>{
          new_persons_fully_vaccinated += parseInt(item.new_persons_fully_vaccinated)
          new_persons_vaccinated += parseInt(item.new_persons_vaccinated)
          if (parseInt(item.cumulative_persons_vaccinated) > cumulative_persons_vaccinated) {
            cumulative_persons_vaccinated = parseInt(item.cumulative_persons_vaccinated)}
          if (parseInt(item.cumulative_persons_fully_vaccinated) > cumulative_persons_fully_vaccinated) {
            cumulative_persons_fully_vaccinated = parseInt(item.cumulative_persons_fully_vaccinated)}
        })
        let lastArr = arr.pop()
        lastArr.new_persons_fully_vaccinated = new_persons_fully_vaccinated
        lastArr.new_persons_vaccinated = new_persons_vaccinated
        lastArr.cumulative_persons_fully_vaccinated = cumulative_persons_fully_vaccinated
        lastArr.cumulative_persons_vaccinated = cumulative_persons_vaccinated
        resultData[country] = lastArr
      })
    }
    res.send(resultData)

  }).catch((err) => {
    console.error(err)  
  })
}

module.exports = {
  selectByDate,
  selectByMonth,
  selectByYear,
  selectInfo
}