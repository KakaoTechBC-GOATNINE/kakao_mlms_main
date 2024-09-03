package com.example.kakao_mlms.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserPasswordDto(
        @JsonProperty("oldPassword")
        String oldPassword,
        @JsonProperty("newPassword")
        String newPassword
) { }
