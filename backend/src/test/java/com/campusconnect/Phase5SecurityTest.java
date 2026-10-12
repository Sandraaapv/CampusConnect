package com.campusconnect;

import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.security.RateLimitingFilter;
import com.campusconnect.service.RateLimiterService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import java.util.Map;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class Phase5SecurityTest {

    @Test
    @DisplayName("RateLimitingFilter: Blocks excessive requests to /auth/* with HTTP 429")
    void testAuthRateLimiterFilter() throws Exception {
        RateLimiterService rateLimiterService = new RateLimiterService();
        RateLimitingFilter filter = new RateLimitingFilter(rateLimiterService);
        FilterChain filterChain = mock(FilterChain.class);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/auth/login");
        request.setRemoteAddr("192.168.1.100");

        // The limit is 60 requests per minute
        for (int i = 0; i < 60; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, filterChain);
            assertEquals(200, response.getStatus()); // default mock status when chain continues
        }

        // 61st request should be rate limited to 429
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        filter.doFilter(request, blockedResponse, filterChain);
        assertEquals(429, blockedResponse.getStatus());
        assertTrue(blockedResponse.getContentAsString().contains("Too Many Requests"));
    }

    @Test
    @DisplayName("GlobalExceptionHandler: Returns uniform error responses without stack traces")
    void testGlobalExceptionHandler() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        // 404 Not Found
        ResponseEntity<Map<String, Object>> notFound = handler.handleNoSuchElement(new NoSuchElementException("Request item not found"));
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatusCode());
        assertEquals(404, notFound.getBody().get("status"));
        assertEquals("Request item not found", notFound.getBody().get("message"));

        // 403 Forbidden
        ResponseEntity<Map<String, Object>> forbidden = handler.handleAccessDenied(new AccessDeniedException("Forbidden"));
        assertEquals(HttpStatus.FORBIDDEN, forbidden.getStatusCode());
        assertEquals(403, forbidden.getBody().get("status"));

        // 400 Bad Request
        ResponseEntity<Map<String, Object>> badRequest = handler.handleIllegalState(new IllegalStateException("Invalid state"));
        assertEquals(HttpStatus.BAD_REQUEST, badRequest.getStatusCode());
        assertEquals(400, badRequest.getBody().get("status"));

        // 500 Internal Server Error hides stack traces
        ResponseEntity<Map<String, Object>> generic = handler.handleGenericException(new RuntimeException("Sensitive database credentials leaking exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, generic.getStatusCode());
        assertEquals(500, generic.getBody().get("status"));
        assertFalse(generic.getBody().get("message").toString().contains("credentials leaking"));
        assertEquals("An unexpected error occurred. Please try again later.", generic.getBody().get("message"));
    }
}
