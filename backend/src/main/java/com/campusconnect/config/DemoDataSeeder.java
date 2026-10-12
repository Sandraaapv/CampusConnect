package com.campusconnect.config;

import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
@Order(2)
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String DEMO_STUDENT_ID = "usr-demo-21cs042";

    private final SubjectRepository subjectRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final MarkRecordRepository markRecordRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final ClassChangeRepository classChangeRepository;
    private final AssignmentRepository assignmentRepository;
    private final ExamRepository examRepository;
    private final CircularRepository circularRepository;
    private final SyllabusUnitRepository syllabusUnitRepository;
    private final StudentUnitProgressRepository studentUnitProgressRepository;
    private final PastSemesterRepository pastSemesterRepository;
    private final PastSubjectRepository pastSubjectRepository;
    private final StudentSettingsRepository studentSettingsRepository;
    private final StudentRequestRepository studentRequestRepository;
    private final RequestCommentRepository requestCommentRepository;
    private final RequestDeptStageRepository requestDeptStageRepository;
    private final NotificationRepository notificationRepository;
    private final BadgeRepository badgeRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final NoteRepository noteRepository;
    private final NoteUpvoteRepository noteUpvoteRepository;
    private final FacultyRepository facultyRepository;
    private final FacultyOfficeHourRepository facultyOfficeHourRepository;
    private final FacultySubjectRepository facultySubjectRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final FeeReceiptRepository feeReceiptRepository;
    private final FeedbackFormRepository feedbackFormRepository;
    private final FeedbackQuestionRepository feedbackQuestionRepository;
    private final HelpdeskTicketRepository helpdeskTicketRepository;
    private final HelpdeskCommentRepository helpdeskCommentRepository;

    public DemoDataSeeder(
            SubjectRepository subjectRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            MarkRecordRepository markRecordRepository,
            TimetableEntryRepository timetableEntryRepository,
            TimetableSlotRepository timetableSlotRepository,
            ClassChangeRepository classChangeRepository,
            AssignmentRepository assignmentRepository,
            ExamRepository examRepository,
            CircularRepository circularRepository,
            SyllabusUnitRepository syllabusUnitRepository,
            StudentUnitProgressRepository studentUnitProgressRepository,
            PastSemesterRepository pastSemesterRepository,
            PastSubjectRepository pastSubjectRepository,
            StudentSettingsRepository studentSettingsRepository,
            StudentRequestRepository studentRequestRepository,
            RequestCommentRepository requestCommentRepository,
            RequestDeptStageRepository requestDeptStageRepository,
            NotificationRepository notificationRepository,
            BadgeRepository badgeRepository,
            StudentBadgeRepository studentBadgeRepository,
            NoteRepository noteRepository,
            NoteUpvoteRepository noteUpvoteRepository,
            FacultyRepository facultyRepository,
            FacultyOfficeHourRepository facultyOfficeHourRepository,
            FacultySubjectRepository facultySubjectRepository,
            FeeStructureRepository feeStructureRepository,
            FeePaymentRepository feePaymentRepository,
            FeeReceiptRepository feeReceiptRepository,
            FeedbackFormRepository feedbackFormRepository,
            FeedbackQuestionRepository feedbackQuestionRepository,
            HelpdeskTicketRepository helpdeskTicketRepository,
            HelpdeskCommentRepository helpdeskCommentRepository) {
        this.subjectRepository = subjectRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.markRecordRepository = markRecordRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.timetableSlotRepository = timetableSlotRepository;
        this.classChangeRepository = classChangeRepository;
        this.assignmentRepository = assignmentRepository;
        this.examRepository = examRepository;
        this.circularRepository = circularRepository;
        this.syllabusUnitRepository = syllabusUnitRepository;
        this.studentUnitProgressRepository = studentUnitProgressRepository;
        this.pastSemesterRepository = pastSemesterRepository;
        this.pastSubjectRepository = pastSubjectRepository;
        this.studentSettingsRepository = studentSettingsRepository;
        this.studentRequestRepository = studentRequestRepository;
        this.requestCommentRepository = requestCommentRepository;
        this.requestDeptStageRepository = requestDeptStageRepository;
        this.notificationRepository = notificationRepository;
        this.badgeRepository = badgeRepository;
        this.studentBadgeRepository = studentBadgeRepository;
        this.noteRepository = noteRepository;
        this.noteUpvoteRepository = noteUpvoteRepository;
        this.facultyRepository = facultyRepository;
        this.facultyOfficeHourRepository = facultyOfficeHourRepository;
        this.facultySubjectRepository = facultySubjectRepository;
        this.feeStructureRepository = feeStructureRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.feeReceiptRepository = feeReceiptRepository;
        this.feedbackFormRepository = feedbackFormRepository;
        this.feedbackQuestionRepository = feedbackQuestionRepository;
        this.helpdeskTicketRepository = helpdeskTicketRepository;
        this.helpdeskCommentRepository = helpdeskCommentRepository;
    }

    @Override
    public void run(String... args) {
        if (subjectRepository.count() > 0) {
            log.info("Demo college records already seeded. Skipping initial seeding.");
            return;
        }

        log.info("Seeding official CampusConnect college records and student demo data...");

        // 1. Subjects
        Subject subDsa = new Subject("sub-dsa", "CS3601", "Data Structures & Algorithms", 4, "Dr. Priya V.", 85);
        Subject subOs = new Subject("sub-os", "CS3602", "Operating Systems", 4, "Prof. Rajesh K.", 70);
        Subject subDbms = new Subject("sub-dbms", "CS3603", "Database Management Systems", 4, "Dr. Anand R.", 90);
        Subject subCn = new Subject("sub-cn", "CS3604", "Computer Networks", 3, "Prof. Shweta M.", 60);
        Subject subCloud = new Subject("sub-cloud", "CS3605", "Cloud Computing & DevOps", 3, "Dr. Karthik S.", 75);
        subjectRepository.saveAll(List.of(subDsa, subOs, subDbms, subCn, subCloud));

        // 2. Attendance (192 records across 60+ days)
        List<AttendanceRecord> attendanceList = new ArrayList<>();
        Map<String, int[]> targets = Map.of(
                "sub-dsa", new int[]{42, 37},
                "sub-os", new int[]{38, 31},
                "sub-dbms", new int[]{40, 36},
                "sub-cn", new int[]{38, 28}, // < 75%
                "sub-cloud", new int[]{34, 29}
        );

        LocalDate baseDate = LocalDate.of(2026, 10, 10);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        targets.forEach((subId, counts) -> {
            int total = counts[0];
            int attended = counts[1];
            int presentCount = 0;
            for (int i = total; i >= 1; i--) {
                LocalDate d = baseDate.minusDays((long) (i * 1.5));
                boolean isPresent = presentCount < attended;
                if (isPresent) presentCount++;
                attendanceList.add(new AttendanceRecord(
                        "att-" + subId + "-" + i,
                        DEMO_STUDENT_ID,
                        subId,
                        d.format(fmt),
                        isPresent ? "present" : "absent",
                        "college"
                ));
            }
        });
        attendanceRecordRepository.saveAll(attendanceList);

        // 3. Internal Marks
        markRecordRepository.saveAll(List.of(
                new MarkRecord(DEMO_STUDENT_ID, "sub-dsa", 23, 24, 9.5, 47.1, 50, 4, "college"),
                new MarkRecord(DEMO_STUDENT_ID, "sub-os", 20, 21, 9.0, 41.8, 50, 4, "college"),
                new MarkRecord(DEMO_STUDENT_ID, "sub-dbms", 24, 25, 10.0, 49.2, 50, 4, "college"),
                new MarkRecord(DEMO_STUDENT_ID, "sub-cn", 17, 19, 8.5, 37.3, 50, 3, "college"),
                new MarkRecord(DEMO_STUDENT_ID, "sub-cloud", 21, 22, 9.0, 43.4, 50, 3, "college")
        ));

        // 4. Timetable Entries
        timetableEntryRepository.saveAll(List.of(
                new TimetableEntry("tt-1", DEMO_STUDENT_ID, "Monday", "sub-dsa", "CS3601", "Data Structures & Algorithms", "09:00", "10:00", "LH-201"),
                new TimetableEntry("tt-2", DEMO_STUDENT_ID, "Monday", "sub-os", "CS3602", "Operating Systems", "10:15", "11:15", "LH-201"),
                new TimetableEntry("tt-3", DEMO_STUDENT_ID, "Monday", "sub-dbms", "CS3603", "Database Management Systems", "11:30", "12:30", "Lab-3"),
                new TimetableEntry("tt-4", DEMO_STUDENT_ID, "Tuesday", "sub-cn", "CS3604", "Computer Networks", "09:00", "10:00", "LH-203"),
                new TimetableEntry("tt-5", DEMO_STUDENT_ID, "Tuesday", "sub-cloud", "CS3605", "Cloud Computing & DevOps", "10:15", "11:15", "LH-203"),
                new TimetableEntry("tt-6", DEMO_STUDENT_ID, "Wednesday", "sub-dsa", "CS3601", "Data Structures & Algorithms", "09:00", "10:00", "LH-201"),
                new TimetableEntry("tt-7", DEMO_STUDENT_ID, "Wednesday", "sub-dbms", "CS3603", "Database Management Systems", "10:15", "11:15", "LH-201"),
                new TimetableEntry("tt-8", DEMO_STUDENT_ID, "Thursday", "sub-os", "CS3602", "Operating Systems", "09:00", "10:00", "LH-201"),
                new TimetableEntry("tt-9", DEMO_STUDENT_ID, "Thursday", "sub-cn", "CS3604", "Computer Networks", "11:30", "12:30", "LH-203"),
                new TimetableEntry("tt-10", DEMO_STUDENT_ID, "Friday", "sub-cloud", "CS3605", "Cloud Computing & DevOps", "09:00", "10:00", "LH-203"),
                new TimetableEntry("tt-11", DEMO_STUDENT_ID, "Friday", "sub-dsa", "CS3601", "Data Structures & Algorithms", "10:15", "11:15", "Lab-1")
        ));

        // 5. Timetable Slots & Changes
        timetableSlotRepository.saveAll(List.of(
                new TimetableSlot("slot-mon-1", "Monday", 1, "08:45", "09:40", "sub-dsa", "CS3601", "Data Structures & Algorithms", "LH-201", "fac-1", "Dr. Priya V.", "lecture", "blue"),
                new TimetableSlot("slot-mon-2", "Monday", 2, "09:45", "10:40", "sub-os", "CS3602", "Operating Systems", "LH-201", "fac-2", "Prof. Rajesh K.", "lecture", "indigo"),
                new TimetableSlot("slot-mon-3", "Monday", 3, "10:55", "11:50", "sub-dbms", "CS3603", "Database Management Systems", "Lab-3", "fac-3", "Dr. Anand R.", "lab", "emerald"),
                new TimetableSlot("slot-tue-1", "Tuesday", 1, "08:45", "09:40", "sub-cn", "CS3604", "Computer Networks", "LH-203", "fac-4", "Prof. Shweta M.", "lecture", "amber"),
                new TimetableSlot("slot-wed-1", "Wednesday", 1, "08:45", "09:40", "sub-dsa", "CS3601", "Data Structures & Algorithms", "LH-201", "fac-1", "Dr. Priya V.", "lecture", "blue"),
                new TimetableSlot("slot-thu-1", "Thursday", 1, "08:45", "09:40", "sub-os", "CS3602", "Operating Systems", "LH-201", "fac-2", "Prof. Rajesh K.", "lecture", "indigo"),
                new TimetableSlot("slot-fri-1", "Friday", 1, "08:45", "09:40", "sub-cloud", "CS3605", "Cloud Computing & DevOps", "LH-203", "fac-5", "Dr. Karthik S.", "lecture", "purple")
        ));

        // 6. Assignments
        assignmentRepository.saveAll(List.of(
                new Assignment("asg-1", DEMO_STUDENT_ID, "sub-dbms", "CS3603", "B+ Tree Indexing & Query Optimization Quiz", "2026-10-14T23:59:59Z", "pending", "Implement B+ Tree insertion algorithm and submit test benchmark results."),
                new Assignment("asg-2", DEMO_STUDENT_ID, "sub-cn", "CS3604", "Wireshark Packet Analysis Lab Report", "2026-10-16T23:59:59Z", "pending", "Capture TCP 3-way handshake and analyze window scaling.")
        ));

        // 7. Exams
        examRepository.saveAll(List.of(
                new Exam("ex-1", DEMO_STUDENT_ID, "sub-cn", "CS3604", "Computer Networks", "2026-10-16", "09:30 AM", "3 hours", "Hall B"),
                new Exam("ex-2", DEMO_STUDENT_ID, "sub-os", "CS3602", "Operating Systems", "2026-10-20", "09:30 AM", "3 hours", "Hall B"),
                new Exam("ex-3", DEMO_STUDENT_ID, "sub-dsa", "CS3601", "Data Structures & Algorithms", "2026-10-24", "09:30 AM", "3 hours", "Hall A")
        ));

        // 8. Circulars
        circularRepository.saveAll(List.of(
                new Circular("circ-1", "End-Semester Examination Time Table & Hall Ticket Guidelines", "Computer Science & Engineering", 6, "Exam", "2026-10-09", "The end-semester theory examinations for Semester 6 begin on November 15th, 2026. Hall tickets will be downloadable from the portal starting November 5th. Clear all departmental dues prior to registration.", "Exam,Schedule,HallTicket"),
                new Circular("circ-2", "Inter-College HackFest 2026 Registration & OD Grant", "Computer Science & Engineering", 6, "Event", "2026-10-07", "Selected finalists for HackFest 2026 at IIT Bombay are entitled to 2 days of On-Duty attendance. Submit an OD Letter request online with your confirmation badge before October 12th.", "Hackathon,OD,Events"),
                new Circular("circ-3", "Hostel Mess Rebate & No-Dues Clearance Window", "Computer Science & Engineering", 6, "Hostel", "2026-10-05", "Hostel students can file online applications for mess rebate reimbursement for absences exceeding 5 continuous days.", "Hostel,Rebate")
        ));

        // 9. Syllabus Units & Student Progress
        List<SyllabusUnit> units = List.of(
                new SyllabusUnit("u-cn-1", "sub-cn", 1, "Network Fundamentals & Physical Layer", 4),
                new SyllabusUnit("u-cn-2", "sub-cn", 2, "Data Link Layer & Error Control", 5),
                new SyllabusUnit("u-cn-3", "sub-cn", 3, "Network Layer & Routing Protocols", 6),
                new SyllabusUnit("u-cn-4", "sub-cn", 4, "Transport Layer & TCP Congestion", 6),
                new SyllabusUnit("u-cn-5", "sub-cn", 5, "Application Layer & Network Security", 5),
                new SyllabusUnit("u-dsa-1", "sub-dsa", 1, "Asymptotic Analysis & Recurrences", 4),
                new SyllabusUnit("u-dsa-2", "sub-dsa", 2, "Divide & Conquer, Greedy Strategies", 5),
                new SyllabusUnit("u-dsa-3", "sub-dsa", 3, "Dynamic Programming & Memoization", 7),
                new SyllabusUnit("u-dsa-4", "sub-dsa", 4, "Graph Algorithms & Shortest Paths", 6),
                new SyllabusUnit("u-dsa-5", "sub-dsa", 5, "NP-Completeness & Approximation", 5),
                new SyllabusUnit("u-os-1", "sub-os", 1, "Processes, Threads & CPU Scheduling", 5),
                new SyllabusUnit("u-os-2", "sub-os", 2, "Synchronization & Deadlocks", 6),
                new SyllabusUnit("u-os-3", "sub-os", 3, "Memory Management & Virtual Memory", 6),
                new SyllabusUnit("u-os-4", "sub-os", 4, "Storage Systems & File System Interface", 4),
                new SyllabusUnit("u-dbms-1", "sub-dbms", 1, "Relational Model & Relational Algebra", 4),
                new SyllabusUnit("u-dbms-2", "sub-dbms", 2, "SQL & Schema Normalization (1NF-BCNF)", 6),
                new SyllabusUnit("u-dbms-3", "sub-dbms", 3, "Indexing, B+ Trees & Query Optimization", 5),
                new SyllabusUnit("u-dbms-4", "sub-dbms", 4, "Transactions, ACID Properties & Concurrency", 6)
        );
        syllabusUnitRepository.saveAll(units);

        studentUnitProgressRepository.saveAll(List.of(
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-cn-1", true),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-cn-2", true),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-cn-3", false),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-dsa-1", true),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-dsa-2", true),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-dsa-3", true),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-dsa-4", false),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-os-1", true),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-os-2", true),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-os-3", false),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-dbms-1", true),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-dbms-2", true),
                new StudentUnitProgress(DEMO_STUDENT_ID, "u-dbms-3", false)
        ));

        // 10. Past Semesters (Sem 1 to 5)
        seedAcademicHistory();

        // 11. Student Settings
        studentSettingsRepository.save(new StudentSettings(
                DEMO_STUDENT_ID,
                75,
                8.5,
                4,
                50,
                50,
                "{\"lowAttendance\":true,\"approachingDeadlines\":true,\"requestStatus\":true,\"circulars\":true,\"newBadges\":true}",
                "system"
        ));

        // 12. Badges & Student Badges
        badgeRepository.saveAll(List.of(
                new Badge("b-streak-master", "Streak Master", "Maintained 18+ days of uninterrupted attendance", "Flame", "Attend all classes consecutively"),
                new Badge("b-perfect-week", "Perfect Week", "100% attendance across all subjects in a single week", "Award", "Never miss a class Monday to Friday"),
                new Badge("b-early-bird", "Early Bird", "Present for every 9:00 AM period throughout the month", "Zap", "Be on time for period 1"),
                new Badge("b-comeback-kid", "Comeback Kid", "Recovered a low subject from below 75% back to safe zone", "ShieldCheck", "Bring Computer Networks back above 75%")
        ));

        studentBadgeRepository.saveAll(List.of(
                new StudentBadge(DEMO_STUDENT_ID, "b-streak-master", true, "2026-10-08"),
                new StudentBadge(DEMO_STUDENT_ID, "b-perfect-week", true, "2026-09-22"),
                new StudentBadge(DEMO_STUDENT_ID, "b-early-bird", true, "2026-09-30")
        ));

        // 13. Requests & Workflow Logs
        StudentRequest reqNd = new StudentRequest("REQ-ND-8842", DEMO_STUDENT_ID, "No-dues", "Semester 6 No-Dues Clearance", "Approved", "2026-10-02", "{\"reason\":\"Final semester graduation and lab clearance.\"}", "v_token_nd8842_signed_cc2026", 0);
        StudentRequest reqOd = new StudentRequest("REQ-OD-4819", DEMO_STUDENT_ID, "OD letter", "HackFest 2026 Finals (2 Days)", "Faculty Review", "2026-10-08", "{\"eventName\":\"National Inter-College HackFest 2026\",\"durationDays\":2,\"affectedSubjectIds\":[\"sub-os\",\"sub-cn\"],\"reason\":\"Representing college in 36-hour hackathon finals at IIT.\"}", "v_token_od4819_signed_cc2026", 2);
        StudentRequest reqSch = new StudentRequest("REQ-SCH-2210", DEMO_STUDENT_ID, "Scholarship", "Merit-Cum-Means Fee Concession", "Admin Review", "2026-10-01", "{\"concessionCategory\":\"Merit Category A\",\"reason\":\"CGPA > 8.5 with income certificate attached.\"}", "v_token_sch2210_signed_cc2026", 0);
        StudentRequest reqEvt = new StudentRequest("REQ-EVT-9184", DEMO_STUDENT_ID, "Event", "ACM Chapter CodeFest Auditorium Permission", "Approved", "2026-09-25", "{\"clubName\":\"ACM Student Chapter\",\"reason\":\"Technical seminar and coding competition.\"}", "v_token_evt9184_signed_cc2026", 0);
        studentRequestRepository.saveAll(List.of(reqNd, reqOd, reqSch, reqEvt));

        requestCommentRepository.saveAll(List.of(
                new RequestComment("REQ-ND-8842", "System", "Clearance Engine", "All 4 departments cleared. Digital certificate issued.", "2026-10-05"),
                new RequestComment("REQ-OD-4819", "Student", "Arjun Verma", "Attached invitation pass and round-1 selection mail.", "2026-10-08"),
                new RequestComment("REQ-OD-4819", "Faculty", "Faculty Advisor", "Reviewing event credentials with HOD.", "2026-10-09"),
                new RequestComment("REQ-SCH-2210", "Admin", "Scholarship Cell", "Income certificate verified. Concession approved.", "2026-10-06"),
                new RequestComment("REQ-EVT-9184", "Admin", "Dean Student Affairs", "Venue and date confirmed. Auditorium booked.", "2026-09-28")
        ));

        requestDeptStageRepository.saveAll(List.of(
                new RequestDeptStage("REQ-ND-8842", "Library", true, "2026-10-03", "No outstanding books or fines."),
                new RequestDeptStage("REQ-ND-8842", "Hostel", true, "2026-10-04", "Room handover inspected."),
                new RequestDeptStage("REQ-ND-8842", "Accounts", true, "2026-10-04", "All semester tuition paid."),
                new RequestDeptStage("REQ-ND-8842", "Labs", true, "2026-10-05", "Component kit returned.")
        ));

        // 14. Notifications
        notificationRepository.saveAll(List.of(
                new Notification("notif-1", DEMO_STUDENT_ID, "attendance", "Attendance Alert: Computer Networks", "Your attendance is at 73.7% (below the 75% threshold). You need to attend 2 consecutive classes to recover.", "Today, 08:30 AM", false, "/attendance"),
                new Notification("notif-2", DEMO_STUDENT_ID, "deadline", "Assignment Due in 28 Hours", "B+ Tree Indexing & Query Optimization Quiz is due tomorrow at 11:59 PM.", "Today, 09:15 AM", false, "/dashboard"),
                new Notification("notif-3", DEMO_STUDENT_ID, "request", "No-Dues Clearance Approved", "All 4 departments have stamped cleared. Download your verified clearance certificate.", "Yesterday, 04:00 PM", true, "/requests/REQ-ND-8842"),
                new Notification("notif-4", DEMO_STUDENT_ID, "circular", "New Circular: End-Sem Exam Schedule", "Office of COE has published the final theory exam schedule for Semester 6.", "Oct 9, 2026", true, "/circulars")
        ));

        // 15. Notes
        Note note1 = new Note("note-1", "sub-dsa", "CS3601", "Graph Algorithms & Dynamic Programming Cheatsheet", "Notes", "Arjun Verma (21CS042)", "2026-09-28", 42);
        Note note2 = new Note("note-2", "sub-cn", "CS3604", "Previous 5 Years Question Papers with Solutions (2021-2025)", "PYQ", "Sneha Rao (21CS089)", "2026-10-02", 68);
        Note note3 = new Note("note-3", "sub-os", "CS3602", "Process Synchronization & Semaphore Implementation Handouts", "PDF", "Rohan Mehra (21CS014)", "2026-09-15", 31);
        noteRepository.saveAll(List.of(note1, note2, note3));

        noteUpvoteRepository.save(new NoteUpvote("note-2", DEMO_STUDENT_ID));

        // 16. Faculty
        Faculty fac1 = new Faculty("fac-1", "Dr. Priya V.", "Associate Professor", "Computer Science & Engineering", "priya.v@campus.test", "Cabin 304, Tech Block A", "[\"Algorithms\", \"Computational Geometry\"]", "Ph.D. in Computer Science with 12 years of teaching and research experience in algorithmic complexity.");
        Faculty fac2 = new Faculty("fac-2", "Prof. Rajesh K.", "Assistant Professor", "Computer Science & Engineering", "rajesh.k@campus.test", "Cabin 208, Tech Block A", "[\"Operating Systems\", \"Kernel Development\"]", "M.Tech in Systems Engineering; focuses on real-time OS kernels and virtualization.");
        Faculty fac3 = new Faculty("fac-3", "Dr. Anand R.", "Professor & Dean Academics", "Computer Science & Engineering", "anand.r@campus.test", "Dean Office, Admin Block", "[\"Distributed Databases\", \"Cloud Storage\"]", "Over 20 years of research in database indexing, transaction models, and enterprise systems.");
        Faculty fac4 = new Faculty("fac-4", "Prof. Shweta M.", "Assistant Professor", "Computer Science & Engineering", "shweta.m@campus.test", "Cabin 312, Tech Block A", "[\"Computer Networks\", \"Software Defined Networking\"]", "Active researcher in SDN architectures, TCP optimization, and network security protocols.");
        Faculty fac5 = new Faculty("fac-5", "Dr. Karthik S.", "Associate Professor", "Computer Science & Engineering", "karthik.s@campus.test", "Cabin 401, Tech Block B", "[\"Cloud Architectures\", \"DevOps & CI/CD\"]", "Industry consultant and researcher specializing in scalable cloud microservices.");
        facultyRepository.saveAll(List.of(fac1, fac2, fac3, fac4, fac5));

        facultyOfficeHourRepository.saveAll(List.of(
                new FacultyOfficeHour("fac-1", "Monday", "14:00", "16:00"),
                new FacultyOfficeHour("fac-2", "Wednesday", "15:00", "17:00"),
                new FacultyOfficeHour("fac-3", "Tuesday", "10:00", "12:00"),
                new FacultyOfficeHour("fac-4", "Thursday", "14:00", "16:00"),
                new FacultyOfficeHour("fac-5", "Friday", "11:00", "13:00")
        ));

        // 17. Fee Structures & Payments
        feeStructureRepository.saveAll(List.of(
                new FeeStructure("fee-sem6-1", 6, "Tuition Fee", 45000),
                new FeeStructure("fee-sem6-2", 6, "Special / Curriculum Fee", 8000),
                new FeeStructure("fee-sem6-3", 6, "Computer Laboratory & Network Fee", 5000),
                new FeeStructure("fee-sem6-4", 6, "Library & Digital Journals Access", 3000),
                new FeeStructure("fee-sem6-5", 6, "Semester Examination & Assessment Fee", 4000)
        ));

        feePaymentRepository.save(new FeePayment(
                "pay-sem6-01",
                DEMO_STUDENT_ID,
                6,
                65000,
                "Net Banking (HDFC)",
                "TXN_CC_9824108842",
                "2026-08-14 11:22 AM",
                "success",
                "Semester 6 Full Composite Fee (Tuition, Lab, Exam)",
                "4021"
        ));

        feeReceiptRepository.save(new FeeReceipt(
                "rec-sem6-01",
                "pay-sem6-01",
                "CC/REC/2026/06-8842",
                "v_token_rec_8842_signed_cc2026",
                "CampusConnect Institute of Technology",
                "Arjun Verma",
                "21CS042",
                "Computer Science & Engineering",
                6,
                65000,
                "August 14, 2026",
                "Net Banking (HDFC)",
                "TXN_CC_9824108842",
                "Semester 6 Full Composite Fee Paid in Full"
        ));

        // 18. Feedback Forms & Questions
        feedbackFormRepository.saveAll(List.of(
                new FeedbackForm("fb-form-1", "sub-dsa", "CS3601", "Data Structures & Algorithms", "fac-1", "Dr. Priya V.", "2026-10-01", "2026-10-25", "pending"),
                new FeedbackForm("fb-form-2", "sub-os", "CS3602", "Operating Systems", "fac-2", "Prof. Rajesh K.", "2026-10-01", "2026-10-25", "pending"),
                new FeedbackForm("fb-form-3", "sub-dbms", "CS3603", "Database Management Systems", "fac-3", "Dr. Anand R.", "2026-10-01", "2026-10-25", "pending"),
                new FeedbackForm("fb-form-4", "sub-cn", "CS3604", "Computer Networks", "fac-4", "Prof. Shweta M.", "2026-10-01", "2026-10-25", "pending")
        ));

        feedbackQuestionRepository.saveAll(List.of(
                new FeedbackQuestion("fq-1", "Pedagogy", "The instructor clearly explained complex concepts and problem-solving techniques."),
                new FeedbackQuestion("fq-2", "Punctuality", "Classes were conducted regularly and punctually according to the timetable."),
                new FeedbackQuestion("fq-3", "Doubt Resolution", "The faculty encouraged questions and clarified doubts effectively during office hours."),
                new FeedbackQuestion("fq-4", "Assessment Fairness", "Internal evaluations, assignments, and test markings were transparent and constructive.")
        ));

        // 19. Helpdesk Tickets
        helpdeskTicketRepository.saveAll(List.of(
                new HelpdeskTicket("hd-1", "TKT-2026-1092", DEMO_STUDENT_ID, "Wi-Fi / Network", "Medium", "Intermittent Wi-Fi Disconnection in LH-201", "Signal drops frequently during morning periods 1 and 2.", "Lecture Hall LH-201, 2nd Floor", "In progress", "Campus IT & Network Cell", null, "2026-10-08T10:00:00Z", "2026-10-09T14:30:00Z"),
                new HelpdeskTicket("hd-2", "TKT-2026-0854", DEMO_STUDENT_ID, "Library", "Low", "IEEE Xplore Off-Campus Proxy Access Failure", "Remote access portal returns 502 bad gateway when logging in via college credentials.", "Digital Library Portal", "Resolved", "Central Library", 5, "2026-09-24T09:15:00Z", "2026-09-26T16:00:00Z")
        ));

        helpdeskCommentRepository.saveAll(List.of(
                new HelpdeskComment("hdc-1", "hd-1", "student", "Arjun Verma", "Access point AP-LH201-B appears to be rebooting continuously.", "2026-10-08T10:05:00Z"),
                new HelpdeskComment("hdc-2", "hd-1", "support", "IT Support Desk", "Network engineer assigned. Hardware replacement scheduled for 4:00 PM.", "2026-10-09T14:30:00Z"),
                new HelpdeskComment("hdc-3", "hd-2", "support", "Digital Library Admin", "Proxy certificate refreshed. Off-campus portal is functioning normally.", "2026-09-26T16:00:00Z")
        ));

        log.info("Official CampusConnect college records seeded successfully.");
    }

    private void seedAcademicHistory() {
        // Sem 1 (SGPA 8.83, CGPA 8.83)
        PastSemester sem1 = pastSemesterRepository.save(new PastSemester(DEMO_STUDENT_ID, 1, "Fall 2023", 8.83, 8.83, 18));
        pastSubjectRepository.saveAll(List.of(
                new PastSubject(sem1.getId(), "MA1101", "Linear Algebra & Calculus", 4, "A+", 9, false),
                new PastSubject(sem1.getId(), "PH1101", "Engineering Physics", 3, "A", 8, false),
                new PastSubject(sem1.getId(), "CS1101", "Problem Solving & Python Programming", 4, "O", 10, false),
                new PastSubject(sem1.getId(), "GE1101", "Engineering Graphics & CAD", 3, "A", 8, false),
                new PastSubject(sem1.getId(), "CY1101", "Engineering Chemistry", 3, "B+", 7, false),
                new PastSubject(sem1.getId(), "CS1181", "Python Programming Laboratory", 2, "O", 10, false)
        ));

        // Sem 2 (SGPA 8.68, CGPA 8.76)
        PastSemester sem2 = pastSemesterRepository.save(new PastSemester(DEMO_STUDENT_ID, 2, "Spring 2024", 8.68, 8.76, 19));
        pastSubjectRepository.saveAll(List.of(
                new PastSubject(sem2.getId(), "MA1201", "Transforms & Partial Differential Equations", 4, "A", 8, false),
                new PastSubject(sem2.getId(), "CS1201", "Programming in C & Data Structures", 4, "A+", 9, false),
                new PastSubject(sem2.getId(), "EE1201", "Basic Electrical & Electronics Engineering", 3, "B+", 7, false),
                new PastSubject(sem2.getId(), "CS1202", "Digital Principles & System Design", 3, "A", 8, false),
                new PastSubject(sem2.getId(), "EN1201", "Technical English & Professional Communication", 2, "A+", 9, false),
                new PastSubject(sem2.getId(), "CS1281", "C Programming & Data Structures Lab", 2, "O", 10, false),
                new PastSubject(sem2.getId(), "EE1281", "Electrical & Electronics Engineering Lab", 2, "A", 8, false)
        ));

        // Sem 3 (SGPA 8.70, CGPA 8.74)
        PastSemester sem3 = pastSemesterRepository.save(new PastSemester(DEMO_STUDENT_ID, 3, "Fall 2024", 8.70, 8.74, 20));
        pastSubjectRepository.saveAll(List.of(
                new PastSubject(sem3.getId(), "MA2101", "Discrete Mathematics & Graph Theory", 4, "A", 8, false),
                new PastSubject(sem3.getId(), "CS2101", "Object Oriented Programming (Java)", 3, "O", 10, false),
                new PastSubject(sem3.getId(), "CS2102", "Computer Architecture & Organization", 4, "B+", 7, false),
                new PastSubject(sem3.getId(), "CS2103", "Data Structures & Advanced Algorithms", 4, "A+", 9, false),
                new PastSubject(sem3.getId(), "CS2104", "Software Engineering Fundamentals", 3, "A", 8, false),
                new PastSubject(sem3.getId(), "CS2181", "Java & Object Technologies Laboratory", 2, "O", 10, false)
        ));

        // Sem 4 (SGPA 8.32, CGPA 8.63)
        PastSemester sem4 = pastSemesterRepository.save(new PastSemester(DEMO_STUDENT_ID, 4, "Spring 2025", 8.32, 8.63, 19));
        pastSubjectRepository.saveAll(List.of(
                new PastSubject(sem4.getId(), "MA2201", "Probability, Statistics & Queuing Theory", 4, "B+", 7, false),
                new PastSubject(sem4.getId(), "CS2201", "Database Management Systems", 4, "A+", 9, false),
                new PastSubject(sem4.getId(), "CS2202", "Design & Analysis of Algorithms", 4, "A", 8, false),
                new PastSubject(sem4.getId(), "CS2203", "Operating Systems Principles", 3, "B+", 7, false),
                new PastSubject(sem4.getId(), "CS2204", "Environmental Science & Sustainability", 2, "A", 8, false),
                new PastSubject(sem4.getId(), "CS2281", "DBMS & Algorithm Design Lab", 2, "A+", 9, false)
        ));

        // Sem 5 (SGPA 8.95, CGPA 8.70)
        PastSemester sem5 = pastSemesterRepository.save(new PastSemester(DEMO_STUDENT_ID, 5, "Fall 2025", 8.95, 8.70, 20));
        pastSubjectRepository.saveAll(List.of(
                new PastSubject(sem5.getId(), "CS3101", "Theory of Computation & Automata", 4, "A", 8, false),
                new PastSubject(sem5.getId(), "CS3102", "Computer Networks & Internet Protocols", 4, "A+", 9, false),
                new PastSubject(sem5.getId(), "CS3103", "Microprocessors & Embedded Interfacing", 3, "B+", 7, false),
                new PastSubject(sem5.getId(), "CS3104", "Web Technologies & Full-Stack Development", 3, "O", 10, false),
                new PastSubject(sem5.getId(), "CS3105", "Professional Ethics in Engineering", 2, "A+", 9, false),
                new PastSubject(sem5.getId(), "CS3181", "Computer Networks & Web Applications Lab", 2, "O", 10, false),
                new PastSubject(sem5.getId(), "CS3182", "Mini Project & Technical Seminar", 2, "A+", 9, false)
        ));
    }
}
