import csv
import json

import pymysql

# 資料庫參數設定
db_settings = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "root",
    "db": "dawn",
    "charset": "utf8"
}

def readCSV():
    csvfile = open("temp_data_age.csv", "w")
    with open("./by-sex.csv") as f:
        #1.创建阅读器对象
        reader = csv.reader(f)
        #2.读取文件第一行数据
        head_row=next(reader)
        print(head_row)


    csvfile.close()

def writeCSV():
    csvfile = open("temp_data_age.csv", "w")
    writer = csv.writer(csvfile)

    with open("./by-age.csv") as f:
        #1.创建阅读器对象
        reader = csv.reader(f)
        #2.读取文件第一行数据
        head_row=next(reader)
        print(head_row)
        writer.writerow(head_row)
        while(1):
            row = next(reader)
            if row[1].find('_') < 1:
                writer.writerow(row)

    csvfile.close()

def remove_column_region():
    # for aggregate
    csvfile = open("temp_data.csv", "w")

    with open("/Users/dawnkaslana/Desktop/aggregated.csv") as f:
        #1.创建阅读器对象
        reader = csv.reader(f)
        #2.读取文件第一行数据
        head_row=next(reader)
        print(head_row)
        #4.過濾不要的行
        filter_list = ['area','population','closing','physicians','health','nurses','diabetes','smoking','gdp','population','age', 'trends', 'male', 'female','sinovac','moderna','janssen','pfizer']
        newHead = []
        newColumnIdx = []
        for index,column_header in enumerate(head_row):
            isfiltered = 0
            for item in filter_list:
                if item in column_header:
                    isfiltered = 1
                    break
            if not isfiltered:
                print(index,column_header)
                newHead.append(column_header)
                newColumnIdx.append(index)
        print(newHead)

        writer = csv.writer(csvfile)
        writer.writerow(newHead)

        while(1):
            row = next(reader)
            newRow = []
            for idx in newColumnIdx:
                newRow.append(row[idx])
            writer.writerow(newRow)

    csvfile.close()

def get_len(filename):
    with open(filename, 'r') as f:
        print(len(f.readlines()))

def insert_to_mysql():
    table = 'dawn.sex'
    csv_file_name = './temp_data_sex.csv'
    column_num = 30
    # 建立Connection物件
    conn = pymysql.connect(**db_settings)
    cursor = conn.cursor()

    cursor.execute("SET @@sql_mode=''")

    val_str = '%s,' * column_num
    val_str = val_str[:-1]

    sql = "INSERT INTO "+table+" VALUES(" + val_str + ")"

    with open(csv_file_name) as f:
        reader = csv.reader(f)
        count = 0
        rowArr = []
        for row in reader:
            count+=1
            rowArr.append(row)

        # 執行指令: 插入全部列
        cursor.executemany(sql, rowArr)
        conn.commit()
        print(count)
    cursor.close()

insert_to_mysql()

import datetime

def updateDate(dateStr):
    dt = datetime.datetime.strptime(dateStr, "%Y-%m-%d")
    out_date = (dt + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    return out_date

#拿到某日期的全部資料->不要地區->寫入文件
def write_to_json():
    # 建立Connection物件
    conn = pymysql.connect(**db_settings)
    cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)

    dateStr = '2019-12-31' #max: 2022-09-17

    while (dateStr != '2022-09-17'):
        dateStr = updateDate(dateStr)
        with open('./Date/'+dateStr+'.json', "w") as f:
            sql = "SELECT * FROM dawn.aggregated where (date = '"+dateStr+"') and (location_key not like '%!_%' ESCAPE '!')"
            # 執行指令
            count = cursor.execute(sql)
            print("資料筆數：%d"%count)

            result = cursor.fetchall()
            # json.dumps()是将原始数据转为json（其中单引号会变为双引号），而json.loads()是将json转为原始数据。
            result_json = json.dumps(result, ensure_ascii=False)
            # 寫入json文件
            f.write(result_json)
            f.close()
            print("日期："+dateStr+"處理完畢")

    cursor.close()

# insert_to_mysql(onlyCountry=True)
import fiona
import random

def get_geoData():
    writeFile = open('./geo.json', 'w')
    geoFile = '/Users/dawnkaslana/Desktop/World_Countries_(Generalized).geojson'
    json_content = {"type":"FeatureCollection","features":[]}
    countryList = []
    diffList = ['GP', 'PM', 'MF', 'BL']

    with open(geoFile, 'r') as file:
        c = 0
        content = json.load(file)
        features = content['features']
        for feature in features:
            c += 1
            prop = feature['properties']
            newProp = {'location_key':prop['ISO'],'name':prop['COUNTRY']}
            if prop['ISO'] not in diffList:
                feature['properties']=newProp
                countryList.append(feature)
        print(c)

    json_content['features'] = countryList
    result_json = json.dumps(json_content, ensure_ascii=False)
    # print(result_json)
    # 寫入json文件
    writeFile.write(result_json)
    writeFile.close()

import geopandas
from geopandas import GeoSeries, GeoDataFrame
from shapely.geometry import MultiPolygon, Polygon
from shapely.geometry import shape
from shapely import wkt
import pandas as pd

from pymysql.converters import escape_string
import geojson

def readGeoJson(geoFile):
    with open(geoFile, 'r') as file:
        c = 0
        content = json.load(file)
        features = content['features']
        for feature in features:
            c += 1
            print(feature)
        print(c)

def readGpkg(geoFile):
    with fiona.open(geoFile) as layer:
        c = 0
        for feature in layer:
            c+=1
            print(feature)

        print(c)

def compareCountry():
    geoFile = '/Users/dawnkaslana/Desktop/World_Countries_(Generalized).geojson'
    compareCountryJson = '/Users/dawnkaslana/Workspace/VIS/Date/2021-06-18.json'
    compareCountryList = []
    countryList = []
    with open(compareCountryJson, 'r') as file:
        c = 0
        content = json.load(file)
        for item in content:
            c+=1
            compareCountryList.append(item['location_key'])
    print(c)
    with open(geoFile, 'r') as file:
        c = 0
        content = json.load(file)
        features = content['features']
        for feature in features:
            c += 1
            prop = feature['properties']
            countryList.append(prop['ISO'])
    print(c)
    print(list(set(countryList).difference(set(compareCountryList)))) # b中有而a中没有的

# get_geoData()

# readGeoJson('/Users/dawnkaslana/Desktop/World_Countries_(Generalized).geojson')








