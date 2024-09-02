import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()[]\\\/+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

export default function Login({setNickname}) {
    const navigate = useNavigate();
    const [loginId, setLoginId] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!loginId || !password) {
            setError('아이디와 패스워드를 모두 입력해 주세요.');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/sign-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    serialId: loginId,
                    password: password,
                }),
                credentials: 'include'
            });

            if (response.ok) {
                setNickname(getCookie("nickname"));
                navigate('/');
            } else {
                // 로그인 실패 처리
                const errorData = await response.json();
                setError(errorData.message || '아이디와 패스워드를 확인해주세요.');
            }
        } catch (err) {
            setError('서버와의 통신에 문제가 발생했습니다. 나중에 다시 시도해 주세요.');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">LOGIN</Typography>
                <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
                    <TextField
                        margin="normal"
                        fullWidth
                        id="loginId"
                        label="ID"
                        name="serialId"
                        autoFocus
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        name="password"
                        label="PASSWORD"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && (
                        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2, mb: 2 }}
                    >
                        Login
                    </Button>
                    <Button
                        fullWidth
                        sx={{ backgroundColor: 'rgb(254, 229, 2)', color: "black", '&:hover': { backgroundColor: 'rgba(254, 229, 2, 0.8)' }}}
                        startIcon={
                            <Box
                                component="img"
                                src="/kakao-logo.png"
                                sx={{ width: 18, height: 24 }}
                            />
                        }
                        onClick={() => { window.location.href = `${process.env.REACT_APP_API_KAKAO_URL}:8080/oauth2/authorization/kakao`; }}
                    >
                        카카오 로그인
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2, mb: 2 }}
                        onClick={() => { window.location.href = '/sign-up'; }}
                    >
                        회원가입
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
