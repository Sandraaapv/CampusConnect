package com.campusconnect;

import com.campusconnect.dto.PredictMarksResultDto;
import com.campusconnect.model.MarkRecord;
import com.campusconnect.model.PastSemester;
import com.campusconnect.model.Subject;
import com.campusconnect.repository.MarkRecordRepository;
import com.campusconnect.repository.PastSemesterRepository;
import com.campusconnect.repository.StudentSettingsRepository;
import com.campusconnect.repository.SubjectRepository;
import com.campusconnect.service.MarksService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class MarksServiceTest {

    @Test
    @DisplayName("SRM 2021 marks predictor: achievable target vs impossible target")
    void testMarksPrediction() {
        SubjectRepository subRepo = Mockito.mock(SubjectRepository.class);
        MarkRecordRepository markRepo = Mockito.mock(MarkRecordRepository.class);
        PastSemesterRepository pastRepo = Mockito.mock(PastSemesterRepository.class);
        StudentSettingsRepository settingsRepo = Mockito.mock(StudentSettingsRepository.class);

        Subject sub1 = new Subject("sub-1", "CS101", "Programming", 4, "Prof X", 80);
        Subject sub2 = new Subject("sub-2", "CS102", "Low Internals Sub", 4, "Prof Y", 80);
        when(subRepo.findAll()).thenReturn(List.of(sub1, sub2));

        // sub1: 45/50 internals -> 45/50 * 100 * 0.5 = 45% contribution
        // target O grade (91%): needed = (91 - 45) / 0.5 = 92 marks out of 100 -> Achievable!
        MarkRecord m1 = new MarkRecord("student-1", "sub-1", 23, 22, 9, 45, 50, 4, "college");

        // sub2: 20/50 internals -> 20/50 * 100 * 0.5 = 20% contribution
        // target O grade (91%): needed = (91 - 20) / 0.5 = 142 marks out of 100 -> Impossible!
        MarkRecord m2 = new MarkRecord("student-1", "sub-2", 10, 10, 0, 20, 50, 4, "college");

        when(markRepo.findByStudentId("student-1")).thenReturn(List.of(m1, m2));
        when(settingsRepo.findById("student-1")).thenReturn(java.util.Optional.empty());

        MarksService marksService = new MarksService(markRepo, subRepo, pastRepo, settingsRepo);

        List<PredictMarksResultDto> predictions = marksService.predictMarks("student-1", 10.0); // Target O (10 pts)

        assertEquals(2, predictions.size());

        PredictMarksResultDto p1 = predictions.stream().filter(p -> p.getSubject().getId().equals("sub-1")).findFirst().orElseThrow();
        assertFalse(p1.getIsImpossible());
        assertEquals(92, p1.getNeededMarksOutOf100());

        PredictMarksResultDto p2 = predictions.stream().filter(p -> p.getSubject().getId().equals("sub-2")).findFirst().orElseThrow();
        assertTrue(p2.getIsImpossible());
        assertTrue(p2.getNeededMarksOutOf100() > 100);
    }

    @Test
    @DisplayName("Credit-weighted CGPA across past semesters")
    void testCumulativeCgpaCalculation() {
        PastSemesterRepository pastRepo = Mockito.mock(PastSemesterRepository.class);
        MarksService marksService = new MarksService(null, null, pastRepo, null);

        // Sem 1: 18 credits, 8.83 SGPA = 158.94 points
        // Sem 2: 19 credits, 8.68 SGPA = 164.92 points
        // Total = 37 credits, 323.86 points -> 8.75 CGPA
        PastSemester s1 = new PastSemester("student-1", 1, "Fall 2023", 8.83, 8.83, 18);
        PastSemester s2 = new PastSemester("student-1", 2, "Spring 2024", 8.68, 8.76, 19);

        when(pastRepo.findByStudentIdOrderBySemesterAsc("student-1")).thenReturn(List.of(s1, s2));

        double cgpa = marksService.getCumulativeCgpa("student-1");
        assertEquals(8.75, cgpa);
    }
}
