package com.campusconnect;

import com.campusconnect.dto.FacultyDto;
import com.campusconnect.dto.FeeStatusSummaryDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import com.campusconnect.service.FacultyService;
import com.campusconnect.service.FeeService;
import com.campusconnect.service.FeedbackService;
import com.campusconnect.service.HelpdeskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class Phase4ServicesTest {

    @Test
    @DisplayName("FeeService: Server computes balance, stores last 4 card digits only, and verifies idempotency")
    void testFeeService() {
        FeeStructureRepository structureRepo = mock(FeeStructureRepository.class);
        FeePaymentRepository paymentRepo = mock(FeePaymentRepository.class);
        FeeReceiptRepository receiptRepo = mock(FeeReceiptRepository.class);
        UserRepository userRepo = mock(UserRepository.class);
        StudentRequestRepository requestRepo = mock(StudentRequestRepository.class);
        RequestDeptStageRepository deptStageRepo = mock(RequestDeptStageRepository.class);

        FeeService feeService = new FeeService(
                structureRepo, paymentRepo, receiptRepo, userRepo, requestRepo, deptStageRepo
        );

        when(structureRepo.findBySemester(6)).thenReturn(List.of(
                new FeeStructure("fs-1", 6, "Tuition", 75000.0),
                new FeeStructure("fs-2", 6, "Lab & Composite", 25000.0)
        ));

        // Case 1: Partial payment exists -> calculates balance
        FeePayment existingPayment = new FeePayment("pay-old", "student-1", 6, 40000.0, "Online", "REF-1", "2026-08-01", "success", "Term 1", "1234");
        when(paymentRepo.findByStudentIdAndSemester("student-1", 6)).thenReturn(List.of(existingPayment));

        FeeStatusSummaryDto summary = feeService.getFeeStatusSummary("student-1", 6);
        assertEquals(100000.0, total(summary.getTotalFee()));
        assertEquals(40000.0, total(summary.getPaid()));
        assertEquals(60000.0, total(summary.getBalanceDue()));
        assertEquals("due", summary.getStatus());

        // Case 2: Paying the remaining balance
        StudentRecord sr = new StudentRecord("21CS042", "student.demo@campus.test", "Student Demo", "CSE", 6);
        when(userRepo.findById("student-1")).thenReturn(Optional.of(
                new User("student-1", sr, "student.demo@campus.test", "hash")
        ));
        when(requestRepo.findByStudentIdOrderByCreatedAtDesc("student-1")).thenReturn(List.of());

        Map<String, Object> payResult = feeService.payFees(
                "student-1", 6, "Credit Card", "IDEMP-KEY-999", "4111 2222 3333 4567"
        );
        assertTrue((Boolean) payResult.get("success"));

        ArgumentCaptor<FeePayment> paymentCaptor = ArgumentCaptor.forClass(FeePayment.class);
        verify(paymentRepo).save(paymentCaptor.capture());
        FeePayment savedPayment = paymentCaptor.getValue();

        assertEquals(60000.0, savedPayment.getAmount()); // Server computed outstanding balance!
        assertEquals("4567", savedPayment.getLast4()); // Only last 4 digits stored!
        assertEquals("IDEMP-KEY-999", savedPayment.getReference());

        // Case 3: Idempotency check with existing key
        when(paymentRepo.findByStudentId("student-1")).thenReturn(List.of(savedPayment));
        when(receiptRepo.findByPaymentId(savedPayment.getId())).thenReturn(Optional.of(
                new FeeReceipt("rec-1", savedPayment.getId(), "CC/REC/1", "token-1", "CampusConnect", "Student Demo", "21CS042", "CSE", 6, 60000.0, "Today", "Credit Card", "IDEMP-KEY-999", "Notes")
        ));

        Map<String, Object> idempResult = feeService.payFees(
                "student-1", 6, "Credit Card", "IDEMP-KEY-999", "4111 2222 3333 4567"
        );
        assertTrue((Boolean) idempResult.get("success"));
        assertTrue((Boolean) idempResult.get("idempotent"));
    }

    private double total(double d) {
        return d;
    }

    @Test
    @DisplayName("FeedbackService: Anonymized response storage and duplicate submission prevention")
    void testFeedbackService() {
        FeedbackFormRepository formRepo = mock(FeedbackFormRepository.class);
        FeedbackQuestionRepository questionRepo = mock(FeedbackQuestionRepository.class);
        FeedbackSubmissionRepository submissionRepo = mock(FeedbackSubmissionRepository.class);
        FeedbackResponseRepository responseRepo = mock(FeedbackResponseRepository.class);

        FeedbackService feedbackService = new FeedbackService(
                formRepo, questionRepo, submissionRepo, responseRepo
        );

        when(submissionRepo.findByStudentId("student-1")).thenReturn(List.of());

        Map<String, Integer> ratings = Map.of("q1", 5, "q2", 4);
        Map<String, Object> res1 = feedbackService.submitFeedback("student-1", "form-101", ratings, "Excellent professor!");

        assertTrue((Boolean) res1.get("success"));

        ArgumentCaptor<FeedbackResponse> responseCaptor = ArgumentCaptor.forClass(FeedbackResponse.class);
        verify(responseRepo).save(responseCaptor.capture());
        FeedbackResponse savedResponse = responseCaptor.getValue();

        assertEquals("form-101", savedResponse.getFormId());
        assertEquals("Excellent professor!", savedResponse.getComment());
        assertTrue(savedResponse.getAnswersJson().contains("\"q1\":5"));

        // Check duplicate submission prevention
        when(submissionRepo.findByStudentId("student-1")).thenReturn(List.of(
                new FeedbackSubmission("sub-1", "student-1", "form-101", "2026-10-12")
        ));

        Map<String, Object> resDuplicate = feedbackService.submitFeedback("student-1", "form-101", ratings, "Duplicate attempt");
        assertFalse((Boolean) resDuplicate.get("success"));
        assertTrue(((String) resDuplicate.get("error")).contains("Duplicate submission rejected"));
    }

    @Test
    @DisplayName("HelpdeskService: Daily rate limit and department auto-assignment")
    void testHelpdeskService() {
        HelpdeskTicketRepository ticketRepo = mock(HelpdeskTicketRepository.class);
        HelpdeskCommentRepository commentRepo = mock(HelpdeskCommentRepository.class);
        UserRepository userRepo = mock(UserRepository.class);

        HelpdeskService helpdeskService = new HelpdeskService(ticketRepo, commentRepo, userRepo);

        when(ticketRepo.findByStudentIdOrderByCreatedAtDesc("student-1")).thenReturn(List.of());
        when(ticketRepo.save(any(HelpdeskTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        // Test auto-assignment for Wi-Fi issue
        Map<String, Object> wifiTicketRes = helpdeskService.createTicket(
                "student-1", "Wi-Fi / Network", "High", "No connection in Block B", "Hostel 3 router offline", "Hostel Block B"
        );
        assertTrue((Boolean) wifiTicketRes.get("success"));
        HelpdeskTicket ticket = (HelpdeskTicket) wifiTicketRes.get("ticket");
        assertEquals("Campus IT & Network Operations", ticket.getAssignedDepartment());
        assertEquals("Open", ticket.getStatus());

        // Test rate limit: already 5 tickets today
        String today = java.time.LocalDate.now().toString();
        List<HelpdeskTicket> todayTickets = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            HelpdeskTicket t = new HelpdeskTicket("t-" + i, "HD-" + i, "student-1", "General", "Low", "Issue " + i, "Desc", "Loc", "Open", "Dept", null, today + "T10:00:00Z", today + "T10:00:00Z");
            todayTickets.add(t);
        }
        when(ticketRepo.findByStudentIdOrderByCreatedAtDesc("student-1")).thenReturn(todayTickets);

        Map<String, Object> rateLimitRes = helpdeskService.createTicket(
                "student-1", "Library", "Low", "6th ticket", "Exceeds daily limit", "Library"
        );
        assertFalse((Boolean) rateLimitRes.get("success"));
        assertTrue(((String) rateLimitRes.get("error")).contains("Daily limit reached"));
    }

    @Test
    @DisplayName("FacultyService: Retrieval and enrolled student faculty mapping")
    void testFacultyService() {
        FacultyRepository facultyRepo = mock(FacultyRepository.class);
        FacultySubjectRepository facultySubjectRepo = mock(FacultySubjectRepository.class);
        FacultyOfficeHourRepository officeHourRepo = mock(FacultyOfficeHourRepository.class);
        SubjectRepository subjectRepo = mock(SubjectRepository.class);

        FacultyService facultyService = new FacultyService(facultyRepo, facultySubjectRepo, officeHourRepo, subjectRepo);

        Faculty f1 = new Faculty("fac-1", "Dr. Alan Turing", "Prof", "CSE", "alan@campus.edu", "Cabin 401", "[\"AI/ML\"]", "Bio");
        when(facultyRepo.findAll()).thenReturn(List.of(f1));
        when(facultySubjectRepo.findByFacultyId("fac-1")).thenReturn(List.of(
                new FacultySubject("fac-1", "sub-1", "CS101", "Theory of Computation")
        ));
        when(officeHourRepo.findByFacultyId("fac-1")).thenReturn(List.of(
                new FacultyOfficeHour("fac-1", "Tuesday", "14:00", "16:00")
        ));

        List<FacultyDto> allFaculty = facultyService.getAllFaculty();
        assertEquals(1, allFaculty.size());
        assertEquals("Dr. Alan Turing", allFaculty.get(0).getName());
        assertEquals(1, allFaculty.get(0).getOfficeHours().size());
        assertEquals("Theory of Computation", allFaculty.get(0).getSubjects().get(0).getName());
    }
}
