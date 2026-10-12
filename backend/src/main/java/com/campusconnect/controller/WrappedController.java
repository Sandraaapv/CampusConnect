package com.campusconnect.controller;

import com.campusconnect.dto.WrappedDto;
import com.campusconnect.model.User;
import com.campusconnect.service.WrappedService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class WrappedController {

    private final WrappedService wrappedService;

    public WrappedController(WrappedService wrappedService) {
        this.wrappedService = wrappedService;
    }

    @GetMapping("/wrapped")
    public ResponseEntity<WrappedDto> getWrapped(@AuthenticationPrincipal User student) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(wrappedService.getWrapped(student));
    }
}
