// React and Basic import
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { darkTheme } from '../css/theme';
import { styled,alpha } from '@mui/material/styles';
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
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
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
import InputBase from '@mui/material/InputBase';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';

//Icon import
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

//api
import api from '../api.js'

//cookie
const cookies = new Cookies();

//SearchField
const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  }));
  
const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));
  
const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
            width: '20ch',
        },
        },
    },
}));

//Main
export function User() {
    const [userList, setUserList] = useState([]);
    const [searchList, setSearchList] = useState([]);
    const [render, setRender] = useState(false);

    const [open, setOpen] = useState(false);
    const [openType, setOpenType] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [selectUser, setSelectUser] = useState(null);

    const [input, setInput] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState('');

    useEffect(() => {
        api({url:'/getUserList'}).then((res) => {
            setUserList(res.data)
            if (searchInput !== '') {
                let newUserList = []
                res.data.forEach((item) => {
                    if (item.user_name.toLowerCase().includes(searchInput.toLowerCase())){
                        newUserList.push(item)
                    }
                });
                setSearchList(newUserList)
            } else {
                setSearchList(res.data)
            }
        })
    }, [render])

    const handleClose = () => {
        setInput('');
        setError(false);
        setOpen(false);
        setHelperText('');
    };

    const handleConfirmClose = () => {
        setConfirmOpen(false)
    };

    const handleSearchChange = (value) => {
        setSearchInput(value)
        let newUserList = []
        userList.forEach((item) => {
            if (item.user_name.toLowerCase().includes(value.toLowerCase())){
                newUserList.push(item)
            }
        });
        setSearchList(newUserList)
    }

    const addUser = () => {
        if (input) {
            api({url:'/addUser', method:'post',data:{"user_name":input}})
                .then((res) => {
                if(res.data === 'existed'){
                    setError(true)
                    setHelperText('用戶名已存在')
                } else {
                    setRender(!render)
                    handleClose()
                }
            })
        } else {
            setError(true)
            setHelperText('請輸入用戶名')
        }
    }

    const putUser = () => {
        if (input) {
            api({url:'/putUser', method:'put',data:{'user_id':selectUser, 'user_name': input}})
                .then((res) => {
                if(res.data === 'existed'){
                    setError(true)
                    setHelperText('用戶名已存在')
                } else {
                    setRender(!render)
                    handleClose()
                }
            })
        } else {
            setError(true)
            setHelperText('請輸入用戶名')
        }
    }

    const deleteUser = () => {
        api({url:'/deleteUser', method:'delete',data:{'user_id':selectUser}})
        .then((res) => {
            setConfirmOpen(false)
            setRender(!render)
        }) 
    }

    const navigate = useNavigate();

    const setUserCookies = (item) => {
        cookies.set('user_id', item.user_id, 
            { path: '/',secure: true,sameSite :true}
        );
        cookies.set('user_name', item.user_name, 
            { path: '/',secure: true,sameSite :true}
        );
        navigate('/');
    }

    return(
    <Box sx={{height: '100vh',display: 'flex', flexDirection:'column', alignItems:'center'}}>
        <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{mt:'10vh', mb:'10px'}}
        >
            選擇用戶
        </Typography>
        <Box width='80vw' sx={{border:'#1783d3 3px solid', borderRadius:'10px'}} >
            <Box sx={{
                display: 'flex',
                flexDirection:'row',
                backgroundColor:'#1783d3',
                color:'white',
                fontFamily: 'SimHei',
                padding:'10px',
                alignItems:'center',
                borderTopLeftRadius: '5px',
                borderTopRightRadius: '5px',
                }}>
                <Search>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                    placeholder="Search…"
                    inputProps={{ 'aria-label': 'search' }}
                    onChange={(e)=>handleSearchChange(e.target.value)}
                    />
                </Search>
                <Box sx={{flexGrow:1}}/>
                <Button size="large" sx={{fontSize: '1.3rem'}}
                    variant=""
                    endIcon={<AddIcon style={{ color: 'white' }}/>}
                    onClick={()=>{setOpen(true);setOpenType('add')}}>
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }}}>
                        新增用戶
                    </Box>
                </Button>
            </Box>
            <List sx={{ 
                maxWidth: '80vw',
                bgcolor: 'background.paper',
                p:'10px', 
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                }}>
            {searchList?.map((item) => (
                <ListItem
                key={item.user_id}
                disableGutters
                >
                    <ListItemButton sx={{marginRight:'40px'}} onClick={()=>setUserCookies(item)}>
                        <ListItemText primary={item.user_name} />
                    </ListItemButton>
                    <ListItemSecondaryAction>
                        <IconButton aria-label="comments" onClick={()=>{
                            setOpen(true)
                            setSelectUser(item.user_id)
                            setInput(item.user_name)
                            setOpenType('edit')
                        }}>
                            <EditIcon />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={()=>{
                            setSelectUser(item.user_id)
                            setConfirmOpen(true)}
                            }>
                            <DeleteIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
            </List>
        </Box>

        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{openType === 'add'? '新增用戶': '編輯用戶'}</DialogTitle>
            <DialogContent sx={{pb:'20px'}}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Username"
                    fullWidth
                    variant="outlined"
                    error={error}
                    helperText={helperText}
                    value={input}
                    onChange={(e)=>{
                        setInput(e.target.value)
                        setError(false)
                        setHelperText('')
                    }}
                />
            </DialogContent>
            <DialogActions sx={{display:'flex',justifyContent:'space-between'}}>
            <Button sx={{ml:'15px'}} variant="contained" onClick={handleClose}>Cancel</Button>
            <Button sx={{mr:'15px'}} variant="contained" color="secondary" onClick={openType === 'add'?addUser:putUser}>Submit</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={confirmOpen} onClose={handleConfirmClose}>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogActions sx={{display:'flex',justifyContent:'space-between'}}>
            <Button sx={{ml:'15px'}} variant="contained" onClick={handleConfirmClose}>Cancel</Button>
            <Button sx={{mr:'15px'}} variant="contained" color="secondary" onClick={deleteUser}>Delete</Button>
            </DialogActions>
        </Dialog>
    </Box>
    )
}