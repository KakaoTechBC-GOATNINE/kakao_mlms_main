import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 토큰을 쿠키에서 가져오는 함수 (HTTP-Only 쿠키는 접근 불가)
function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()[]\\\/+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        const accessToken = getCookie('accessToken');
        const role = getCookie('role');

        // /logout 경로가 포함되어 있지 않고, accessToken이 없을 때만 role을 검사
        if (!config.url.includes('/logout') && !config.url.includes('/register')) {
            if (!role && accessToken) {
                alert('닉네임을 등록해주세요.');
                // 경고창을 띄운 후 /sign-up-kakao 경로로 리디렉션
                window.location.href = '/sign-up-kakao';
                return Promise.reject(new Error('Role is missing. Please register a nickname.'));
            }
        }

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);


// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.data?.error?.code === '4010') {
            try {
                // 서버에서 리프레시 토큰을 사용해 재발급 요청
                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/api/v1/auth/reissue`,
                    {},  // 요청 본문이 없으면 빈 객체를 전달
                    {
                        withCredentials: true,  // 이 요청에 대해서만 크레덴셜 설정
                    }
                );
                const data = response.data;

                // 새로운 엑세스 토큰을 쿠키에 저장
                document.cookie = `accessToken=${data.data.accessToken}; path=/;`;

                // 원래 요청에 새 토큰 적용
                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

                // 요청 재시도
                return api(originalRequest);
            } catch (reissueError) {
                console.error('Token reissue failed:', reissueError);
                const navigate = useNavigate();
                document.cookie = 'accessToken=; Max-Age=0; path=/;';
                document.cookie = 'nickname=; Max-Age=0; path=/;';
                alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
                navigate('/login');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
