package com.campusconnect.service;

import com.campusconnect.dto.DayStudyPlanDto;
import com.campusconnect.dto.StudyPlanResultDto;
import com.campusconnect.dto.StudyPlanTaskDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final SyllabusUnitRepository syllabusUnitRepository;
    private final StudentUnitProgressRepository studentUnitProgressRepository;
    private final SubjectRepository subjectRepository;
    private final MarkRecordRepository markRecordRepository;
    private final StudentSettingsRepository studentSettingsRepository;

    public ExamService(
            ExamRepository examRepository,
            SyllabusUnitRepository syllabusUnitRepository,
            StudentUnitProgressRepository studentUnitProgressRepository,
            SubjectRepository subjectRepository,
            MarkRecordRepository markRecordRepository,
            StudentSettingsRepository studentSettingsRepository) {
        this.examRepository = examRepository;
        this.syllabusUnitRepository = syllabusUnitRepository;
        this.studentUnitProgressRepository = studentUnitProgressRepository;
        this.subjectRepository = subjectRepository;
        this.markRecordRepository = markRecordRepository;
        this.studentSettingsRepository = studentSettingsRepository;
    }

    public List<Exam> getExams(String studentId) {
        return examRepository.findByStudentId(studentId).stream()
                .sorted(Comparator.comparing(Exam::getExamDate))
                .collect(Collectors.toList());
    }

    @Transactional
    public Exam createExam(String studentId, Exam exam) {
        exam.setStudentId(studentId);
        if (exam.getId() == null || exam.getId().isBlank()) {
            exam.setId("exam-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return examRepository.save(exam);
    }

    public List<SyllabusUnit> getSyllabusUnits() {
        return syllabusUnitRepository.findAll().stream()
                .sorted(Comparator.comparing(SyllabusUnit::getSubjectId).thenComparingInt(SyllabusUnit::getUnitNo))
                .collect(Collectors.toList());
    }

    public Map<String, Boolean> getStudentUnitProgress(String studentId) {
        Map<String, Boolean> progressMap = new HashMap<>();
        List<StudentUnitProgress> records = studentUnitProgressRepository.findByStudentId(studentId);
        for (StudentUnitProgress r : records) {
            progressMap.put(r.getUnitId(), r.isCompleted());
        }
        return progressMap;
    }

    @Transactional
    public boolean toggleUnitProgress(String studentId, String unitId) {
        Optional<StudentUnitProgress> existing = studentUnitProgressRepository.findByStudentIdAndUnitId(studentId, unitId);
        if (existing.isPresent()) {
            StudentUnitProgress rec = existing.get();
            rec.setCompleted(!rec.isCompleted());
            studentUnitProgressRepository.save(rec);
            return rec.isCompleted();
        } else {
            StudentUnitProgress newRec = new StudentUnitProgress(studentId, unitId, true);
            studentUnitProgressRepository.save(newRec);
            return true;
        }
    }

    public StudyPlanResultDto buildStudyPlan(String studentId, Integer dailyHoursOverride) {
        int dailyHoursCap = 4;
        if (dailyHoursOverride != null && dailyHoursOverride > 0) {
            dailyHoursCap = dailyHoursOverride;
        } else {
            dailyHoursCap = studentSettingsRepository.findById(studentId)
                    .map(StudentSettings::getDailyStudyHours)
                    .orElse(4);
        }
        dailyHoursCap = Math.max(1, dailyHoursCap);

        LocalDate now = LocalDate.now();
        List<Exam> exams = examRepository.findByStudentId(studentId).stream()
                .sorted(Comparator.comparing(Exam::getExamDate))
                .collect(Collectors.toList());

        List<Subject> subjects = subjectRepository.findAll();
        List<SyllabusUnit> allUnits = syllabusUnitRepository.findAll();
        Map<String, Boolean> progress = getStudentUnitProgress(studentId);
        List<MarkRecord> marks = markRecordRepository.findByStudentId(studentId);

        Map<String, Double> subjectMarks = new HashMap<>();
        for (MarkRecord m : marks) {
            subjectMarks.put(m.getSubjectId(), m.getTotalInternal());
        }

        // Internal unit holder
        class RemainingUnit {
            final SyllabusUnit unit;
            final long examDaysLeft;
            final double markScore;

            RemainingUnit(SyllabusUnit unit, long examDaysLeft, double markScore) {
                this.unit = unit;
                this.examDaysLeft = examDaysLeft;
                this.markScore = markScore;
            }
        }

        List<RemainingUnit> remainingUnits = new ArrayList<>();
        List<Map<String, Object>> atRiskSubjects = new ArrayList<>();

        for (Subject sub : subjects) {
            Exam exam = exams.stream().filter(e -> e.getSubjectId().equals(sub.getId())).findFirst().orElse(null);
            LocalDate examDate = (exam != null && exam.getExamDate() != null)
                    ? LocalDate.parse(exam.getExamDate())
                    : now.plusDays(30);

            long daysLeft = Math.max(1, ChronoUnit.DAYS.between(now, examDate));
            double markScore = subjectMarks.getOrDefault(sub.getId(), 40.0);

            List<SyllabusUnit> subUnits = allUnits.stream()
                    .filter(u -> u.getSubjectId().equals(sub.getId()))
                    .collect(Collectors.toList());

            int uncoveredHrs = 0;
            for (SyllabusUnit u : subUnits) {
                if (!progress.getOrDefault(u.getId(), false)) {
                    remainingUnits.add(new RemainingUnit(u, daysLeft, markScore));
                    uncoveredHrs += u.getEstHours();
                }
            }

            if (uncoveredHrs > daysLeft * (dailyHoursCap / 2.0)) {
                Map<String, Object> risk = new HashMap<>();
                risk.put("code", sub.getCode());
                risk.put("name", sub.getName());
                risk.put("uncoveredHours", uncoveredHrs);
                atRiskSubjects.add(risk);
            }
        }

        // Sort remaining units:
        // 1. Nearest exam date (fewer days left)
        // 2. Lower internal mark (needs more help)
        // 3. Lower unit number
        remainingUnits.sort(Comparator
                .comparingLong((RemainingUnit r) -> r.examDaysLeft)
                .thenComparingDouble(r -> r.markScore)
                .thenComparingInt(r -> r.unit.getUnitNo()));

        // Schedule next 7 days
        List<DayStudyPlanDto> days = new ArrayList<>();
        Queue<RemainingUnit> unitQueue = new LinkedList<>(remainingUnits);
        double totalAllocatedHours = 0;
        DateTimeFormatter monthDayFmt = DateTimeFormatter.ofPattern("MMM d");

        for (int i = 0; i < 7; i++) {
            LocalDate d = now.plusDays(i);
            String dateString = d.format(monthDayFmt);
            String dayName = (i == 0) ? "Today" : (i == 1) ? "Tomorrow" : "Day " + (i + 1);

            // Check if an exam happens tomorrow or in 2 days -> reserve revision
            Exam nearExam = exams.stream().filter(e -> {
                if (e.getExamDate() == null) return false;
                LocalDate eDate = LocalDate.parse(e.getExamDate());
                long diff = ChronoUnit.DAYS.between(d, eDate);
                return diff == 1 || diff == 2;
            }).findFirst().orElse(null);

            List<StudyPlanTaskDto> dayTasks = new ArrayList<>();
            double hoursLeft = dailyHoursCap;

            if (nearExam != null) {
                double revHours = Math.min(hoursLeft, dailyHoursCap);
                dayTasks.add(new StudyPlanTaskDto(
                        nearExam.getSubjectId(),
                        nearExam.getSubjectCode(),
                        nearExam.getSubjectName(),
                        "rev-" + nearExam.getId(),
                        0,
                        "Final Syllabus Revision & PYQ Mock Drill",
                        revHours,
                        true
                ));
                hoursLeft -= revHours;
            } else {
                while (hoursLeft >= 1 && !unitQueue.isEmpty()) {
                    RemainingUnit nextUnit = unitQueue.poll();
                    Subject sub = subjects.stream().filter(s -> s.getId().equals(nextUnit.unit.getSubjectId())).findFirst().orElse(null);
                    String subCode = (sub != null) ? sub.getCode() : "";
                    String subName = (sub != null) ? sub.getName() : "";
                    double taskHours = Math.min(nextUnit.unit.getEstHours(), hoursLeft);

                    dayTasks.add(new StudyPlanTaskDto(
                            nextUnit.unit.getSubjectId(),
                            subCode,
                            subName,
                            nextUnit.unit.getId(),
                            nextUnit.unit.getUnitNo(),
                            "Unit " + nextUnit.unit.getUnitNo() + ": " + nextUnit.unit.getTitle(),
                            Math.round(taskHours * 10.0) / 10.0,
                            false
                    ));

                    hoursLeft -= taskHours;
                    if (nextUnit.unit.getEstHours() - taskHours > 0.5) {
                        // Create leftover unit
                        SyllabusUnit leftover = new SyllabusUnit(
                                nextUnit.unit.getId(),
                                nextUnit.unit.getSubjectId(),
                                nextUnit.unit.getUnitNo(),
                                nextUnit.unit.getTitle(),
                                (int) Math.round(nextUnit.unit.getEstHours() - taskHours)
                        );
                        // Add back to front of queue
                        LinkedList<RemainingUnit> list = (LinkedList<RemainingUnit>) unitQueue;
                        list.addFirst(new RemainingUnit(leftover, nextUnit.examDaysLeft, nextUnit.markScore));
                        break;
                    }
                }
            }

            double dayHours = Math.round((dailyHoursCap - hoursLeft) * 10.0) / 10.0;
            totalAllocatedHours += dayHours;
            days.add(new DayStudyPlanDto(dayName, dateString, dayHours, dayTasks));
        }

        return new StudyPlanResultDto(
                dailyHoursCap,
                Math.round(totalAllocatedHours * 10.0) / 10.0,
                remainingUnits.size(),
                atRiskSubjects,
                days
        );
    }
}
