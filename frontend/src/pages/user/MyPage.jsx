import PageHeader from "../PageHeader";
import Container from "@mui/material/Container";
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import {IconButton} from "@mui/material";
import {useState} from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import api from "../../components/Api";

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

export default function MyPage({ nickname, setNickname }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newNickname, setNewNickname] = useState('');

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
            <PageHeader text={"My Page"}/>
            <Paper elevation={3} style={{ padding: '16px' }}>
                <Box display="flex" flexDirection="column">
                    <Box display="flex" alignItems="center" paddingY={1} borderBottom="1px solid #e0e0e0">
                        <Box flex={1} textAlign="right" sx={{marginRight: '4px'}}>
                            <Typography>ID : </Typography>
                        </Box>
                        <Box flex={2}>
                            <Typography>test</Typography>
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
                            <Typography>test</Typography>
                        </Box>
                    </Box>
                    <Box display="flex" alignItems="center" paddingY={1}>
                        <Box flex={1} textAlign="right" sx={{marginRight: '4px'}}>
                            <Typography>로그인 : </Typography>
                        </Box>
                        <Box flex={2}>
                            <Typography>일반</Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};