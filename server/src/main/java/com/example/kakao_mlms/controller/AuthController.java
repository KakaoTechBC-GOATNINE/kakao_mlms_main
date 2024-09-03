package com.example.kakao_mlms.controller;

import com.example.kakao_mlms.annotation.UserId;
import com.example.kakao_mlms.dto.request.UserResisterDto;
import com.example.kakao_mlms.dto.request.UserSignUpDto;
import com.example.kakao_mlms.dto.response.JwtTokenDto;
import com.example.kakao_mlms.exception.ResponseDto;
import com.example.kakao_mlms.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @ApiResponse(responseCode = "200", description = "회원가입 성공", content = @Content)
    @PostMapping("/basic")
    public ResponseDto<?> resisterUser(@RequestBody @Valid UserSignUpDto requestDto) {
        return ResponseDto.ok(authService.resisterUser(requestDto));
    }

    @Operation(summary = "소셜 로그인 사용자 정보 등록", description = "소셜 로그인 사용자의 추가 정보를 등록합니다.")
    @ApiResponse(responseCode = "200", description = "정보 등록 성공", content = @Content)
    @PostMapping("/register")
    public ResponseEntity<Void> resister(
            @Parameter(hidden = true) @UserId Long id,
            @RequestBody UserResisterDto requestDto,
            HttpServletResponse response) {
        authService.registerUserInfo(id, requestDto, response);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "사용자 정보 수정", description = "사용자의 정보를 수정합니다.")
    @ApiResponse(responseCode = "201", description = "정보 수정 성공", content = @Content)
    @PostMapping("/update")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseDto<?> updateUserInfo(
            @Parameter(hidden = true) @UserId Long id,
            @RequestBody UserResisterDto requestDto) {
        return ResponseDto.created(authService.updateUserInfo(id, requestDto));
    }

    @Operation(summary = "Access Token 재발급", description = "Refresh Token을 이용해 새로운 Access Token을 발급받습니다.")
    @ApiResponse(responseCode = "201", description = "토큰 재발급 성공",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = JwtTokenDto.class)))
    @PostMapping("/reissue")
    public ResponseDto<JwtTokenDto> reissue(final HttpServletRequest request, HttpServletResponse response) {
        final String refreshToken = authService.getRefreshToken(request);
        log.info("refreshToken : {}", refreshToken);
        if (refreshToken == null) return null;
        final JwtTokenDto jwtTokenDto = authService.reissue(refreshToken);
        authService.renewSecretCookie(response, jwtTokenDto);
        return ResponseDto.created(jwtTokenDto);
    }

    @Operation(summary = "회원탈퇴", description = "사용자를 탈퇴 처리합니다.")
    @ApiResponse(responseCode = "200", description = "회원 탈퇴 성공", content = @Content)
    @DeleteMapping("/{userId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseDto<?> withdrawUser(
            @Parameter(hidden = true) @UserId Long id,
            @Parameter(description = "탈퇴할 사용자 ID", required = true)
            @PathVariable("userId") Long userId) {
        return ResponseDto.ok(authService.withdrawUser(id, userId));
    }
}
