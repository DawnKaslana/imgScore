// React and Basic import
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

// React MUI import
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

//Icon import
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import SaveIcon from '@mui/icons-material/Save';

//api
import api,{file_url} from '../api.js'

//cookie
const cookies = new Cookies();

const NavBar = ({userId, saveScore}) => {
    const navigate = useNavigate();

    const logout = () => {
        cookies.remove('user_id', { path: '/' });
        cookies.remove('user_name', { path: '/' });
        navigate('/selectUser');
    }

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    return(
    <AppBar position="sticky" color="primary" >
        <Box sx={{mr:3,ml:3}}>
            <Toolbar disableGutters sx={{display:'flex'}}>
                <IconButton 
                    id="button"
                    aria-controls={open ? 'menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    sx={{mr:1, ml:-1}}>
                    <MenuIcon sx={{color:'white'}}/>
                </IconButton>
                <Menu
                    id="menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                    'aria-labelledby': 'menu-button',
                    }}
                >
                    <MenuItem onClick={()=>{saveScore();handleClose();}}>
                        <SaveIcon sx={{mr:2}} />
                        保存
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <SaveAltIcon sx={{mr:2}} />
                        匯出紀錄
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <ContentPasteSearchIcon sx={{mr:2}} />
                        查看打分狀況
                    </MenuItem>
                </Menu>
                <Typography
                    noWrap component="a"
                    sx={{fontFamily: 'SimHei', 
                        fontSize:'1.3rem',
                        fontWeight: 400, 
                        letterSpacing: '.1rem', 
                        color: 'inherit', 
                        textDecoration: 'none',
                        display:{xs:'none',sm:'block'}}}
                >
                    用戶名: 
                </Typography>
                <Typography
                    noWrap component="a"
                    sx={{ ml: 1, 
                        fontFamily: 'SimHei', 
                        fontSize:'1.3rem',
                        fontWeight: 400, 
                        letterSpacing: '.1rem', 
                        color: 'inherit', 
                        textDecoration: 'none'}}
                >
                    {!userId?'未登入':cookies.get('user_name')}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button size="large"
                    sx={{fontSize: {xs:'0',sm:'1.3rem'}}}
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
    const [scoreRecord, setScoreRecord] = useState({});
    const [saveScoreList, setSaveScoreList] = useState([]);

    const [maxPage, setMaxPage] = useState(1);
    const [page, setPage] = useState(1);

    // 遍歷前端圖片文件夾
    //const modulesFiles =  require.context('../../public/images/', false,  /\.(png|jpg|jpeg)/)
        
    // let list = []
    // modulesFiles.keys().forEach((module_item, index) => {
    //     list.push(module_item.split('/')[1])
    //     console.log(
    //         module_item.split('/')[1]
    //     );
    // })
    // setFileList(list)

    useEffect(() => {
        if (!userId) navigate('/selectUser');
        // 獲取總頁數
        api({url:'/getFileNumber'})
        .then((res)=>{
            setMaxPage(Math.ceil(res.data.count/10))
        })
        // 獲取已保存分數
        api({url:'/showScore', params:{user_id:userId}})
            .then((res)=>{setScoreRecord(res.data);console.log(res.data)})
    },[]);

    useEffect(() => {
        // 後端從數據庫讀該頁圖片列表
        api({url:'/getFileList', params:{page}})
            .then((res)=>{setFileList(res.data)})
    },[page]);

    const handlePageChange = (event, value) => {
        window.scrollTo(0, 0)
        setPage(value);
    }

    const handleRadioChange = (file_name, value ) => {
        setSaveScoreList([
            ...saveScoreList,
            { file_name, score: value }
          ])
    }

    const saveScore = () => {
        console.log(saveScoreList)
        if (saveScoreList.length){
            api({url:'/saveScore',method:'put',data:{saveScoreList,user_id:userId}})
            .then((res)=>{console.log(res.data)})
            setSaveScoreList([])
        }
    }

    return(
    <Box>
        <NavBar userId={userId} saveScore={saveScore}/>
        
        <Box sx={{pt:2,pb:2, display: 'flex',justifyContent:'center'}}>
            <Pagination  count={maxPage} page={page} onChange={handlePageChange}  variant="outlined" color="primary" />
        </Box>

        {fileList?.map((item)=>(
            <Box key={item.file_id}
            sx={{
                display: 'flex',
                flexDirection:'column',
                alignItem:'center',
            }}>
                <Box sx={{ fontSize:"1.2rem",mt:'-3px',
                    border:'black 3px solid',
                    p:'10px',
                    display: 'flex',
                    alignItem:'center',
                    justifyContent:'center'}}
                >
                    {item.file_name}
                </Box>
                <Box sx={{
                    borderLeft:'black 3px solid',
                    borderRight:'black 3px solid',
                    borderBottom:'black 3px solid',
                    display: 'flex',
                    flexDirection:{xs:'column', md:'row'},
                    alignItem:'center',
                    justifyContent:'center'}}
                >   
                    <Box sx={{mt:1,mb:1,display: 'flex',justifyContent:'center'}}>
                        <img src={file_url+item.file_name} width='512px'/>
                    </Box>
                    <RadioGroup sx={{
                        display: 'flex',
                        justifyContent:'center', 
                        flexDirection:{xs:'row', md:'column'},
                        pl:{xs:0, md:3}}}
                        defaultValue={scoreRecord[item.file_name]}
                        onChange={(event,value)=>handleRadioChange(item.file_name, value)}>
                        {[...Array(10).keys()].map((index)=>(
                            <FormControlLabel
                                labelPlacement="start" key={index+1}
                                value={index+1}
                                control={<Radio sx={{'& .MuiSvgIcon-root': {fontSize: {xs:20, sm:24},},}}/>}
                                label={index+1} />
                        ))}
                    </RadioGroup>
                </Box>
            </Box>
        ))}
        <Box sx={{pt:2,pb:2, display: 'flex',justifyContent:'center'}}>
            <Pagination  count={maxPage} page={page} onChange={handlePageChange}  variant="outlined" color="primary" />
        </Box>
    </Box>
    )
}