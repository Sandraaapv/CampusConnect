package com.campusconnect.security;

import com.campusconnect.service.RateLimiterService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;

    // 60 requests per minute per IP for /auth/**
    private static final int MAX_AUTH_REQUESTS_PER_MINUTE = 60;
    private static final int WINDOW_SECONDS = 60;

    public RateLimitingFilter(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();

        // Rate limit authentication routes
        if (uri != null && uri.startsWith("/auth/")) {
            String ip = extractClientIp(request);
            String bucketKey = "auth_ip_bucket:" + (ip != null ? ip : "unknown");

            if (!rateLimiterService.isAllowed(bucketKey, MAX_AUTH_REQUESTS_PER_MINUTE, WINDOW_SECONDS)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many requests to authentication service. Please slow down.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
