package com.campusconnect.controller;

import com.campusconnect.dto.CreateRequestInput;
import com.campusconnect.dto.RequestItemDto;
import com.campusconnect.model.User;
import com.campusconnect.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requests")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<List<RequestItemDto>> getRequests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(requestService.getRequests(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestItemDto> getRequestById(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        return requestService.getRequestById(id, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RequestItemDto> createRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateRequestInput input) {
        RequestItemDto created = requestService.createRequest(user.getId(), input, user.getStudentRecord());
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<byte[]> getRequestDocument(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        byte[] pdfBytes = requestService.generateDocument(id, user.getId(), user.getStudentRecord());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"Approval_" + id + ".pdf\"")
                .body(pdfBytes);
    }
}
