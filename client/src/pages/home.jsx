// React and Basic import
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { darkTheme } from '../css/theme';
import { styled } from '@mui/material/styles';

// React MUI import
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Slider from '@mui/material/Slider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';

//Icon import
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import InsightsIcon from '@mui/icons-material/Insights';
import PlaceIcon from '@mui/icons-material/Place';
import placeSVG from '../images/icons/place_black_24dp.svg'
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemIcon from '@mui/material/ListItemIcon';

// Map import
import { LineLayer, Popup, PolygonLayer } from '@antv/l7';
import {  Zoom, Scale, ExportImage, Fullscreen, Control } from '@antv/l7';
import { LarkMap, useScene, CustomControl } from '@antv/larkmap';
// Chart import
import { Pie, G2, Column, Line } from '@ant-design/plots';

// other func import
import fileDownload from 'js-file-download';

// DatePicker import
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

// file and img import
import geoData from '../json/geo.json';

// Config
const api_url = 'http://47.108.179.63:3001';
//const api_url = 'http://127.0.0.1:3001';
axios.defaults.withCredentials = false

const drawerWidth = '30%';

//Compoments
const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
}));

const StyledList = styled(List)({
    // selected and (selected + hover) states
    '&& .Mui-selected, && .Mui-selected:hover': {
      backgroundColor: 'rgb(143,168,246,0.2)',
      borderLeft: '3px solid rgb(36,87,246)',
      '&, & .MuiListItemIcon-root': {
        color: 'rgb(74,118,247)',
      },
    }
  });
  
const NavBar = () => {
    return(
    <AppBar position="sticky" color="primary" theme={darkTheme}>
        <Box sx={{mr:3,ml:3}}>
            <Toolbar disableGutters sx={{display:'flex'}}>
                <Typography
                    variant="h5" noWrap component="a" href="/"
                    sx={{ mr: 2, fontFamily: 'SimHei', fontWeight: 400, letterSpacing: '.3rem', color: 'inherit', textDecoration: 'none', }}
                >
                    新冠疫情感染分布及病毒传播路径研究
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Typography
                    variant="h5" noWrap
                    sx={{ mr: 2, fontFamily: 'SimHei', fontWeight: 400, letterSpacing: '.3rem', color: 'inherit', textDecoration: 'none', }}
                >
                    by还没有名字小队
                </Typography>
            </Toolbar>
        </Box>
    </AppBar>
    )
}

const nameMapDict = {'cumulative_confirmed':'累积确诊人数', 'cumulative_deceased':'累积死亡人数','cumulative_recovered':'累积復原人数','cumulative_tested':'累积测试人数',
                                            'new_confirmed':'新增确诊人数','new_deceased':'新增死亡人数', 'new_recovered':'新增復原人数','new_tested':'新增测试人数',
                                            'cumulative_persons_fully_vaccinated':'累积接种疫苗人数(全)', 'cumulative_persons_vaccinated':'累积接种疫苗人数',
                                            'new_persons_fully_vaccinated':'新增接种疫苗人数(全)', 'new_persons_vaccinated':'新增接种疫苗人数'}

//Map Compoments
const colorA = [ 'rgb(214,165,152,0)','#FFF3DE','#FFE5B5','#FFDA96','#FFCC6E','#FFABAB','#FF8C8C','#FF5F5F','#B20000'];
const colorB = [ 'rgb(255,255,217,0)','rgb(255,255,217)', 'rgb(237,248,177)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(12,44,132)' ];

const config = {
    mapType: 'Gaode',
    mapOptions: {
      style: 'normal',
      center: [60, 37],
      zoom: 3,
      WebGLParams: {
        preserveDrawingBuffer: true,
      },
    },
    logoVisible: false,
};

const MyPolygonLayer = ({source, selectedIndex, showKeyList, showKey, labels, needRender, handleDrawerOpen}) => {
    const scene = useScene();
    const colors = selectedIndex === 1? colorA:colorB;
    
    useEffect(()=>{
        console.log('render layer')
        scene.removeAllLayer();
        if (!source) return ;

        const layer = new PolygonLayer({})
            .source(source)
            .scale(showKey ,{
                type: 'threshold', //Quantile
                domain: labels,
            })
            .color(
                showKey, colors
            )
            .shape('fill')
            .active({ color:  selectedIndex === 1?'#FFBFFF': 'lightblue'})

        const layer2 = new LineLayer({
            zIndex: 2
        })
            .source(source)
            .color('#fff')
            .size(1)
            .style({
            lineType: 'dash',
            dashArray: [ 2, 2 ],
            });
        layer.on('mousemove', e => {
            let text = `<div style="display:flex;align-item:center;"><img src="${placeSVG}" width='20px' style="margin-right:5px;margin-top:-5px"><b>${e.feature.properties.name}</b></div>`
            showKeyList.map((item, i, arr)=>{
                text+=`<span>${nameMapDict[item]}: ${e.feature.properties[item]?e.feature.properties[item]:0}<br></span>`
            })
            const popup = new Popup({
                offsets: [ 0, 0 ],
                closeButton: false
            })
            .setLnglat(e.lngLat)
            .setHTML(text);
            scene.addPopup(popup);
        });

        layer.on('click', e => {
            handleDrawerOpen(e.feature.properties)
        });

        scene.addLayer(layer)
        scene.addLayer(layer2);
    },[showKey, needRender])
  };

const Legend = ({selectedIndex, labels}) => {
    const colors = selectedIndex === 1? colorA:colorB;

    return (
        <Box sx={{backgroundColor:'rgb(255,255,255,.6)', padding:'12px'}}>
            {labels.map((item, index, arr)=>{
                if (index<labels.length){
                    return (
                        <Tooltip key={index}  title={index? labels[index-1]+'~'+item : 0} placement="right">
                            <Box sx={{backgroundColor:!index?'white':colors[index], width:'22px', height:'18px'}}/>
                        </Tooltip>
                    )
                }
            })}
        </Box>
    );
};

const zoom = new Zoom();
const scale = new Scale();
const fullscreen = new Fullscreen();
const exportImage = new ExportImage({
    onExport: (mapImg) => {
    // console.log(scene.exportMap('png'))
    fetch(mapImg)
    .then(res => res.blob())
    .then(blob => {
        const file = new File([blob], "File name",{ type: "image/png" })
        fileDownload(file,'map.png')
    })
    }
});

//Chart compoments
const AgeChart = ({info}) => {
    //console.log(info)
    const range = ["0-9","10-19","20-29", "30-39", "40-49",
                                "50-59", "60-69","70-79","80-89","90-"]
    let data = []
    for (let i=0;i<=9;i++){
        data.push( {
            age: range[i],
            value: info['cumulative_confirmed_age_'+i],
            type: '确诊人数',
        })
        data.push( {
            age: range[i],
            value: info['cumulative_deceased_age_'+i],
            type: '死亡人数',
        })
        data.push( {
            age: range[i],
            value: info['cumulative_recovered_age_'+i],
            type: '復原人数',
        })
        data.push( {
            age: range[i],
            value: info['cumulative_tested_age_'+i],
            type: '测试人数',
        })
    }
      const config = {
        data,
        isStack: true,
        xField: 'age',
        yField: 'value',
        seriesField: 'type',
        color: ['#6096f5','#545454','#3cd8a9','#fabc33'],
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'bottom', 'middle'
            // 可配置附加的布局方法
            layout: [
              // 柱形图数据标签位置自动调整
              {
                type: 'interval-adjust-position',
              }, // 数据标签防遮挡
              {
                type: 'interval-hide-overlap',
              }, // 数据标签文颜色自动调整
              {
                type: 'adjust-color',
              },
            ],
        },
        xAxis: {
          label: {
            autoHide: true,
            autoRotate: false,
          },
        },
        meta: {
          age: {
            alias: '年齡段',
          },
          value: {
            alias: '人數',
          },
        },
      };
      return <Column {...config} />;
};

const SexChart = ({info}) => {
    //console.log(info)
    const G = G2.getEngine('canvas');
    const data = [{type: '确诊人数(女)',value: info.cumulative_confirmed_female},
                                {type: '确诊人数(男)',value: info.cumulative_confirmed_male},
                                {type: '死亡人数(女)',value: info.cumulative_deceased_female},
                                {type: '死亡人数(男)',value: info.cumulative_deceased_male},
                                {type: '復原人数(女)',value: info.cumulative_recovered_female},
                                {type: '復原人数(男)',value: info.cumulative_recovered_male},
                                {type: '测试人数(女)',value: info.cumulative_tested_female},
                                {type: '测试人数(男)',value: info.cumulative_tested_male},];
    const config = {
        appendPadding: 20,
        data,
        angleField: 'value',
        colorField: 'type',
        color: ['#CA82FF','#00BDBD','darkred','darkblue','pink','lightblue','#AC3BFF','#009E00'],
        radius: 0.9,
        label: {
            type: 'inner',
            offset: '-30%',
            content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
            style: {
            fontSize: 18,
            textAlign: 'center',
            },
        },
        legend: {
            selected: {
                '确诊人数(女)': true,
                '确诊人数(男)': true,
                '死亡人数(女)': false,
                '死亡人数(男)':false,
                '復原人数(女)':false,
                '復原人数(男)':false,
                '测试人数(女)':false,
                '测试人数(男)':false
            },
          },
        interactions: [{type: 'element-active',},  {type: 'element-selected'},],
        };
        return <Pie {...config} />;
}

const LineChart = ({info, selectedIndex}) => {
    //console.log(info)
    let data = []
    if (selectedIndex === 1){
        info.forEach((item)=>{
            data.push(
                {"month": item.date.substring(0,7),"value": parseInt(item.cumulative_confirmed),"category": "累积确诊人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.cumulative_deceased),"category": "累积死亡人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.cumulative_recovered),"category": "累积復原人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.cumulative_tested),"category": "累积测试人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.new_confirmed),"category": "新增确诊人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.new_deceased),"category": "新增死亡人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.new_recovered),"category": "新增復原人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.new_tested),"category": "新增测试人数"},
            )
        })
    } else {
        info.forEach((item)=>{
            data.push(
                {"month": item.date.substring(0,7),"value": parseInt(item.cumulative_persons_fully_vaccinated),"category": "累积完全接种疫苗人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.cumulative_persons_vaccinated),"category": "累积接种疫苗人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.new_persons_fully_vaccinated),"category": "新增完全接种疫苗人数"},
                {"month": item.date.substring(0,7),"value": parseInt(item.new_persons_vaccinated),"category": "新增接种疫苗人数"},
            )
        })
    }
    const config = {
      data,
      xField: 'month',
      yField: 'value',
      seriesField: 'category',
      legend:{
        flipPage: false,
        selected: selectedIndex === 1?{
            '累积确诊人数': true,
            '累积死亡人数': true,
            '累积復原人数': true,
            '累积测试人数':true,
            '新增确诊人数':false,
            '新增死亡人数':false,
            '新增復原人数':false,
            '新增测试人数':false
        }:{'累积完全接种疫苗人数':true,'累积接种疫苗人数':true,'新增完全接种疫苗人数':false,'新增接种疫苗人数':false},
      },
      yAxis: {
        label: {
          // 数值格式化为千分位
          formatter: (v) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
        },
      },
    };
  
    return <Line {...config} />;
  };

//Main
export function Home() {
    const [date, setDate] = useState(dayjs('2022-01-01'));
    const [source, setSource] = useState(geoData);
    const [needRender, setNeedRender] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [timeRange, setTimeRange] = useState(1);
    const [timeView, setTimeView] = useState(['year', 'day']);
    const [dateFormat, setDateFormat] = useState("YYYY/MM/DD");
    const [showKey, setShowKey] = useState('cumulative_confirmed');
    const [showKeyList, setShowKeyList] = useState([
    'cumulative_confirmed',
    'cumulative_deceased','cumulative_recovered',
    'cumulative_tested','new_confirmed',
    'new_deceased','new_recovered','new_tested']);
    const [labels, setLabels] = useState([]);

    const [open, setOpen] = useState(false);
    const [localProp, setLocalProp] = useState({});
    const [info, setInfo] = useState([]);

    const handleDrawerOpen = (prop) => {
        setInfo(null)
        //console.log(prop)
        setLocalProp(prop)
        console.log(api_url+'/selectInfo?location_key='+prop.location_key+'&index='+selectedIndex)
        //歷年該國家的 累積感染人數年齡數據 也就是說累積到最後一日數據
        axios.get(api_url+'/selectInfo?location_key='+prop.location_key+'&index='+selectedIndex)
        .then(res => {
            //console.log(res.data)
            setInfo(res.data)
        })
        if (!open){
            setOpen(true)
        }
    }
    const handleDrawerClose = () => {
        setOpen(false);
    };

    const getRange = (valArr) => {
        valArr = valArr.sort((a,b)=>{return a-b})
        let labels = [1]
        let max = Math.max(...valArr);
        labels = [1,Math.round(max*0.0025),Math.round(max*0.005),Math.round(max*0.01),Math.round(max*0.1),Math.round(max*0.3), Math.round(max*0.5), Math.round(max*0.7), max]
        //console.log(labels)
        return labels
    }
    
    const handleRadioChange = (event) => {
        let val = event.target.value;
        let valArr = []
        source.features.forEach((item, index, array)=>{
            if(item.properties[val]){valArr.push(parseInt(item.properties[val]))}
        })
        setShowKey(val);
        setLabels(getRange(valArr));
    };  

    const handleSliderChange = (event, newValue) => {
            if (timeRange === 1){
                setDate(dayjs(newValue))
            } else if (timeRange === 2){
                let y = parseInt(newValue/12)
                let m = newValue % 12
                setDate(dayjs('202'+y+'/'+m))
            } else if (timeRange === 3){
                setDate(newValue+'-01-01')
            }
    }
    

    const handleChange = (newValue) => {
        if (newValue){
            setDate(newValue);
        }
    };

    const handleListItemClick = (event, index) => {
        setSource(null);
        setSelectedIndex(index);
        setOpen(false)
        
        if (index === 1){
            setShowKey('cumulative_confirmed')
            setShowKeyList([
                'cumulative_confirmed',
                'cumulative_deceased','cumulative_recovered',
                'cumulative_tested','new_confirmed',
                'new_deceased','new_recovered','new_tested'])
        } else {
            setShowKey('cumulative_persons_fully_vaccinated')
            setShowKeyList(['cumulative_persons_fully_vaccinated',
            'cumulative_persons_vaccinated','new_persons_fully_vaccinated',
            'new_persons_vaccinated'])
        }
    };

    const changeTimeRange = (e, value) => {
        if (value === 1){
            setTimeView(["year", "day"])
            setDateFormat("YYYY/MM/DD")
        } else if (value === 2){
            setTimeView(["year", "month"])
            setDateFormat("YYYY/MM")
        } else if (value === 3){
            setTimeView(["year"])
            setDateFormat("YYYY")
        }
        setTimeRange(value)
    }

    function dateSlider (){
        let marks = [];
        if (timeRange === 1){
            marks = [{value: new Date("2020-01-01").getTime(),label: '2020/01/01'},
            {value: new Date("2021-01-01").getTime(),label: '2021/01/01'},
            {value: new Date("2022-01-01").getTime(),label: '2022/01/01'},
            {value: new Date("2022-08-31").getTime(),label: '2022/08/31'},]
            return (<Slider
            //size='small'
            value={new Date(date).getTime()}
            aria-label="Day Slider"
            valueLabelFormat={value => <div>{dayjs(value).format('YYYY/MM/DD')}</div>}
            valueLabelDisplay="auto"
            step={86400000}
            marks={marks}
            min={new Date("2020-01-01").getTime()}
            max={new Date("2022-08-01").getTime()}
            //onChange={handleSliderChange}
            onChangeCommitted={handleSliderChange}
        /> )
        } else if (timeRange === 2){
            marks = [{value: 1,label: '2020/01'},
            {value: 6,label: '2020/06'},
            {value: 13,label: '2021/01'},
            {value: 18,label: '2021/06'},
            {value: 25,label: '2022/01'},
            {value: 30,label: '2022/06'},]
            const getDate = () => {
            let y = parseInt(dayjs(date).format('YYYY'))
            let m = parseInt(dayjs(date).format('MM'))
            return (y-2020)*12 + m
            }
            const showDate = (value) => {
            let y = 2020+parseInt(value/12)
            let m = value % 12
            return(dayjs(y+'/'+m).format('YYYY/MM'))
            }
            return (<Slider
            value={getDate()}
            aria-label="Month Slider"
            valueLabelFormat={value => <div>{showDate(value)}</div>}
            valueLabelDisplay="auto"
            step={1}
            marks={marks}
            min={1}
            max={32}
            onChangeCommitted={handleSliderChange}
        />)
        } else if (timeRange === 3){
            marks = [{value: 2020,label: '2020'},
            {value: 2021,label: '2021'},
            {value: 2022,label: '2022'}]
            return (<Slider
            value={parseInt(dayjs(date).format('YYYY'))}
            aria-label="Year Slider"
            valueLabelFormat={value => <div>{value}</div>}
            valueLabelDisplay="auto"
            step={1}
            marks={marks}
            min={2020}
            max={2022}
            onChangeCommitted={handleSliderChange}
            />)
        }
    }

    useEffect(() => {
        console.log('date changed')
        let type = selectedIndex === 1?'epid':'vacc';
        let query = ['/selectByDate?date=','/selectByMonth?date=','/selectByYear?date=']
        console.log(api_url+query[timeRange-1]+dayjs(date).format('YYYY-MM-DD')+'&type='+type)
        axios.get(api_url+query[timeRange-1]+dayjs(date).format('YYYY-MM-DD')+'&type='+type)
            .then(res => {
                let valArr=[]
                //console.log(res.data)
                if (res.data){
                    geoData.features.forEach((item, index, array)=>{
                        let location = item.properties.location_key
                        if (res.data[location]){
                            let keys = Object.keys(res.data[location])
                            keys.forEach((key, index, array)=>{
                                item.properties[key] = res.data[location][key]
                                if (key === showKey && item.properties[showKey]) {
                                    valArr.push(item.properties[showKey])
                                }
                            })
                        } else {
                            item.properties = {"location_key": item.properties.location_key, "name": item.properties.name}
                        }
                    })
                } else {
                    console.log('咩資料')
                }
                setLabels(getRange(valArr));
                return geoData
            }).then((data) => {
                //console.log(data)
                setSource(data)
                setNeedRender(!needRender)
            })
    },[date, selectedIndex, timeRange]);

    const onSceneLoaded = (scene) => {
        console.log('first render scene')
        scene.addControl(zoom);
        scene.addControl(scale);
        scene.addControl(fullscreen);
        scene.addControl(exportImage);
    }   

    return(
    <Box>
        <NavBar/>
        <Box sx={{display: 'flex'}}>
        <Box sx={{ 
            display: 'flex',flexDirection: 'column', 
            width: 'auto', maxWidth: 240, bgcolor: 'background.paper',position:'sticky' }}>
            <StyledList sx={{ml:.8}}>
                <ListItem disablePadding>
                <ListItemButton
                    selected={selectedIndex === 1}
                    onClick={(event) => handleListItemClick(event, 1)}>
                    <ListItemIcon>
                    <HomeOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="感染人数统计" sx={{mr:1}}/>
                </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                <ListItemButton
                    selected={selectedIndex === 2}
                    onClick={(event) => handleListItemClick(event, 2)}>
                    <ListItemIcon>
                    <LeaderboardOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="疫苗接种统计" />
                </ListItemButton>
                </ListItem>
                {/* <ListItem disablePadding>
                <ListItemButton
                    selected={selectedIndex === 3}
                    onClick={(event) => handleListItemClick(event, 3)}>
                    <ListItemIcon>
                    <GroupOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="病毒传播情况" />
                </ListItemButton>
                </ListItem> */}
            </StyledList>
            <Box sx={{display:'flex',flexGrow:1,flexDirection:'column'}}>
            <Box sx={{display: 'flex', justifyContent:'flex-start', mt:'5vh'}}>
                <InsightsIcon sx={{mr:1, ml:2}}/>
                选择显示数据
            </Box>
            <FormControl sx={{ml:2.8}}>
                <RadioGroup
                value={showKey}
                name="choose-field"
                onChange={handleRadioChange}
                >
                {showKeyList.map((item, index, arr)=>{
                    return <FormControlLabel value={item} key={index} control={<Radio size="small"/>} label={nameMapDict[item]} />
                })}
                </RadioGroup>
            </FormControl>
            </Box>
            <Box sx={{fontSize:'1.1em',flexDirection:'column'}}>
            <Box sx={{display: 'flex', justifyContent:'flex-start'}}>
            <SettingsIcon sx={{mr:1, ml:2}}/>
            时间跨度单位
            </Box>
            <ButtonGroup
                sx={{mr:1.5, ml:1.5, mt:1.5}} aria-label="time range button group">
                <Button variant={timeRange === 1 ? "contained" : "outlined"} onClick={(event) => changeTimeRange(event, 1)}>Day</Button>
                <Button variant={timeRange === 2 ? "contained" : "outlined"} onClick={(event) => changeTimeRange(event, 2)}>Month</Button>
                <Button variant={timeRange === 3 ? "contained" : "outlined"} onClick={(event) => changeTimeRange(event, 3)}>Year</Button>
            </ButtonGroup>
            </Box>
        </Box>
        <Box sx={{width: '100%', height:'90vh'}}>
            <LarkMap {...config} style={{ height: '100%' }} onSceneLoaded={onSceneLoaded} >
                <MyPolygonLayer source={source} selectedIndex={selectedIndex} showKeyList={showKeyList} showKey={showKey} needRender={needRender} labels={labels} handleDrawerOpen={handleDrawerOpen}/>
                <CustomControl position="leftcenter">
                    <Legend selectedIndex={selectedIndex} showKey={showKey} labels={labels}/>
                </CustomControl>
            </LarkMap>
            <Box  sx={{display: 'flex', justifyContent:'flex-start', flexDirection:'row'}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                    inputFormat={dateFormat}
                    label="range(2020-01-01, 2022-08-31)"
                    value={date}
                    views={timeView}
                    onChange={handleChange}
                    renderInput={(params) => <TextField size="small" {...params} />}
                    minDate={new Date("2020-01-01")}
                    maxDate={new Date("2022-08-31")}
                    placeholderText="range(2020-01-01, 2022-08-31)"
                />
                </LocalizationProvider>
                <Box sx={{ width: '100%' , ml:5, mr:5, position:'relative'}}>
                    {dateSlider()}
                </Box>
            </Box>
        </Box>
        </Box>
        <Drawer
            sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: drawerWidth,
            },
            }}
            variant="persistent"
            anchor="right"
            open={open}
        >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
             <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{display:'flex',flexDirection:'column'}}>
            <Card sx={{ minWidth: '25vw', mr:2, ml:2, mt:3 }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                {localProp?localProp.name:'未选择国家'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                {localProp?localProp.location_key:''}
                </Typography>
            </CardContent>
            </Card>
            {selectedIndex === 1?
            <Card sx={{ minWidth: '25vw', mr:2, ml:2 ,mt:3}}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                {'累积感染人数年龄分布'}
                </Typography>
                {
                    info? info.age  ? <AgeChart info={info.age}/>:'该国家没有此类数据':''
                }
            </CardContent>
            </Card>:''
            }
            {selectedIndex === 1?
            <Card sx={{ minWidth: '25vw', mr:2, ml:2 ,mt:3}}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                {'累積感染人数性别分布'}
                </Typography>
                {
                    info?info.sex ?<SexChart info={info.sex}/>:'该国家没有此类数据':''
                }
            </CardContent>
            </Card>:''
            }
            <Card sx={{ minWidth: '25vw', mr:2, ml:2 ,mt:3}}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                {selectedIndex === 1?'历年感染人数变化':'历年接种疫苗人数变化'}
                </Typography>
                {
                    info? info.line?<LineChart  info={info.line} selectedIndex={selectedIndex}/>:'该国家没有此类数据':''
                }
            </CardContent>
            </Card>
        </Box>
      </Drawer>
    </Box>
    )
}