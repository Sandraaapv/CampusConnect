package com.campusconnect;

import com.campusconnect.dto.AttendanceSummaryDto;
import com.campusconnect.dto.DashboardDataDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import com.campusconnect.service.AttendanceService;
import com.campusconnect.service.DashboardService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

public class DashboardUrgencyTest {

    @Test
    @DisplayName("Strict urgency priority: 1. Attendance below 75% beats all other items")
    void testUrgencyOrderAttendanceFirst() {
        Subject subLow = new Subject("sub-cn", "CS3604", "Computer Networks", 3, "Prof Shweta", 60);
        AttendanceSummaryDto lowAtt = new AttendanceSummaryDto(subLow, 38, 28, 73.7, 0, 2, true, false, "L");

        AttendanceService attendanceService = new AttendanceService(null, null, null) {
            @Override
            public List<AttendanceSummaryDto> getAttendanceSummary(String studentId) {
                return List.of(lowAtt);
            }
        };
        AssignmentRepository asgRepo = Mockito.mock(AssignmentRepository.class);
        ExamRepository examRepo = Mockito.mock(ExamRepository.class);
        CircularRepository circRepo = Mockito.mock(CircularRepository.class);
        TimetableSlotRepository ttRepo = Mockito.mock(TimetableSlotRepository.class);
        ClassChangeRepository ccRepo = Mockito.mock(ClassChangeRepository.class);
        BadgeRepository badgeRepo = Mockito.mock(BadgeRepository.class);
        StudentBadgeRepository sbRepo = Mockito.mock(StudentBadgeRepository.class);
        FeeStructureRepository feeRepo = Mockito.mock(FeeStructureRepository.class);
        FeePaymentRepository payRepo = Mockito.mock(FeePaymentRepository.class);
        FeedbackFormRepository fbRepo = Mockito.mock(FeedbackFormRepository.class);
        HelpdeskTicketRepository hdRepo = Mockito.mock(HelpdeskTicketRepository.class);
        StudentSettingsRepository setRepo = Mockito.mock(StudentSettingsRepository.class);

        // Also have pending assignment and upcoming exam
        when(asgRepo.findByStudentId("student-1")).thenReturn(List.of(new Assignment("asg-1", "student-1", "sub-1", "CS101", "Due soon quiz", "2026-10-14", "pending", "desc")));
        when(examRepo.findByStudentId("student-1")).thenReturn(List.of(new Exam("ex-1", "student-1", "sub-1", "CS101", "Programming", "2026-10-16", "09:30 AM", "3h", "Hall A")));
        when(setRepo.findById("student-1")).thenReturn(Optional.empty());

        DashboardService dashboardService = new DashboardService(
                attendanceService, asgRepo, examRepo, circRepo, ttRepo, ccRepo,
                badgeRepo, sbRepo, feeRepo, payRepo, fbRepo, hdRepo, setRepo
        );

        StudentRecord record = new StudentRecord("21CS042", "demo@campus.test", "Arjun", "CSE", 6);
        DashboardDataDto dashboard = dashboardService.getDashboard("student-1", record);

        assertEquals("attendance", dashboard.getUrgentHero().getCategory());
        assertEquals("ATTEND", dashboard.getUrgentHero().getTitle());
        assertEquals("2 MORE CLASS", dashboard.getUrgentHero().getHighlight());
    }

    @Test
    @DisplayName("Strict urgency priority: 2. Assignment due < 48h when attendance is safe")
    void testUrgencyOrderAssignmentWhenAttendanceSafe() {
        Subject subSafe = new Subject("sub-dsa", "CS3601", "Algorithms", 4, "Dr Priya", 85);
        AttendanceSummaryDto safeAtt = new AttendanceSummaryDto(subSafe, 40, 36, 90.0, 8, 0, false, true, "H");

        AttendanceService attendanceService = new AttendanceService(null, null, null) {
            @Override
            public List<AttendanceSummaryDto> getAttendanceSummary(String studentId) {
                return List.of(safeAtt);
            }
        };
        AssignmentRepository asgRepo = Mockito.mock(AssignmentRepository.class);
        ExamRepository examRepo = Mockito.mock(ExamRepository.class);
        CircularRepository circRepo = Mockito.mock(CircularRepository.class);
        TimetableSlotRepository ttRepo = Mockito.mock(TimetableSlotRepository.class);
        ClassChangeRepository ccRepo = Mockito.mock(ClassChangeRepository.class);
        BadgeRepository badgeRepo = Mockito.mock(BadgeRepository.class);
        StudentBadgeRepository sbRepo = Mockito.mock(StudentBadgeRepository.class);
        FeeStructureRepository feeRepo = Mockito.mock(FeeStructureRepository.class);
        FeePaymentRepository payRepo = Mockito.mock(FeePaymentRepository.class);
        FeedbackFormRepository fbRepo = Mockito.mock(FeedbackFormRepository.class);
        HelpdeskTicketRepository hdRepo = Mockito.mock(HelpdeskTicketRepository.class);
        StudentSettingsRepository setRepo = Mockito.mock(StudentSettingsRepository.class);

        when(asgRepo.findByStudentId("student-1")).thenReturn(List.of(new Assignment("asg-1", "student-1", "sub-dsa", "CS3601", "B+ Tree Quiz", "2026-10-14", "pending", "desc")));
        when(setRepo.findById("student-1")).thenReturn(Optional.empty());

        DashboardService dashboardService = new DashboardService(
                attendanceService, asgRepo, examRepo, circRepo, ttRepo, ccRepo,
                badgeRepo, sbRepo, feeRepo, payRepo, fbRepo, hdRepo, setRepo
        );

        StudentRecord record = new StudentRecord("21CS042", "demo@campus.test", "Arjun", "CSE", 6);
        DashboardDataDto dashboard = dashboardService.getDashboard("student-1", record);

        assertEquals("assignment", dashboard.getUrgentHero().getCategory());
        assertEquals("SUBMIT", dashboard.getUrgentHero().getTitle());
        assertEquals("B+ Tree Quiz", dashboard.getUrgentHero().getHighlight());
    }
}
