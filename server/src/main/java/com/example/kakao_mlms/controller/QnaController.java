package com.example.kakao_mlms.controller;

import com.example.kakao_mlms.annotation.UserId;
import com.example.kakao_mlms.domain.User;
import com.example.kakao_mlms.domain.type.Category;
import com.example.kakao_mlms.dto.ImageDto;
import com.example.kakao_mlms.dto.QnaDto;
import com.example.kakao_mlms.dto.UserDto;
import com.example.kakao_mlms.dto.request.QnaRequestDto;
import com.example.kakao_mlms.dto.response.QnaDtoResponse;
import com.example.kakao_mlms.dto.response.QnaDtoWithImagesResponse;
import com.example.kakao_mlms.exception.ResponseDto;
import com.example.kakao_mlms.service.AnswerService;
import com.example.kakao_mlms.service.ImageService;
import com.example.kakao_mlms.service.QnaService;
import com.example.kakao_mlms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/qnas")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class QnaController {

    private final UserService userService;
    private final QnaService qnaService;
    private final ImageService imageService;
    private final AnswerService answerService;

    @Operation(summary = "QnA 작성", description = "새로운 QnA를 작성합니다.")
    @ApiResponse(responseCode = "201", description = "QnA 작성 성공", content = @Content)
    @PostMapping
    public ResponseEntity<Void> createQna(
            @Parameter(hidden = true) @UserId Long id,
            @RequestPart("qnaRequestDto") QnaRequestDto qnaRequestDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        User user = userService.getUserInfo(id);
        List<ImageDto> imageDtos = imageService.uploadFiles(images);
        qnaService.createQna(qnaRequestDto.toDto(UserDto.from(user)), imageDtos);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "QnA 목록 조회", description = "사용자 ID를 기반으로 QnA 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "QnA 목록 조회 성공",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = Page.class)))
    @GetMapping
    public ResponseEntity<Page<QnaDtoResponse>> getQnaList(
            @Parameter(hidden = true) @UserId Long id,
            @RequestParam(value = "mine", defaultValue = "false") Boolean mine,
            @RequestParam(required = false, value = "title") String title,
            @RequestParam(required = false, value = "category") Category category,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("id = {}, title = {}, category = {}, pageable = {}", id, title, category, pageable);
        Page<QnaDtoResponse> qnaResponse = qnaService.searchQnasByUser(title, id, category, mine, pageable)
                .map(QnaDtoResponse::from);
        return ResponseEntity.ok(qnaResponse);
    }

    @Operation(summary = "특정 QnA 조회", description = "특정 QnA를 ID로 조회합니다.")
    @ApiResponse(responseCode = "200", description = "QnA 조회 성공",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = QnaDtoWithImagesResponse.class)))
    @GetMapping("/{qnaId}")
    public ResponseEntity<?> getQna(
            @Parameter(hidden = true) @UserId Long id,
            @Parameter(description = "QnA ID", required = true)
            @PathVariable("qnaId") Long qnaId) {
        QnaDtoWithImagesResponse qnaWithImagesResponse =
                QnaDtoWithImagesResponse.from(qnaService.getQnaWithImages(qnaId), answerService.getAnswer(qnaId), id);
        if (qnaWithImagesResponse.isBlind() && qnaWithImagesResponse.user().id().longValue() != id.longValue()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(qnaWithImagesResponse);
    }

    @Operation(summary = "이미지 다운로드", description = "저장된 이미지를 다운로드합니다.")
    @ApiResponse(responseCode = "200", description = "이미지 다운로드 성공",
            content = @Content(mediaType = "application/octet-stream"))
    @GetMapping("/image/{filename}")
    public Resource downloadImage(
            @Parameter(description = "파일명", required = true)
            @PathVariable("filename") String storeFilename) throws MalformedURLException {
        log.info("storeFilename = {}", storeFilename);
        return imageService.downloadImage(storeFilename);
    }

    @Operation(summary = "QnA 수정", description = "특정 QnA를 수정합니다.")
    @ApiResponse(responseCode = "200", description = "QnA 수정 성공", content = @Content)
    @PutMapping("/{qnaId}")
    public ResponseEntity<Long> updateQna(
            @Parameter(hidden = true) @UserId Long id,
            @Parameter(description = "QnA ID", required = true)
            @PathVariable("qnaId") Long qnaId,
            @RequestPart("qnaRequestDto") QnaRequestDto qnaRequestDto,
            @RequestPart(required = false, value = "images") List<MultipartFile> images) {
        User user = userService.getUserInfo(id);
        List<ImageDto> imageDtos = imageService.uploadFiles(images);
        QnaDto qnaDto = qnaRequestDto.toDto(UserDto.from(user), qnaId);
        qnaService.updateQna(id, qnaDto, imageDtos);
        return ResponseEntity.ok().body(qnaId);
    }

    @Operation(summary = "QnA 삭제", description = "특정 QnA를 삭제합니다.")
    @ApiResponse(responseCode = "200", description = "QnA 삭제 성공", content = @Content)
    @DeleteMapping("/{qnaId}")
    public ResponseDto<?> deleteQna(
            @Parameter(hidden = true) @UserId Long id,
            @Parameter(description = "QnA ID", required = true)
            @PathVariable("qnaId") Long qnaId) {
        return ResponseDto.ok(qnaService.deleteQna(id, qnaId));
    }
}
