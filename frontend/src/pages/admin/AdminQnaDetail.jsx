import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from "@mui/material/Container";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from "@mui/material/Unstable_Grid2";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import api from '../../components/Api';

export default function QnaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [qnaData, setQnaData] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [imageUrls, setImageUrls] = React.useState([]);
    const [answerContent, setAnswerContent] = React.useState('');
    const [isEditing, setIsEditing] = React.useState(false);

    async function deleteAnswer() {
        try {
            const response = await api.delete(`/api/v1/admins/qnas/answer/${id}`);
            if (!response.data.success) {
                alert(response.data.error.message);
            } else {
                alert("답변이 삭제되었습니다.");
                setQnaData(prevData => ({
                    ...prevData,
                    answer: '',
                    isAnswer: false
                }));
                setAnswerContent('');
            }

        } catch (error) {
            alert('답변 삭제에 실패하였습니다.');
        }
    }



    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);  // 이전 에러 메시지를 초기화

            try {
                const response = await api.get(`/api/v1/admins/qnas/${id}`);
                const data = response.data;
                if (response.data.error) {
                    alert(response.data.error.message);
                    navigate(-1);
                }
                setQnaData(data);


                const imagePromises = data.images.map(async (image) => {
                    const imageResponse = await api.get(`/api/v1/qnas/image/${image.uuidName}`, {
                        responseType: 'blob',
                    });
                    return {
                        url: URL.createObjectURL(imageResponse.data),
                        originName: image.originName
                    };
                });

                const urls = await Promise.all(imagePromises);
                setImageUrls(urls);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    setError('비공개 게시물입니다.');
                    navigate('/admin/qnas');
                } else {
                    setError('Q&A 데이터를 불러오는 중 오류가 발생했습니다.');
                    console.error('Failed to fetch Q&A data:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleAnswerChange = (event) => {
        setAnswerContent(event.target.value);
    };

    const handleAnswerSubmit = async () => {
        setError(null); // 이전 에러 메시지를 초기화

        if (answerContent.trim() === '') {
            setError('답변 내용을 입력해주세요.');
            return;
        }

        try {
            const response = await api.post(`/api/v1/admins/qnas/${id}`, answerContent, {
                headers: {
                    'Content-Type': 'text/plain',
                }
            });

            alert('답변이 등록되었습니다.');
            const now = new Date();

            setQnaData(prevData => ({
                ...prevData,
                isAnswer: true,
                answer: {
                    ...prevData.answer,
                    content: answerContent,
                    createdDate: {
                        0: now.getFullYear(),      // 연도
                        1: now.getMonth() + 1,     // 월 (0이 1월이므로 +1 필요)
                        2: now.getDate(),          // 일
                        3: now.getHours(),         // 시
                        4: now.getMinutes(),       // 분
                        5: now.getSeconds(),       // 초
                        6: now.getTime()
                    }
                }
            }));
            setIsEditing(false);
        } catch (error) {
            console.error('답변 등록 실패:', error);
            setError('답변 등록에 실패했습니다.');
        }
    };

    const handleEdit = () => {
        setIsEditing(true); // 입력 칸 활성화
        setAnswerContent(qnaData.answer.content); // 기존 답변을 입력칸에 미리 채움
    };

    const handleDelete = async () => {
        setError(null); // 이전 에러 메시지를 초기화

        if (window.confirm("정말 삭제하시겠습니까?")) {
            try {
                await api.delete(`/api/v1/qnas/${id}`);
                alert("삭제되었습니다.");
                navigate('/admin/qnas');
            } catch (error) {
                console.error("삭제 실패:", error);
                setError("삭제에 실패했습니다.");
            }
        }
    };

    function formatDateTime(dateArray) {
        if (!dateArray || dateArray.length < 6) {
            return "Invalid Date";
        }

        const year = String(dateArray[0]).slice(0); // '2024'
        const month = String(dateArray[1]).padStart(2, '0'); // '8' -> '08'
        const day = String(dateArray[2]).padStart(2, '0'); // '20'
        const hour = String(dateArray[3]).padStart(2, '0'); // '16'
        const minute = String(dateArray[4]).padStart(2, '0'); // '16'
        return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
    }

    const handleImageError = (index) => {
        setImageUrls((prevUrls) =>
            prevUrls.map((img, i) =>
                i === index ? { ...img, url: null } : img
            )
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container component="main" maxWidth="md" sx={{ marginTop: 4, marginBottom: 4 }}>
            <Box sx={{ marginBottom: 2 }}>
                <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
                    {qnaData.category}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">
                        <strong>글 번호:</strong> {qnaData.id}
                    </Typography>
                    <Typography variant="body1">
                        <strong>작성자:</strong> {qnaData.user.nickname}
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="body1">
                        <strong>답변 상태:</strong> <span style={{ color: qnaData.isAnswer ? 'green' : '#FF6347' }}>
                            {qnaData.isAnswer ? '답변 완료' : '답변 대기'}
                        </span>
                    </Typography>
                    <Typography variant="body1">
                        <strong>작성일자:</strong> {formatDateTime(qnaData.createdDate)}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ marginTop: 6, marginBottom: 2, borderBottom: '1px solid #ddd', paddingBottom: 2 }}>
                <Typography variant="h4" align="left" gutterBottom>
                    {qnaData.title}
                </Typography>
            </Box>

            <Box sx={{ marginTop: 4 }}>
                {/* 이미지 표시 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 4 }}>
                    {imageUrls.map((img, index) => (
                        img.url ? (
                            <img
                                key={index}
                                src={img.url}
                                alt={img.originName}
                                style={{ maxWidth: '100%', marginBottom: '16px' }}
                                onError={() => handleImageError(index)}
                            />
                        ) : (
                            <Typography key={index} variant="body1" color="textSecondary">
                                {img.originName}
                            </Typography>
                        )
                    ))}
                </Box>

                <Typography variant="h6" gutterBottom sx={{ textIndent: '20px' }}>
                    본문
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: 2, borderRadius: 1 }}>
                    {qnaData.content}
                </Typography>

                {qnaData.isAnswer && !isEditing && (
                    <>
                        <Typography variant="h6" gutterBottom sx={{ textIndent: '20px' }}>
                            답변
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', backgroundColor: '#f0f8ff', padding: '15px 20px', borderRadius: '10px', border: '1px solid #b3d4fc' }}>
                            {qnaData.answer.content}
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'right', color: 'textSecondary', marginTop: 2 }}>
                            작성일: {formatDateTime(qnaData.answer.createdDate)}
                        </Typography>
                        <Box
                            display="flex"
                            justifyContent="flex-end"  // 오른쪽 정렬
                            padding={2} // 원하는 만큼 패딩을 추가
                        >
                            <Button variant="contained" color="success" onClick={deleteAnswer}>
                                답변 삭제
                            </Button>
                        </Box>
                    </>
                )}

                {/* 답변 입력 박스 */}
                {(isEditing || !qnaData.isAnswer) && (
                    <Box sx={{ marginTop: 4, padding: 2, borderRadius: 1 }}>
                        <TextField
                            label="답변"
                            multiline
                            fullWidth
                            rows={4}
                            variant="outlined"
                            value={answerContent}
                            onChange={handleAnswerChange}
                            sx={{ marginBottom: 2 }}
                        />
                    </Box>
                )}
                {/* 에러 메시지 표시 위치 변경 */}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Box>

            <Grid container spacing={2} sx={{ marginTop: '30px', justifyContent: 'flex-end' }}>
                <Grid xs={3}>
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={() => {
                            if (!qnaData.isAnswer && !isEditing) {
                                if (answerContent.trim() === '') {
                                    setError('답변 내용을 입력해주세요.');
                                    return;
                                }
                                handleAnswerSubmit();
                            } else if (isEditing) {
                                handleAnswerSubmit();
                            } else {
                                handleEdit();
                            }
                        }}
                    >
                        {isEditing ? '답변 등록' : qnaData.isAnswer ? '답변 수정' : '답변 등록'}
                    </Button>
                </Grid>
                <Grid xs={3}>
                    <Button
                        variant="contained"
                        color="error"
                        size="large"
                        fullWidth
                        onClick={handleDelete}
                    >
                        삭제
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}
