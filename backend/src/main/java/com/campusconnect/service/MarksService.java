package com.campusconnect.service;

import com.campusconnect.dto.PredictMarksResultDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MarksService {

    private final MarkRecordRepository markRecordRepository;
    private final SubjectRepository subjectRepository;
    private final PastSemesterRepository pastSemesterRepository;
    private final StudentSettingsRepository studentSettingsRepository;

    public static class GradeThreshold {
        public final String grade;
        public final int minPercent;
        public final int points;

        public GradeThreshold(String grade, int minPercent, int points) {
            this.grade = grade;
            this.minPercent = minPercent;
            this.points = points;
        }
    }

    // SRM 2021 Rules: O 91+, A+ 81+, A 71+, B+ 61+, B 56+, C 50+, F below 50
    public static final List<GradeThreshold> SRM_GRADING_SCHEME = List.of(
            new GradeThreshold("O (Outstanding)", 91, 10),
            new GradeThreshold("A+ (Excellent)", 81, 9),
            new GradeThreshold("A (Very Good)", 71, 8),
            new GradeThreshold("B+ (Good)", 61, 7),
            new GradeThreshold("B (Above Average)", 56, 6),
            new GradeThreshold("C (Average)", 50, 5),
            new GradeThreshold("F (Fail)", 0, 0)
    );

    public MarksService(
            MarkRecordRepository markRecordRepository,
            SubjectRepository subjectRepository,
            PastSemesterRepository pastSemesterRepository,
            StudentSettingsRepository studentSettingsRepository) {
        this.markRecordRepository = markRecordRepository;
        this.subjectRepository = subjectRepository;
        this.pastSemesterRepository = pastSemesterRepository;
        this.studentSettingsRepository = studentSettingsRepository;
    }

    public List<MarkRecord> getMarks(String studentId) {
        return markRecordRepository.findByStudentId(studentId);
    }

    public List<PastSemester> getAcademicHistory(String studentId) {
        return pastSemesterRepository.findByStudentIdOrderBySemesterAsc(studentId);
    }

    public double getCumulativeCgpa(String studentId) {
        List<PastSemester> history = getAcademicHistory(studentId);
        if (history.isEmpty()) return 0.0;

        int totalCredits = 0;
        double weightedPoints = 0.0;

        for (PastSemester sem : history) {
            totalCredits += sem.getTotalCredits();
            weightedPoints += sem.getSgpa() * sem.getTotalCredits();
        }

        return totalCredits > 0 ? Math.round((weightedPoints / totalCredits) * 100.0) / 100.0 : 0.0;
    }

    public List<PredictMarksResultDto> predictMarks(String studentId, double targetCgpa) {
        StudentSettings settings = studentSettingsRepository.findById(studentId)
                .orElse(new StudentSettings(studentId, 75, targetCgpa, 4, 50, 50, null, "system"));

        double internalWeight = (settings.getInternalWeight() > 0 ? settings.getInternalWeight() : 50) / 100.0;
        double endSemWeight = (settings.getEndSemWeight() > 0 ? settings.getEndSemWeight() : 50) / 100.0;

        List<Subject> subjects = subjectRepository.findAll();
        List<MarkRecord> marks = markRecordRepository.findByStudentId(studentId);
        List<PredictMarksResultDto> results = new ArrayList<>();

        for (Subject sub : subjects) {
            MarkRecord mark = marks.stream()
                    .filter(m -> m.getSubjectId().equals(sub.getId()))
                    .findFirst()
                    .orElse(new MarkRecord(studentId, sub.getId(), 20, 20, 8, 40, 50, sub.getCredits(), "college"));

            GradeThreshold matchingGrade = SRM_GRADING_SCHEME.stream()
                    .filter(g -> g.points <= targetCgpa)
                    .findFirst()
                    .orElse(SRM_GRADING_SCHEME.get(SRM_GRADING_SCHEME.size() - 2)); // C

            int targetPercent = matchingGrade.minPercent;

            // internalContribution = (totalInternal / 50.0) * 100.0 * internalWeight
            double internalContribution = (mark.getTotalInternal() / 50.0) * 100.0 * internalWeight;
            double neededEndSemPercent = (targetPercent - internalContribution) / endSemWeight;
            int neededMarksOutOf100 = (int) Math.ceil(neededEndSemPercent);

            boolean isImpossible = neededMarksOutOf100 > 100;
            double maxAchievablePercent = internalContribution + (100.0 * endSemWeight);

            GradeThreshold bestGrade = SRM_GRADING_SCHEME.stream()
                    .filter(g -> maxAchievablePercent >= g.minPercent)
                    .findFirst()
                    .orElse(SRM_GRADING_SCHEME.get(SRM_GRADING_SCHEME.size() - 1));

            results.add(new PredictMarksResultDto(
                    sub,
                    mark,
                    targetCgpa,
                    matchingGrade.grade,
                    Math.max(0, neededMarksOutOf100),
                    isImpossible,
                    bestGrade.points,
                    bestGrade.grade
            ));
        }

        return results;
    }
}
