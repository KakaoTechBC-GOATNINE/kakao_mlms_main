import PageHeader from "../PageHeader";
import * as React from "react";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import api from "../../components/Api";
import {useNavigate} from "react-router-dom";

export default function PasswordUpdate() {
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const navigate = useNavigate();

    async function handleSave() {
        if (newPassword !== confirmPassword) {
            alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            const response = await api.post('/api/v1/auth/password', { oldPassword, newPassword });

            if (!response.data.success) {
                alert(response.data.error.message);
            } else {
                alert("비밀번호가 변경되었습니다.");
                navigate("/mypage");
            }

        } catch (err) {
            alert('비밀번호 변경에 실패했습니다. 오류가 계속될 경우 관리자에게 문의해주시기 바랍니다.');
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <PageHeader text={"비밀번호 변경"}/>
            <Paper elevation={3} style={{ padding: '16px' }}>
                <Box display="flex" flexDirection="column" sx={{margin: 2}}>
                    <TextField
                        label="이전 비밀번호"
                        variant="standard"
                        sx={{ mb: 2 }}
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <TextField
                        label="새 비밀번호"
                        variant="standard"
                        sx={{ mb: 1 }}
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <TextField
                        label="새 비밀번호 확인"
                        variant="standard"
                        sx={{ mb: 1 }}
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        sx={{ mt: 4 }}
                        onClick={handleSave}
                    >
                        변경하기
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};