// React and Basic import
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { darkTheme } from '../css/theme';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

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
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

//api
import api from '../api.js'

//cookie
const cookies = new Cookies();


const NavBar = ({userId}) => {
    const navigate = useNavigate();

    const logout = () => {
        cookies.remove('user_id', { path: '/' });
        cookies.remove('user_name', { path: '/' });
        navigate('/selectUser');
    }

    return(
    <AppBar position="sticky" color="primary">
        <Box sx={{mr:3,ml:3}}>
            <Toolbar disableGutters sx={{display:'flex'}}>
                <Typography
                    noWrap component="a"
                    sx={{ mr: 2, 
                        fontFamily: 'SimHei', 
                        fontSize:'1.3rem',
                        fontWeight: 400, 
                        letterSpacing: '.1rem', 
                        color: 'inherit', 
                        textDecoration: 'none', }}
                >
                    用戶名: {!userId?'未登入':cookies.get('user_name')}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button size="large"
                    sx={{fontSize: '1.3rem'}}
                    variant=""
                    endIcon={<ExitToAppIcon />}
                    onClick={logout}>
                    登出
                </Button>
            </Toolbar>
        </Box>
    </AppBar>
    )
}

//Main
export function Home() {
    const navigate = useNavigate();
    
    const [userId, setUserId] = useState(cookies.get('user_id'));
    const [fileList, setFileList] = useState([]);

    const modulesFiles =  require.context('../../public/images/', false,  /\.(png|jpg|jpeg)/)

    useEffect(() => {
        if (!userId) navigate('/selectUser');
        let list = []
        modulesFiles.keys().forEach((module_item, index) => {
            list.push(module_item.split('/')[1])
            console.log(
                module_item.split('/')[1]
            );
        })
        setFileList(list)
    },[]);


    return(
    <Box height='100vh' >
        <NavBar userId={userId}/>

        {fileList?.map((item)=>(
            <Box key={item}
            sx={{
                display: 'flex',
                flexDirection:'column',
                alignItem:'center'
            }}>
                <Box sx={{ fontSize:"1.5rem",
                    border:'black 3px solid',
                    p:'10px',
                    display: 'flex',
                    alignItem:'center',
                    justifyContent:'center'}}
                >
                    {item}
                </Box>
                <Box sx={{ mb:'10px',
                    borderLeft:'black 3px solid',
                    borderRight:'black 3px solid',
                    display: 'flex',
                    flexDirection:'column',
                    alignItem:'center',
                    justifyContent:'center'}}
                >
                    <img src={'/images/'+item}/>
                    <RadioGroup row>
                        {[...Array(10).keys()].map((index)=>(
                            <FormControlLabel
                                labelPlacement="start" key={index+1}
                                value={index+1} control={<Radio />} label={index+1} />
                        ))}
                    </RadioGroup>
                </Box>
            </Box>
        ))}
    </Box>
    )
}