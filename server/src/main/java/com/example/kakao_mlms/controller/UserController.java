package com.example.kakao_mlms.controller;

import com.example.kakao_mlms.annotation.UserId;
import com.example.kakao_mlms.domain.User;
import com.example.kakao_mlms.dto.response.UserInfoDto;
import com.example.kakao_mlms.exception.ResponseDto;
import com.example.kakao_mlms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private final UserService userService;

    @Operation(summary = "유저 정보 불러오기", description = "현재 로그인한 유저의 정보를 불러옵니다.")
    @ApiResponse(responseCode = "200", description = "유저 정보 성공적으로 반환됨", content = @io.swagger.v3.oas.annotations.media.Content)
    @GetMapping("")
    public ResponseDto<UserInfoDto> getUserInfo(
            @Parameter(hidden = true) @UserId Long id) {
        final User user = userService.getUserInfo(id);
        final UserInfoDto userInfoDto = UserInfoDto.EntityToDto(user);

        return ResponseDto.ok(userInfoDto);
    }
}
