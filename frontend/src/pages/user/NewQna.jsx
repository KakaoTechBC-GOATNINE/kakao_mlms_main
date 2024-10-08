import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button";
import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from "@mui/material/TextField";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LockIcon from '@mui/icons-material/Lock';
import { styled } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import api from '../../components/Api';

export default function NewQna() {
    const [category, setCategory] = React.useState('');
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [files, setFiles] = React.useState([]);
    const [isBlind, setIsBlind] = React.useState(false);
    const [error, setError] = React.useState(null); // 에러 상태 추가
    const navigate = useNavigate();

    const handleChange = (event) => {
        setCategory(event.target.value);
    };

    const fileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);

        const filePreviews = selectedFiles.map(file => ({
            file: file,
            url: URL.createObjectURL(file),
            originName: file.name,
        }));

        setFiles(prev => [...prev, ...filePreviews]);
    };

    const handleBlindChange = (event) => {
        setIsBlind(event.target.checked);
    };

    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setError(null); // 에러 상태 초기화

        if (!title || !content || !category) {
            setError('모든 값을 채워주세요.');
            return;
        }

        const formData = new FormData();

        const json = JSON.stringify({
            title,
            content,
            category,
            isBlind,
        });
        const jsonBlob = new Blob([json], { type: 'application/json' });
        formData.append('qnaRequestDto', jsonBlob);

        files.forEach(({ file }) => {
            formData.append('images', file);
        });

        try {
            await api.post(`/api/v1/qnas`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/qnas');
        } catch (error) {
            console.error('작성 실패:', error);
            setError('작성에 실패했습니다.');
        }
    };

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    return (
        <Container component="main" maxWidth="sm" sx={{ marginTop: 4, marginBottom: 4 }}>
            <Stack spacing={3}>
                {error && (
                    <Alert severity="error">{error}</Alert>
                )}
                <FormControl fullWidth>
                    <FormControlLabel
                        control={
                            <Checkbox checked={isBlind} onChange={handleBlindChange} />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', color: isBlind ? 'red' : 'inherit' }}>
                                {isBlind && <LockIcon sx={{ marginRight: 1 }} />}
                                <span>비공개</span>
                            </Box>
                        }
                        sx={{ marginBottom: 2 }}
                    />
                    <FormControl fullWidth sx={{ marginTop: 2 }}>
                        <InputLabel id="demo-simple-select-label">유형</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={category}
                            label="유형"
                            onChange={handleChange}
                            sx={{ marginBottom: 2 }}
                        >
                            <MenuItem value={"GENERAL"}>일반 질문</MenuItem>
                            <MenuItem value={"ACCOUNT"}>계정 관련</MenuItem>
                            <MenuItem value={"TECH_SUPPORT"}>기술 지원</MenuItem>
                            <MenuItem value={"OTHER"}>기타</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        id="outlined-basic"
                        label="제목"
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        id="outlined-basic"
                        label="내용"
                        variant="outlined"
                        multiline
                        minRows={10}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    {/* Display selected files */}
                    <Box sx={{ marginBottom: 2 }}>
                        {files.map((file, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                                <img
                                    src={file.url}
                                    alt={file.originName}
                                    style={{ maxWidth: '50px', marginRight: '8px' }}
                                />
                                <Typography variant="body2">{file.originName}</Typography>
                                <IconButton
                                    onClick={() => handleRemoveFile(index)}
                                    size="small"
                                    sx={{ marginLeft: 1 }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                    <Button
                        component="label"
                        role={undefined}
                        variant="outlined"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                        sx={{ marginBottom: 4 }}
                    >
                        {`첨부파일${files.length > 0 ? ` (${files.length}건)` : ''}`}
                        <VisuallyHiddenInput
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={fileChange}
                        />
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                    >
                        작성하기
                    </Button>
                </FormControl>
            </Stack>
        </Container>
    );
}
