package com.campusconnect.service;

import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Demo Approval Simulation Engine:
 * Labels: Demo behavior for interactive simulation.
 * Automatically progresses student requests through official administrative approval stages.
 */
@Service
public class SimulationScheduler {

    private static final Logger log = LoggerFactory.getLogger(SimulationScheduler.class);

    private final StudentRequestRepository requestRepository;
    private final RequestCommentRepository commentRepository;
    private final RequestDeptStageRepository deptStageRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @Value("${campusconnect.simulation-enabled:true}")
    private boolean simulationEnabled;

    public SimulationScheduler(
            StudentRequestRepository requestRepository,
            RequestCommentRepository commentRepository,
            RequestDeptStageRepository deptStageRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            FeePaymentRepository feePaymentRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            EmailService emailService,
            ObjectMapper objectMapper) {
        this.requestRepository = requestRepository;
        this.commentRepository = commentRepository;
        this.deptStageRepository = deptStageRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelay = 15000, initialDelay = 5000)
    public void runSimulation() {
        if (!simulationEnabled) {
            return;
        }

        List<StudentRequest> pending = requestRepository.findByStatusIn(List.of("Submitted", "In Review", "Faculty Review", "Admin Review", "Admin Approval"));
        if (pending.isEmpty()) {
            return;
        }

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        for (StudentRequest req : pending) {
            Optional<User> userOpt = userRepository.findById(req.getStudentId());
            String studentEmail = userOpt.map(User::getEmail).orElse("student.demo@campus.test");
            String studentName = userOpt.map(u -> u.getStudentRecord().getName()).orElse("Student");

            if ("Submitted".equalsIgnoreCase(req.getStatus())) {
                req.setStatus("Faculty Review");
                requestRepository.save(req);

                commentRepository.save(new RequestComment(
                        req.getId(),
                        "Faculty",
                        "Department Reviewer",
                        "Documents verified. Forwarded for administrative clearance.",
                        today
                ));

                notificationService.createNotification(
                        req.getStudentId(),
                        "request",
                        "Request Under Faculty Review: " + req.getTitle(),
                        "Your request for " + req.getType() + " has been verified by the department advisor.",
                        "/requests/" + req.getId()
                );

                emailService.sendRequestStatusChangeAlert(
                        studentEmail,
                        studentName,
                        req.getId(),
                        req.getType(),
                        "Faculty Review",
                        "Documents verified. Forwarded for administrative clearance."
                );
                log.info("[Simulation] Request {} moved to Faculty Review", req.getId());

            } else if ("Faculty Review".equalsIgnoreCase(req.getStatus()) || "In Review".equalsIgnoreCase(req.getStatus())) {
                if ("No-dues".equalsIgnoreCase(req.getType())) {
                    List<RequestDeptStage> stages = deptStageRepository.findByRequestIdOrderByIdAsc(req.getId());
                    Optional<RequestDeptStage> nextUncleared = stages.stream().filter(s -> !s.isCleared()).findFirst();

                    if (nextUncleared.isPresent()) {
                        RequestDeptStage stage = nextUncleared.get();
                        if ("Accounts".equalsIgnoreCase(stage.getDepartment())) {
                            // Check fees
                            double paid = feePaymentRepository.findByStudentIdAndSemester(req.getStudentId(), 6).stream()
                                    .filter(p -> "success".equalsIgnoreCase(p.getStatus()))
                                    .mapToDouble(FeePayment::getAmount)
                                    .sum();
                            if (paid < 65000) {
                                stage.setRemarks("Fees due: Pending tuition balance. Settle fees before clearance.");
                                deptStageRepository.save(stage);
                                continue;
                            }
                        }
                        stage.setCleared(true);
                        stage.setClearedAt(today);
                        stage.setRemarks("Cleared by departmental officer.");
                        deptStageRepository.save(stage);

                        // Check if all now cleared
                        boolean allCleared = stages.stream().allMatch(RequestDeptStage::isCleared);
                        if (allCleared) {
                            approveRequest(req, studentEmail, studentName, today);
                        } else {
                            log.info("[Simulation] Stamped department {} for request {}", stage.getDepartment(), req.getId());
                        }
                    } else {
                        approveRequest(req, studentEmail, studentName, today);
                    }
                } else {
                    req.setStatus("Admin Approval");
                    requestRepository.save(req);

                    commentRepository.save(new RequestComment(
                            req.getId(),
                            "Admin",
                            "Registrar / Dean Office",
                            "Departmental endorsement received. Final authorization pending.",
                            today
                    ));

                    notificationService.createNotification(
                            req.getStudentId(),
                            "request",
                            "Request Under Admin Approval: " + req.getTitle(),
                            "Your request is undergoing final administrative approval.",
                            "/requests/" + req.getId()
                    );
                    log.info("[Simulation] Request {} moved to Admin Approval", req.getId());
                }

            } else if ("Admin Review".equalsIgnoreCase(req.getStatus()) || "Admin Approval".equalsIgnoreCase(req.getStatus())) {
                approveRequest(req, studentEmail, studentName, today);
            }
        }
    }

    private void approveRequest(StudentRequest req, String studentEmail, String studentName, String today) {
        req.setStatus("Approved");
        requestRepository.save(req);

        commentRepository.save(new RequestComment(
                req.getId(),
                "System",
                "Clearance Engine",
                "Official sanction granted. Digital approval certificate generated with cryptographic verification token.",
                today
        ));

        // If OD letter: automatically credit student attendance!
        if ("OD letter".equalsIgnoreCase(req.getType())) {
            creditOdAttendance(req);
        }

        notificationService.createNotification(
                req.getStudentId(),
                "request",
                req.getType() + " Approved!",
                "Your " + req.getType() + " application has been officially approved. You can now download the signed document.",
                "/requests/" + req.getId()
        );

        emailService.sendRequestStatusChangeAlert(
                studentEmail,
                studentName,
                req.getId(),
                req.getType(),
                "Approved",
                "Official sanction granted. Digital approval certificate generated with cryptographic verification token."
        );

        log.info("[Simulation] Request {} APPROVED successfully", req.getId());
    }

    private void creditOdAttendance(StudentRequest req) {
        try {
            if (req.getDetailsJson() != null && !req.getDetailsJson().isBlank()) {
                Map<String, Object> details = objectMapper.readValue(req.getDetailsJson(), new TypeReference<Map<String, Object>>() {});
                Object subjectsObj = details.get("affectedSubjectIds");
                if (subjectsObj instanceof List<?> subList) {
                    for (Object item : subList) {
                        String subId = item.toString();
                        // Find recent attendance and set to 'od'
                        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentIdAndSubjectId(req.getStudentId(), subId);
                        records.stream()
                                .filter(r -> !"od".equalsIgnoreCase(r.getStatus()))
                                .findFirst()
                                .ifPresent(r -> {
                                    r.setStatus("od");
                                    attendanceRecordRepository.save(r);
                                    log.info("[Simulation] Credited OD attendance for subject {}", subId);
                                });
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error auto-crediting OD attendance: {}", e.getMessage());
        }
    }
}
