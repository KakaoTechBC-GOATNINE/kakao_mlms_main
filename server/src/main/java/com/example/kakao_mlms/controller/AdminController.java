package com.example.kakao_mlms.controller;

import com.example.kakao_mlms.annotation.UserId;
import com.example.kakao_mlms.domain.type.Category;
import com.example.kakao_mlms.dto.response.AdminUserInfoDto;
import com.example.kakao_mlms.dto.response.QnaDtoResponse;
import com.example.kakao_mlms.dto.response.QnaDtoWithImagesResponse;
import com.example.kakao_mlms.exception.ResponseDto;
import com.example.kakao_mlms.service.AnswerService;
import com.example.kakao_mlms.service.QnaService;
import com.example.kakao_mlms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "관리자 API")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserService userService;
    private final QnaService qnaService;
    private final AnswerService answerService;

    @Operation(summary = "모든 사용자 조회", description = "모든 사용자의 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "사용자 목록 조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Page.class))),
    })
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserInfoDto>> getAllUsers(
            @Parameter(description = "검색할 사용자 이름", required = false)
            @RequestParam(required = false, name = "name") String name,
            @Parameter(description = "페이징 정보", required = false)
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AdminUserInfoDto> adminUserInfos = userService.searchUsers(name, pageable).map(AdminUserInfoDto::from);
        return ResponseEntity.ok(adminUserInfos);
    }

    @Operation(summary = "모든 QnA 조회", description = "모든 QnA를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "QnA 목록 조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Page.class))),
    })
    @GetMapping("/qnas")
    public ResponseEntity<Page<QnaDtoResponse>> getAllQnas(
            @Parameter(description = "응답되지 않은 QnA만 필터링 여부", required = false)
            @RequestParam(required = false, name = "notAnswered") Boolean notAnswered,
            @Parameter(description = "검색할 QnA 제목", required = false)
            @RequestParam(required = false, name = "title") String title,
            @Parameter(description = "QnA의 카테고리", required = false)
            @RequestParam(required = false, name = "category") Category category,
            @Parameter(description = "페이징 정보", required = false)
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("notAnswered = {}, title = {}, category = {}, pageable = {}", notAnswered, title, category, pageable);
        Page<QnaDtoResponse> qnaResponse = qnaService.searchQnas(title, category, notAnswered, pageable)
                .map(QnaDtoResponse::from);
        return ResponseEntity.ok(qnaResponse);
    }

    @Operation(summary = "특정 QnA 조회", description = "특정 QnA를 ID로 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "QnA 조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = QnaDtoWithImagesResponse.class))),
    })
    @GetMapping("/qnas/{qnaId}")
    public ResponseEntity<?> getQna(
            @Parameter(hidden = true) @UserId Long id,
            @Parameter(description = "QnA ID", required = true)
            @PathVariable("qnaId") Long qnaId) {
        QnaDtoWithImagesResponse qnaWithImagesResponse =
                QnaDtoWithImagesResponse.from(qnaService.getQnaWithImages(qnaId), answerService.getAnswer(qnaId), id);
        return ResponseEntity.ok(qnaWithImagesResponse);
    }

    @Operation(summary = "QnA에 답변 추가", description = "특정 QnA에 답변을 추가합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "답변 추가 성공"),
    })
    @PostMapping("/qnas/{qnaId}")
    public ResponseEntity<Long> replyQna(
            @Parameter(description = "QnA ID", required = true)
            @PathVariable("qnaId") Long id,
            @Parameter(description = "답변 내용", required = true)
            @RequestBody String content,
            @Parameter(hidden = true) @UserId Long userId) {
        answerService.replyQna(userId, id, content);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @Operation(summary = "QnA 삭제", description = "특정 QnA를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "QnA 삭제 성공"),
    })
    @DeleteMapping("/qnas/{qnaId}")
    public ResponseDto<?> deleteQna(
            @Parameter(hidden = true) @UserId Long id,
            @Parameter(description = "QnA ID", required = true)
            @PathVariable("qnaId") Long qnaId) {
        return ResponseDto.ok(qnaService.deleteQna(id, qnaId));
    }

    @Operation(summary = "Q&A 답변 삭제", description = "Q&A 답변을 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Q&A 답변 삭제 성공"),
    })
    @DeleteMapping("/qnas/answer/{qnaId}")
    public ResponseDto<?> deleteQnaAnswer(
            @Parameter(hidden = true) @UserId Long id,
            @Parameter(description = "QnA ID", required = true)
            @PathVariable("qnaId") Long qnaId) {

        return ResponseDto.ok(answerService.deleteAnswer(id, qnaId));
    }

}
