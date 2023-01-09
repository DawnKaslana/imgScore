# REACT-NODEJS-MYSQL-DOCKER 

Tutorial
---------

[Docker compose : NodeJS and MySQL app with React in a docker](http://www.bogotobogo.com/DevOps/Docker/Docker-React-Node-MySQL-App.php) 


step 1
---
在專案的根目錄下執行
```
docker-compose up -d --build
```
or 看系統安裝的工具
```
docker compose up -d --build
```
會自動建立前後端與資料庫
前端port:3000
後端port:3001
資料庫port:3306

step 2
---
前端的一些套件需要手動安裝 看警告缺什麽裝什麽
進入docker容器中
```
docker exec -it container_name /bin/sh
```
容器名稱使用以下指令查看，可輸入代號的前三或前四位 Ex: 容器代號為rfd9aewe2，則container_name 填入 rfd
```
docker ps -a
```
進入容器後輸入
```
npm i package_name
```
一般來說需要安裝以下這幾個
```
/app # npm i @antv/l7 js-file-download dayjs @mui/x-date-pickers
```

step 3
---
需要手動在資料庫匯入csv資料表 下載地址：
四張資料表分別命名為epid vacc sex age
也可以使用process.py中的程序插入資料，速度較快，但需要先手動匯入標題列
登入帳戶和密碼為root