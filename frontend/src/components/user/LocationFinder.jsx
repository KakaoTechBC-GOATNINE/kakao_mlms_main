import Grid from '@mui/material/Unstable_Grid2';
import TextField from "@mui/material/TextField";
import * as React from "react";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { useDaumPostcodePopup } from "react-daum-postcode";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { IconButton } from "@mui/material";
import api from '../Api';
import { SyncLoader } from "react-spinners"; //스피너

export default function LocationFinder({ setCoords, setStores, setRecommendedStores, setNotRecommendedStores }) {
    const open = useDaumPostcodePopup();
    const [address, setAddress] = useState("");
    const [keyword, setKeyword] = useState("");
    const [localCoords, setLocalCoords] = useState({ latitude: "", longitude: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 컴포넌트가 처음 렌더링될 때 사용자의 현재 위치 설정
        handleCurrentLocation();
    }, []);

    // 주소를 좌표로 변환하는 함수 (fetch 사용)
    async function addressToCoords(address) {
        try {
            const response = await fetch(
                `https://dapi.kakao.com/v2/local/search/address.json?query=${address}`,
                {
                    headers: {
                        Authorization: 'KakaoAK 72a40f848446b331a895daaba6400196',
                    },
                }
            );

            const data = await response.json();

            if (data.documents.length > 0) {
                const document = data.documents[0];
                return { latitude: document.y, longitude: document.x };
            } else {
                throw new Error("No coordinates found for address");
            }
        } catch (error) {
            console.error("Error in addressToCoords:", error);
        }
    }

    // 좌표를 주소로 변환하는 함수 (fetch 사용)
    async function coordsToAddress(lat, lng) {
        try {
            const response = await fetch(
                `https://dapi.kakao.com/v2/local/geo/coord2address.json?input_coord=WGS84&x=${lng}&y=${lat}`,
                {
                    headers: {
                        Authorization: 'KakaoAK 72a40f848446b331a895daaba6400196',
                    },
                }
            );

            const data = await response.json();

            if (data.documents.length > 0) {
                const location = data.documents[0];
                const tempAddress = `${location.address.region_1depth_name} ${location.address.region_2depth_name} ${location.address.region_3depth_name}`;
                setAddress(tempAddress);
            } else {
                throw new Error("No address found for coordinates");
            }
        } catch (error) {
            console.error("Error in coordsToAddress:", error);
        }
    }

    // 현재 위치 설정 함수
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocalCoords({ latitude, longitude });
                    setCoords({ latitude, longitude });
                    coordsToAddress(latitude, longitude);
                },
                (error) => {
                    console.error("Error fetching current location:", error.message);
                },
                {
                    enableHighAccuracy: true, // 위치 정확도 향상 (배터리 소모 증가 가능성 있음)
                    timeout: 10000, // 10초 안에 위치 정보를 가져오지 못하면 오류 반환
                    maximumAge: 0 // 캐시된 위치 정보를 사용하지 않음
                }
            );
        } else {
            alert("현재 위치를 찾지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
    };

    // 키워드 검색 핸들러
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            recommendApi();
        }
    };

    // 추천 API 호출 함수 (api 컴포넌트 사용)
    const recommendApi = async () => {
        console.log("keyword: ", keyword);
        console.log("address: ", address);
        console.log("coords: ", localCoords);

        setLoading(true); //로딩 스피너 활성화

        try {
            const response = await api.post(
                '/api/v1/reviews/ai',
                {
                    keyword: keyword,
                    latitude: localCoords.latitude,
                    longitude: localCoords.longitude
                }
            );

            const rankedRestaurants = response.data.data.reviews.map((store) => ({
                storeName: store.storeName,
                address: store.address,
                score: store.score,
                clusteredTerms: store.clusteredTerms.map(term => term.term).join(', ')
            }));

            setStores(rankedRestaurants);

            // 상위 5개는 추천 리스트로, 나머지 5개는 비추천 리스트로 분류
            setRecommendedStores(rankedRestaurants.slice(0, 5));
            setNotRecommendedStores(rankedRestaurants.slice(5, 10));

        } catch (error) {
            // 400 에러 처리
            if (error.response && error.response.status === 400) {
                alert("로그인 후 사용할 수 있습니다.");
                // 로그인이 필요한 경우, 로그인 페이지로 이동을 추가할 수도 있음
                // window.location.href = "/login";
            } else {
                console.error("Error fetching data from API", error);
            }
        } finally {
            setLoading(false); //로딩 스피너 비활성화
        }
    };

    const findButtonClick = () => {
        open({ onComplete: handleAddressSearch });
    };

    const handleAddressSearch = async (data) => {
        let fullAddress = data.address;
        if (data.addressType === 'R') {
            fullAddress += data.bname !== '' ? ` (${data.bname})` : '';
            fullAddress += data.buildingName !== '' ? `, ${data.buildingName}` : '';
        }
        setAddress(fullAddress);

        try {
            const coordsResult = await addressToCoords(fullAddress);
            if (coordsResult) {
                setLocalCoords(coordsResult);
                setCoords(coordsResult);
            }
        } catch (error) {
            console.error("Error in handleAddressSearch:", error);
        }
    };

    return (
        <Grid container spacing={2} sx={{ marginTop: '30px' }}>
            <Grid xs={8}>
                <TextField
                    InputProps={{ readOnly: true }}
                    id="location"
                    value={address}
                    hiddenLabel
                    size="small"
                    variant="outlined"
                    placeholder="주소 검색 버튼을 클릭하여 주소를 설정해주세요."
                    fullWidth
                    required
                />
            </Grid>
            <Grid xs={1}>
                <IconButton onClick={handleCurrentLocation} aria-label="location" size="small">
                    <GpsFixedIcon fontSize="small" />
                </IconButton>
            </Grid>
            <Grid xs={3}>
                <Button variant="contained" color="primary" fullWidth onClick={findButtonClick}>
                    주소 검색
                </Button>
            </Grid>
            <Grid xs={12}>
                <TextField
                    id="outlined-basic"
                    value={keyword}
                    hiddenLabel
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="small"
                    variant="outlined"
                    placeholder="검색할 키워드를 입력해주세요. (ex: 양식)"
                    fullWidth
                />
            </Grid>
            <Grid xs={12}>
                <Button variant="contained" color="primary" fullWidth onClick={recommendApi}>
                    검색
                </Button>
            </Grid>
            {loading && (
                <Grid xs={12}>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <h3>잠시만 기다려주세요.</h3>
                        <SyncLoader />
                    </div>
                </Grid>
            )}
        </Grid>
    );
};
