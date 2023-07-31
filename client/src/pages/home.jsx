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
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';

//Icon import
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import SaveIcon from '@mui/icons-material/Save';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

//api
import api,{file_url} from '../api.js'

//other func
import fileDownload from 'js-file-download'

//cookie
const cookies = new Cookies();

const NavBar = ({userId, userName, saveScore, exportScore, checkAllScore}) => {
    const navigate = useNavigate();

    const logout = () => {
        saveScore()
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
                    <MenuItem onClick={()=>{saveScore(true);handleClose();}}>
                        <SaveIcon sx={{mr:2}} />
                        保存分数
                    </MenuItem>
                    <MenuItem onClick={()=>{exportScore();handleClose()}}>
                        <SaveAltIcon sx={{mr:2}} />
                        汇出纪录
                    </MenuItem>
                    <MenuItem onClick={()=>{checkAllScore(userId);handleClose()}}>
                        <ContentPasteSearchIcon sx={{mr:2}} />
                        查看打分状况
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
                    {!userId?'未登入':userName}
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
    const [openAlert, setOpenAlert] = useState(false);
    const [alert, setAlert] = useState('');
    const [open, setOpen] = useState(false);
    const [openInfo, setOpenInfo] = useState(true);

    const [userId, setUserId] = useState(cookies.get('user_id'));
    const [userName, setUserName] = useState(cookies.get('user_name'));

    const [fileList, setFileList] = useState([]);
    const [saveScoreList, setSaveScoreList] = useState({});
    const [checkScore, setCheckScore] = useState({});
    const [noScoreList, setNoScoreList] = useState(null);

    const [maxPage, setMaxPage] = useState(1);
    const [page, setPage] = useState(1);

    // 遍歷前端圖片文件夾
    // const modulesFiles =  require.context('../../public/images/', false,  /\.(png|jpg|jpeg)/)
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
    },[]);

    useEffect(() => {
        // 後端從數據庫讀該頁圖片列表 ***join score table
        api({url:'/getFileList', params:{page, user_id:userId}})
            .then((res)=>setFileList(res.data))
    },[page]);

    const jumpToFile = (fileId) => {
        // 找到錨點
        let anchorId = fileId%10
        let anchorElement = document.getElementById(anchorId?anchorId:10);
        // 如果對應id的錨點存在，就跳轉到錨點
        setPage(Math.ceil(fileId/10))
        if(anchorElement) { 
            anchorElement.scrollIntoView({block: 'center'}) //behavior: 'smooth'
        }
        
        setOpen(false)
      }

    const handleRadioChange = (file_name, value ) => {
        saveScoreList[file_name] = value
        checkScore[file_name] = value
    }

    const saveScore = (haveAlert) => {
        //console.log(saveScoreList)
        let fileList = Object.keys(saveScoreList)

        if (fileList.length){
            let data = []
            for (let file of fileList){
                data.push({file_name:file, score:saveScoreList[file]})
            }
            api({url:'/saveScore',method:'put',data:{saveScoreList:data,user_id:userId}})
            .then((res)=>{
                //console.log(res.data)
                if (haveAlert){
                    setOpenAlert(true)
                    setAlert('success')
                }
            })
            setSaveScoreList({})
        }
    }

    const exportScore = () => {
        api({url:'/exportScore',params:{user_id:userId}})
            .then((res)=>{
                fileDownload(res.data, userName+".csv")
            })
    }

    const checkFullScore = (value) => {
        return new Promise((resolve, reject) => {
            let fileId = null
            //if (value > page){
                for (let item of fileList){
                    if (!item.score && !checkScore[item.file_name]) {
                        fileId = item.file_id; break;
                    }
                }
            //}
            resolve(fileId)
        })
    }

    const handlePageChange = (event, value) => {
        //檢查分數是否有空值
        checkFullScore(value).then((fileId)=>{
            if (!fileId) {
                saveScore()
                setPage(value);
                window.scrollTo(0, 0);
            } else {
                setOpenAlert(true)
                setAlert('error')
                jumpToFile(fileId)
            }
        })
    }

    const checkAllScore = () => {
        //輸出10筆未打分圖片
        api({url:'/checkScore',params:{user_id:userId}})
            .then((res)=>{
                setNoScoreList(res.data)
                setOpen(true)
            })
    }

    return(
    <Box>
        <NavBar userId={userId} userName={userName}
                saveScore={saveScore}
                exportScore={exportScore}
                checkAllScore={checkAllScore}/>

        <Snackbar
            anchorOrigin={{vertical:'top',horizontal:'center'}}
            open={openAlert}
            autoHideDuration={alert==='error'?null:2000}
            onClose={()=>setOpenAlert(false)}
            sx={{width:'100%'}}>
            {
                alert==='error'?
                <Alert icon={<ErrorOutlineIcon sx={{ fontSize: '1.2em' }} />} severity="error"
                    sx={{ width:'100%',
                    mt:5,ml:1,mr:1,
                    fontSize:'1.2em'}}>
                    有图片未打分！
                </Alert> :
                <Alert icon={<TaskAltIcon sx={{ fontSize: '1.2em' }} />} severity="success"
                sx={{ width:'100%',
                mt:5,ml:1,mr:1,
                fontSize:'1.2em'}}>
                    保存成功！
                </Alert>
            }
        </Snackbar>

        <Snackbar
            anchorOrigin={{vertical:'top',horizontal:'center'}}
            open={openInfo}
            sx={{width:'100%'}}>
                <Alert icon={<InfoOutlinedIcon sx={{ fontSize: '1.2em' }} />} severity="info"
                sx={{ width:'100%',
                mt:5,
                fontSize:'1.2em'}}
                action={
                    <Button color="inherit" size="small"
                    onClick={() => setOpenInfo(false)}
                    sx={{
                        m:0,p:0,
                        fontFamily: 'SimHei', 
                        fontSize:'1em',
                        fontWeight: 400, 
                    }}
                    >
                    确认
                    </Button>
                }>
                    请给视觉质量更高的图像较高的分数
                </Alert>
        </Snackbar>

        <Dialog
        open={open}
        onClose={()=>setOpen(false)}
        fullWidth
        >
            <DialogTitle sx={{backgroundColor:'#0077cf',color:'white'}}>
            此处显示10笔未打分图片（点击可跳转）
            </DialogTitle>
            <DialogContent dividers>
            <Table aria-label="simple table">
                <TableHead>
                <TableRow>
                    <TableCell>档案ID</TableCell>
                    <TableCell>档案名称</TableCell>
                    <TableCell align="right">所在页数</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {noScoreList?.map((row) => (
                    <TableRow
                    key={row.file_id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 },cursor:"pointer" }}
                    onClick={()=>jumpToFile(row.file_id)}
                    >
                    <TableCell align="center">
                        {row.file_id}
                    </TableCell>
                    <TableCell>
                        {row.file_name}
                    </TableCell>
                    <TableCell align="center">
                        {Math.ceil(row.file_id/10)}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </DialogContent>
            <DialogActions>
            <Button onClick={()=>setOpen(false)} autoFocus>
                确认
            </Button>
            </DialogActions>
        </Dialog>

        <Grid sx={{mt:2,mb:2}} container>
            <Grid item xs={0} sm={2}></Grid>
            <Grid item xs={12} sm={8} sx={{display:'flex',justifyContent:'center',alignItem:'center'}}>
            <Pagination sx={{pt:.5,pb:{xs:2,sm:0}}}
                count={maxPage}
                page={page}
                onChange={handlePageChange}
                variant="outlined"
                color="primary" />
            </Grid>
            <Grid item xs={12} sm={2} sx={{textAlign: {xs:'center', sm:'right'}}}>
                <FormControl sx={{width:{xs:'30%',sm:'100%'}}} size="small">
                    <InputLabel>Page</InputLabel>
                    <Select
                        value={page}
                        label="Page"
                        onChange={(e)=>handlePageChange(e, e.target.value)}
                    >
                        {[...Array(maxPage).keys()].map(value=>{
                            return <MenuItem key={value} value={value+1}>{value+1}</MenuItem>
                        })}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
        

        {fileList?.map((item, index)=>(
            <Box key={item.file_id} id={index+1}
                sx={{
                    display: 'flex',
                    flexDirection:'column',
                    alignItem:'center',
                }}>
                <Box sx={{ fontSize:"1.2rem",mt:'-3px',
                    border:'black 3px solid',
                    p:1,
                    display: 'flex',
                    flexDirection:'row',
                    alignItem:'center',
                    justifyContent:'center'}}
                >
                    <Chip label={item.file_name.split('/')[0]} size="small" sx={{mr:1}} variant="outlined" color="info" />
                    <Chip label={item.file_name.split('/')[1]} size="small" sx={{mr:1}} variant="outlined" color="secondary"/>
                    {item.file_name.split('/')[2]}
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
                    <Box sx={{mt:1,mb:1,pl:{sx:0, md:12},display: 'flex',justifyContent:'center'}}>
                        <img src={file_url+encodeURIComponent(item.file_name)} width='512px'/>
                    </Box>
                    <RadioGroup sx={{
                        display: 'flex',
                        justifyContent:'center', 
                        flexDirection:{xs:'row', md:'column'},
                        pl:{xs:0, md:3}}}
                        defaultValue={item.score}
                        onChange={(event,value)=>handleRadioChange(item.file_name, value)}>
                        {[...Array(10).keys()].map((index)=>(
                            <FormControlLabel
                                labelPlacement="start" key={index+1}
                                value={index+1}
                                control={<Radio sx={{'& .MuiSvgIcon-root': {fontSize: {xs:20, sm:24},}}}/>}
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