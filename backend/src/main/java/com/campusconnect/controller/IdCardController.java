package com.campusconnect.controller;

import com.campusconnect.model.User;
import com.campusconnect.service.IdCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/id-card")
public class IdCardController {

    private final IdCardService idCardService;

    public IdCardController(IdCardService idCardService) {
        this.idCardService = idCardService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getIdCardData(@AuthenticationPrincipal User student) {
        if (student == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(idCardService.getIdCardData(student));
    }

    @GetMapping("/verify/{token}")
    public ResponseEntity<Map<String, Object>> verifyToken(@PathVariable("token") String token) {
        return ResponseEntity.ok(idCardService.verifyToken(token));
    }
}
