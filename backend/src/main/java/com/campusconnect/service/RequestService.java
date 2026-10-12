package com.campusconnect.service;

import com.campusconnect.dto.CreateRequestInput;
import com.campusconnect.dto.RequestItemDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class RequestService {

    private final StudentRequestRepository requestRepository;
    private final RequestCommentRepository commentRepository;
    private final RequestDeptStageRepository deptStageRepository;
    private final NotificationService notificationService;
    private final PdfDocumentService pdfDocumentService;
    private final ObjectMapper objectMapper;

    public RequestService(
            StudentRequestRepository requestRepository,
            RequestCommentRepository commentRepository,
            RequestDeptStageRepository deptStageRepository,
            NotificationService notificationService,
            PdfDocumentService pdfDocumentService,
            ObjectMapper objectMapper) {
        this.requestRepository = requestRepository;
        this.commentRepository = commentRepository;
        this.deptStageRepository = deptStageRepository;
        this.notificationService = notificationService;
        this.pdfDocumentService = pdfDocumentService;
        this.objectMapper = objectMapper;
    }

    public List<RequestItemDto> getRequests(String studentId) {
        List<StudentRequest> requests = requestRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        return requests.stream().map(this::toDto).toList();
    }

    public Optional<RequestItemDto> getRequestById(String id, String studentId) {
        return requestRepository.findByIdAndStudentId(id, studentId).map(this::toDto);
    }

    public RequestItemDto createRequest(String studentId, CreateRequestInput input, StudentRecord studentRecord) {
        String id = "REQ-" + (int)(1000 + Math.random() * 9000);
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String verificationToken = "v_token_" + System.currentTimeMillis() + "_signed_cc";

        String detailsJson = null;
        try {
            if (input.getDetails() != null) {
                detailsJson = objectMapper.writeValueAsString(input.getDetails());
            }
        } catch (Exception ignored) {}

        StudentRequest request = new StudentRequest(
                id,
                studentId,
                input.getType(),
                input.getTitle(),
                "Submitted",
                today,
                detailsJson,
                verificationToken,
                0
        );
        requestRepository.save(request);

        // Initial comment
        RequestComment initialComment = new RequestComment(
                id,
                "Student",
                studentRecord.getName(),
                "Application submitted for " + input.getType() + ".",
                today
        );
        commentRepository.save(initialComment);

        // If No-dues, initialize department stages
        if ("No-dues".equalsIgnoreCase(input.getType())) {
            deptStageRepository.saveAll(List.of(
                    new RequestDeptStage(id, "Library", false, null, null),
                    new RequestDeptStage(id, "Hostel", false, null, null),
                    new RequestDeptStage(id, "Accounts", false, null, null),
                    new RequestDeptStage(id, "Labs", false, null, null)
            ));
        }

        // Notification
        notificationService.createNotification(
                studentId,
                "request",
                "Request Submitted: " + input.getTitle(),
                "Your request for " + input.getType() + " has been successfully submitted.",
                "/requests/" + id
        );

        return toDto(request);
    }

    public byte[] generateDocument(String id, String studentId, StudentRecord studentRecord) {
        StudentRequest request = requestRepository.findByIdAndStudentId(id, studentId)
                .orElseThrow(() -> new NoSuchElementException("Request not found"));

        if (!"Approved".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalStateException("Official clearance document is available only for approved requests.");
        }

        return pdfDocumentService.generateApprovedRequestPdf(request, studentRecord);
    }

    public RequestItemDto toDto(StudentRequest request) {
        RequestItemDto dto = new RequestItemDto();
        dto.setId(request.getId());
        dto.setType(request.getType());
        dto.setTitle(request.getTitle());
        dto.setStatus(request.getStatus());
        dto.setSubmittedDate(request.getSubmittedDate());
        dto.setVerificationToken(request.getVerificationToken());
        dto.setOdDaysCredited(request.getOdDaysCredited());

        // Parse details
        if (request.getDetailsJson() != null && !request.getDetailsJson().isBlank()) {
            try {
                Map<String, Object> details = objectMapper.readValue(request.getDetailsJson(), new TypeReference<Map<String, Object>>() {});
                dto.setDetails(details);
            } catch (Exception e) {
                dto.setDetails(Map.of());
            }
        } else {
            dto.setDetails(Map.of());
        }

        // Comments
        List<RequestComment> comments = commentRepository.findByRequestIdOrderByIdAsc(request.getId());
        dto.setComments(comments.stream().map(c -> new RequestItemDto.RequestCommentDto(
                c.getRole(),
                c.getAuthor(),
                c.getComment(),
                c.getDate()
        )).toList());

        // Department stages
        List<RequestDeptStage> stages = deptStageRepository.findByRequestIdOrderByIdAsc(request.getId());
        if (!stages.isEmpty()) {
            dto.setDepartmentStages(stages.stream().map(s -> new RequestItemDto.DepartmentClearanceDto(
                    s.getDepartment(),
                    s.isCleared(),
                    s.getClearedAt(),
                    s.getRemarks()
            )).toList());
        }

        return dto;
    }
}
