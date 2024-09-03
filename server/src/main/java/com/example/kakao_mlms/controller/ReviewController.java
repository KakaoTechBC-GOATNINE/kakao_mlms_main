package com.example.kakao_mlms.controller;

import com.example.kakao_mlms.annotation.UserId;
import com.example.kakao_mlms.dto.request.ReviewDto;
import com.example.kakao_mlms.exception.ResponseDto;
import com.example.kakao_mlms.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ReviewController {
    private final ReviewService reviewService;

    @Operation(summary = "AI 리뷰 결과 가져오기", description = "사용자 ID와 함께 AI 리뷰 결과를 가져옵니다.")
    @ApiResponse(responseCode = "200", description = "리뷰 결과 성공적으로 반환됨", content = @io.swagger.v3.oas.annotations.media.Content)
    @PostMapping("/ai")
    public ResponseDto<?> getReviewResult(
            @Parameter(hidden = true) @UserId Long id,
            @RequestBody ReviewDto requestDto) {
        return ResponseDto.ok(reviewService.getReviewResult(id, requestDto));
    }
}
