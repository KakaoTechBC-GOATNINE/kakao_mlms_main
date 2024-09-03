import PageHeader from "../PageHeader";
import Container from "@mui/material/Container";
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import {IconButton} from "@mui/material";
import {useEffect, useState} from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useNavigate } from 'react-router-dom';
import api from '../../components/Api';

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

export default function MyPage({ nickname, setNickname }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newNickname, setNewNickname] = useState('');

    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api.get('/api/v1/users');
                setUserInfo(response.data.data);
                setLoading(false);
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    alert("로그인 페이지로 이동합니다.");
                    navigate('/login');
                } else {
                    alert("서버 오류가 발생하였습니다. 잠시후 다시 시도해주세요.")
                    navigate('/login');
                }
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [navigate]);

    function handleEditNicknameClick() {
        setIsEditing(true);
        setNewNickname(nickname);
    }

    async function handleSaveNickname() {
        if (newNickname === nickname) {
            setIsEditing(false);
            return;
        }
        try {
            const response = await api.post('/api/v1/auth/update', {nickname: newNickname});
            if (response.data.success === false && response.data.error) {
                alert(`${response.data.error.message}`);
            } else {
                setCookie('nickname', newNickname);
                alert('내 정보가 변경되었습니다.');
                setIsEditing(false);
            }
        } catch (err) {
            alert('닉네임 변경에 실패했습니다. 다시 시도해 주세요.');
        }
        setNickname(newNickname);
    }

    function handleNicknameChangeInput(e) {
        setNewNickname(e.target.value);
    }

    return (
        <Container component="main" maxWidth="xs">
            <PageHeader text={"개인정보 수정"}/>
            <Paper elevation={3} style={{ padding: '16px' }}>
                {userInfo ? (
                <Box display="flex" flexDirection="column">
                    <Box display="flex" alignItems="center" paddingY={1} borderBottom="1px solid #e0e0e0">
                        <Box flex={1} textAlign="right" sx={{marginRight: '4px'}}>
                            <Typography>ID : </Typography>
                        </Box>
                        <Box flex={2}>
                            <Typography>{userInfo.serialId}</Typography>
                        </Box>
                    </Box>
                    <Box display="flex" alignItems="center" paddingY={1} borderBottom="1px solid #e0e0e0">
                        <Box flex={1} textAlign="right" sx={{marginRight: '4px'}}>
                            <Typography>닉네임 : </Typography>
                        </Box>
                        <Box flex={2}>
                            {isEditing ? (
                                <>
                                    <TextField
                                        variant="standard"
                                        value={newNickname}
                                        onChange={handleNicknameChangeInput}
                                    />
                                    <Button size="small" onClick={handleSaveNickname}>
                                        저장
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {nickname}
                                    <IconButton aria-label="location" size="small" onClick={handleEditNicknameClick}>
                                        <BorderColorIcon fontSize="small" />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>
                    <Box display="flex" alignItems="center" paddingY={1} borderBottom="1px solid #e0e0e0">
                        <Box flex={1} textAlign="right" sx={{marginRight: '4px'}}>
                            <Typography>등급 : </Typography>
                        </Box>
                        <Box flex={2}>
                            <Typography>{userInfo.eRole === 'ADMIN' ? '관리자' : '회원'}</Typography>
                        </Box>
                    </Box>
                    <Box display="flex" alignItems="center" paddingY={1} sx={{mb: 3}}>
                        <Box flex={1} textAlign="right" sx={{marginRight: '4px'}}>
                            <Typography>로그인 : </Typography>
                        </Box>
                        <Box flex={2}>
                            <Typography>{userInfo.eProvider === 'KAKAO' ? '카카오' : '일반'}</Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/mypage/password')}
                    >비밀번호 수정</Button>
                </Box>

                    ) : (
                    <p>No user information available.</p>
                )}
            </Paper>
        </Container>
    );
};