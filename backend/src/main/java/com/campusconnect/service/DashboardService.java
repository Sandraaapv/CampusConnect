package com.campusconnect.service;

import com.campusconnect.dto.AttendanceSummaryDto;
import com.campusconnect.dto.DashboardDataDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DashboardService {

    private final AttendanceService attendanceService;
    private final AssignmentRepository assignmentRepository;
    private final ExamRepository examRepository;
    private final CircularRepository circularRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final ClassChangeRepository classChangeRepository;
    private final BadgeRepository badgeRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final FeedbackFormRepository feedbackFormRepository;
    private final HelpdeskTicketRepository helpdeskTicketRepository;
    private final StudentSettingsRepository studentSettingsRepository;

    public DashboardService(
            AttendanceService attendanceService,
            AssignmentRepository assignmentRepository,
            ExamRepository examRepository,
            CircularRepository circularRepository,
            TimetableSlotRepository timetableSlotRepository,
            ClassChangeRepository classChangeRepository,
            BadgeRepository badgeRepository,
            StudentBadgeRepository studentBadgeRepository,
            FeeStructureRepository feeStructureRepository,
            FeePaymentRepository feePaymentRepository,
            FeedbackFormRepository feedbackFormRepository,
            HelpdeskTicketRepository helpdeskTicketRepository,
            StudentSettingsRepository studentSettingsRepository) {
        this.attendanceService = attendanceService;
        this.assignmentRepository = assignmentRepository;
        this.examRepository = examRepository;
        this.circularRepository = circularRepository;
        this.timetableSlotRepository = timetableSlotRepository;
        this.classChangeRepository = classChangeRepository;
        this.badgeRepository = badgeRepository;
        this.studentBadgeRepository = studentBadgeRepository;
        this.feeStructureRepository = feeStructureRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.feedbackFormRepository = feedbackFormRepository;
        this.helpdeskTicketRepository = helpdeskTicketRepository;
        this.studentSettingsRepository = studentSettingsRepository;
    }

    public DashboardDataDto getDashboard(String studentId, StudentRecord studentRecord) {
        int threshold = studentSettingsRepository.findById(studentId)
                .map(StudentSettings::getAttendanceThreshold)
                .orElse(75);

        List<AttendanceSummaryDto> summary = attendanceService.getAttendanceSummary(studentId);
        List<AttendanceSummaryDto> urgentAttendance = summary.stream().filter(AttendanceSummaryDto::getIsAtRisk).toList();

        List<Assignment> pendingAssignments = assignmentRepository.findByStudentId(studentId).stream()
                .filter(a -> "pending".equalsIgnoreCase(a.getStatus()))
                .toList();

        List<Exam> upcomingExams = examRepository.findByStudentId(studentId);
        List<Circular> latestCirculars = circularRepository.findAll().stream().limit(3).toList();

        // Badges
        List<StudentBadge> studentBadges = studentBadgeRepository.findByStudentId(studentId);
        Set<String> unlockedBadgeIds = new HashSet<>(studentBadges.stream().filter(StudentBadge::isUnlocked).map(StudentBadge::getBadgeId).toList());
        List<Badge> unlockedBadges = badgeRepository.findAll().stream().filter(b -> unlockedBadgeIds.contains(b.getId())).toList();

        // Timetable & Class Changes for Today
        String todayDateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        List<ClassChange> todayChanges = classChangeRepository.findByDate(todayDateStr);
        List<TimetableSlot> mondaySlots = timetableSlotRepository.findAll(); // default schedule
        List<DashboardDataDto.TimetableSlotWithChangeDto> todaySlots = mondaySlots.stream().map(slot -> {
            ClassChange change = todayChanges.stream().filter(c -> c.getSlotId().equals(slot.getId())).findFirst().orElse(null);
            return new DashboardDataDto.TimetableSlotWithChangeDto(slot, change);
        }).toList();

        List<DashboardDataDto.TimetableSlotWithChangeDto> changedSlots = todaySlots.stream()
                .filter(s -> s.getChange() != null)
                .toList();

        // Feedback & Helpdesk
        int pendingFeedbackCount = (int) feedbackFormRepository.findAll().stream()
                .filter(f -> !"closed".equalsIgnoreCase(f.getStatus()) && !"submitted".equalsIgnoreCase(f.getStatus()))
                .count();

        int openHelpdeskCount = (int) helpdeskTicketRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .filter(t -> !"Closed".equalsIgnoreCase(t.getStatus()))
                .count();

        // Fees
        int semester = studentRecord != null ? studentRecord.getSemester() : 6;
        List<FeeStructure> feeItems = feeStructureRepository.findBySemester(semester);
        double totalFee = feeItems.stream().mapToDouble(FeeStructure::getAmount).sum();
        if (totalFee == 0) totalFee = 65000;

        List<FeePayment> payments = feePaymentRepository.findByStudentIdAndSemester(studentId, semester);
        double paidAmount = payments.stream()
                .filter(p -> "success".equalsIgnoreCase(p.getStatus()))
                .mapToDouble(FeePayment::getAmount)
                .sum();
        double balanceDue = Math.max(0, totalFee - paidAmount);
        String feeStatus = balanceDue > 0 ? "Due soon" : "Paid";

        Map<String, Object> feeSummary = new LinkedHashMap<>();
        feeSummary.put("totalFee", totalFee);
        feeSummary.put("paidAmount", paidAmount);
        feeSummary.put("balanceDue", balanceDue);
        feeSummary.put("dueDate", "2026-11-10");
        feeSummary.put("status", feeStatus);

        boolean feeDueSoon = balanceDue > 0;

        // Urgency-ordered hero card:
        // 1) Attendance below 75%
        // 2) Assignments due within 48h
        // 3) Feedback forms closing
        // 4) Fees due
        // 5) Exams within 7 days
        // 6) New circulars
        DashboardDataDto.UrgentHeroDto hero;
        if (!urgentAttendance.isEmpty()) {
            AttendanceSummaryDto risk = urgentAttendance.get(0);
            hero = new DashboardDataDto.UrgentHeroDto(
                    "attendance",
                    "ATTEND",
                    risk.getClassesNeeded() + " MORE CLASS",
                    "You're at " + risk.getCurrentPercent() + "%, just under the " + threshold + "% line in " + risk.getSubject().getName() + ". Next class restores safety.",
                    "Open calculator",
                    "/attendance"
            );
        } else if (!pendingAssignments.isEmpty()) {
            Assignment asg = pendingAssignments.get(0);
            hero = new DashboardDataDto.UrgentHeroDto(
                    "assignment",
                    "SUBMIT",
                    asg.getTitle(),
                    "Due soon for " + asg.getSubjectCode() + ". Upload your submission to maintain continuous internal marks.",
                    "View assignments",
                    "/dashboard"
            );
        } else if (pendingFeedbackCount > 0) {
            hero = new DashboardDataDto.UrgentHeroDto(
                    "feedback",
                    "COMPLETE",
                    pendingFeedbackCount + " COURSE FEEDBACK FORMS",
                    "Mandatory student evaluation window closes in 48 hours. Required before exam hall tickets are generated.",
                    "Submit feedback",
                    "/feedback"
            );
        } else if (feeDueSoon) {
            hero = new DashboardDataDto.UrgentHeroDto(
                    "fee",
                    "SETTLE",
                    "₹" + ((int) balanceDue) + " SEMESTER " + semester + " FEE",
                    "Balance payment due on 2026-11-10. Settle on college portal to ensure no-dues clearance.",
                    "View fee details",
                    "/fees"
            );
        } else if (!upcomingExams.isEmpty()) {
            Exam ex = upcomingExams.get(0);
            hero = new DashboardDataDto.UrgentHeroDto(
                    "exam",
                    "REVISE",
                    ex.getSubjectCode() + " EXAM",
                    ex.getSubjectName() + " theory exam scheduled on " + ex.getExamDate() + ".",
                    "Study planner",
                    "/exams"
            );
        } else {
            hero = new DashboardDataDto.UrgentHeroDto(
                    "circular",
                    "CHECK",
                    "LATEST CIRCULARS",
                    "New official campus notifications and announcements posted by registrar.",
                    "Read circulars",
                    "/circulars"
            );
        }

        DashboardDataDto dashboard = new DashboardDataDto();
        dashboard.setUrgentHero(hero);
        dashboard.setSummary(summary);
        dashboard.setUrgentAttendance(urgentAttendance);
        dashboard.setPendingAssignments(pendingAssignments);
        dashboard.setUpcomingExams(upcomingExams);
        dashboard.setLatestCirculars(latestCirculars);
        dashboard.setStreak(new DashboardDataDto.StreakDto(18, true, "21-Day Streak Master"));
        dashboard.setUnlockedBadges(unlockedBadges);
        dashboard.setTodaySlots(todaySlots);
        dashboard.setChangedSlots(changedSlots);
        dashboard.setPendingFeedbackCount(pendingFeedbackCount);
        dashboard.setOpenHelpdeskCount(openHelpdeskCount);
        dashboard.setFeeSummary(feeSummary);
        dashboard.setFeeDueSoon(feeDueSoon);

        return dashboard;
    }
}
