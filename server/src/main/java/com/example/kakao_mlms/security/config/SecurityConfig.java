package com.example.kakao_mlms.security.config;

import com.example.kakao_mlms.constant.Constants;
import com.example.kakao_mlms.domain.type.ERole;
import com.example.kakao_mlms.security.BasicAuthenticationProvider;
import com.example.kakao_mlms.security.CustomAuthenticationProvider;
import com.example.kakao_mlms.security.JwtAuthEntryPoint;
import com.example.kakao_mlms.security.filter.JwtExceptionFilter;
import com.example.kakao_mlms.security.filter.JwtFilter;
import com.example.kakao_mlms.security.handler.JwtAccessDeniedHandler;
import com.example.kakao_mlms.security.handler.signin.DefaultSignInFailureHandler;
import com.example.kakao_mlms.security.handler.signin.DefaultSignInSuccessHandler;
import com.example.kakao_mlms.security.handler.signin.OAuth2LoginFailureHandler;
import com.example.kakao_mlms.security.handler.signin.OAuth2LoginSuccessHandler;
import com.example.kakao_mlms.security.handler.signout.CustomSignOutProcessHandler;
import com.example.kakao_mlms.security.handler.signout.CustomSignOutResultHandler;
import com.example.kakao_mlms.security.service.CustomOAuth2UserService;
import com.example.kakao_mlms.security.service.CustomUserDetailService;
import com.example.kakao_mlms.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final DefaultSignInSuccessHandler defaultSignInSuccessHandler;
    private final DefaultSignInFailureHandler defaultSignInFailureHandler;
    private final CustomUserDetailService customUserDetailService;
    private final BasicAuthenticationProvider basicAuthenticationProvider;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final JwtUtil jwtUtil;
    private final CustomSignOutProcessHandler customSignOutProcessHandler;
    private final CustomSignOutResultHandler customSignOutResultHandler;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomAuthenticationProvider customAuthenticationProvider;


    @Bean
    protected SecurityFilterChain securityFilterChain(final HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                // .cors(httpSecurityCorsConfigurer ->
                //         httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable) //보호 비활성화
                .httpBasic(AbstractHttpConfigurer::disable) // 기본 HTTP 기본 인증 비활성화
                .sessionManagement((sessionManagement) -> //상태를 유지하지 않는 세션 정책 설정
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(requestMatcherRegistry -> requestMatcherRegistry
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                        .requestMatchers(Constants.NO_NEED_AUTH_URLS).permitAll()
                        .requestMatchers("/api/v1/admins/**").hasRole(ERole.ADMIN.name())
                        .anyRequest().authenticated())
                //폼 기반 로그인 설정
                .formLogin(configurer ->
                        configurer
                                .loginPage("/login")
                                .loginProcessingUrl("/api/v1/sign-in") //로그인 처리 URL (POST)
                                .usernameParameter("serialId") //사용자 아이디 파라미터 이름
                                .passwordParameter("password") //비밀번호 파라미터 이름
                                .successHandler(defaultSignInSuccessHandler) //로그인 성공 핸들러
                                .failureHandler(defaultSignInFailureHandler) // 로그인 실패 핸들러
                )//.userDetailsService(customUserDetailService) //사용자 검색할 서비스 설정
                //소셜 로그인
                .oauth2Login(configurer ->
                        configurer
                                .successHandler(oAuth2LoginSuccessHandler)
                                .failureHandler(oAuth2LoginFailureHandler)
                                .userInfoEndpoint(userInfoEndpoint ->
                                        userInfoEndpoint.userService(customOAuth2UserService)
                                )
                )
                // 로그아웃 설정
                .logout(configurer ->
                        configurer
                                .logoutUrl("/api/v1/logout")
                                .addLogoutHandler(customSignOutProcessHandler)
                                .logoutSuccessHandler(customSignOutResultHandler)
                                .deleteCookies("JSESSIONID", "nickname", "accessToken", "refreshToken", "role") // 쿠키 삭제 설정
                )

                //예외 처리 설정
                .exceptionHandling(configurer ->
                        configurer
                                .authenticationEntryPoint(jwtAuthEntryPoint)
                                .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                .addFilterBefore(new JwtFilter(jwtUtil, customAuthenticationProvider), LogoutFilter.class)
                .addFilterBefore(new JwtExceptionFilter(), JwtFilter.class)

                //SecurityFilterChain 빈을 반환
                .getOrBuild();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> {
            web.ignoring().requestMatchers("/swagger-ui/**", "/v3/api-docs/**");
        };
    }

//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {
//         CorsConfiguration configuration = new CorsConfiguration();
//         configuration.setAllowedOrigins(List.of("http://localhost:3000"));  // 허용할 출처 설정
//         configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));  // 허용할 메서드 설정
//         configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));  // 허용할 헤더 설정
//         configuration.setAllowCredentials(true);  // 쿠키 등 자격 증명 허용

//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", configuration);  // 모든 경로에 대해 CORS 설정 적용
//         return source;
//     }
}
