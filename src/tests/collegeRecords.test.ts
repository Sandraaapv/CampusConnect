import { describe, it, expect } from 'vitest';
import {
  calculateSafeSkips,
  calculateClassesToRecover,
  computeCollegeTotalInternal,
  buildStudyPlan,
  INITIAL_STUDENT_UNIT_PROGRESS,
  getAcademicHistoryForStudent,
  calculateCumulativeCgpa,
} from '../services/collegeRecords';

describe('College Records & Academic Calculations', () => {
  describe('Attendance Formulas & Edge Cases', () => {
    it('calculates safe skips accurately for standard case', () => {
      // 80 attended out of 90 classes at 75% threshold
      // 80 / 0.75 - 90 = 106.666 - 90 = 16 skips
      const skips = calculateSafeSkips(80, 90, 75);
      expect(skips).toBe(16);
    });

    it('returns 0 safe skips when attendance is at or below threshold', () => {
      // 74 attended out of 100 classes (74%)
      const skips = calculateSafeSkips(74, 100, 75);
      expect(skips).toBe(0);
    });

    it('handles edge case of total = 0 without error or division by zero', () => {
      expect(calculateSafeSkips(0, 0, 75)).toBe(0);
      expect(calculateClassesToRecover(0, 0, 75)).toBe(0);
    });

    it('calculates classes needed to recover attendance correctly', () => {
      // 29 attended of 39 held = 74.35%.
      // Formula for 75%: ceil((75 * 39 - 100 * 29) / 25) = ceil((2925 - 2900) / 25) = ceil(25 / 25) = 1 class!
      const needed = calculateClassesToRecover(29, 39, 75);
      expect(needed).toBe(1);
    });

    it('returns 0 classes needed when already above threshold', () => {
      const needed = calculateClassesToRecover(35, 40, 75); // 87.5%
      expect(needed).toBe(0);
    });
  });

  describe('Internal Assessments Formula & Capping Guarantee', () => {
    it('computes total internal score with proper scaling (max 50)', () => {
      // 25 in Internal 1, 25 in Internal 2 => (50/50)*40 = 40.
      // Assignment = 10. Total = 40 + 10 = 50.
      const total = computeCollegeTotalInternal(25, 25, 10);
      expect(total).toBe(50);
    });

    it('never exceeds 50 even if out-of-range values are submitted', () => {
      const total = computeCollegeTotalInternal(30, 30, 15);
      expect(total).toBeLessThanOrEqual(50);
      expect(total).toBe(50);
    });

    it('scales partial internal marks accurately', () => {
      // 20 and 20 internals = 40/50 * 40 = 32. Assignment = 8. Total = 40.
      const total = computeCollegeTotalInternal(20, 20, 8);
      expect(total).toBe(40);
    });
  });

  describe('Study Planner Algorithm', () => {
    it('respects daily study hours cap for all days', () => {
      const dailyCap = 4;
      const plan = buildStudyPlan(dailyCap, INITIAL_STUDENT_UNIT_PROGRESS);

      expect(plan.days.length).toBe(7);
      plan.days.forEach((day) => {
        expect(day.totalHours).toBeLessThanOrEqual(dailyCap);
      });
    });

    it('generates distinct units on different days (no repeating identical block)', () => {
      const plan = buildStudyPlan(4, INITIAL_STUDENT_UNIT_PROGRESS);
      const day1Tasks = plan.days[0].tasks.map((t) => t.unitId);
      const day2Tasks = plan.days[1].tasks.map((t) => t.unitId);

      // Verify days do not repeat the exact same task set
      const isIdentical =
        day1Tasks.length === day2Tasks.length &&
        day1Tasks.every((id, idx) => id === day2Tasks[idx]);
      expect(isIdentical).toBe(false);
    });

    it('prioritizes units for nearer exams first', () => {
      const plan = buildStudyPlan(5, INITIAL_STUDENT_UNIT_PROGRESS);
      // Computer Networks is the first upcoming exam (Oct 24)
      const firstDayTasks = plan.days[0].tasks;
      expect(firstDayTasks.length).toBeGreaterThan(0);
      expect(firstDayTasks[0].subjectCode).toBe('CS3604'); // CN
    });

    it('re-plans dynamically when units are ticked by the student', () => {
      const originalPlan = buildStudyPlan(4, INITIAL_STUDENT_UNIT_PROGRESS);
      const updatedProgress = {
        ...INITIAL_STUDENT_UNIT_PROGRESS,
        'u-cn-3': true,
        'u-cn-4': true,
      };
      const newPlan = buildStudyPlan(4, updatedProgress);

      // Ticking units should change remaining hours or scheduled units
      expect(newPlan.totalAllocatedHours).toBeLessThanOrEqual(originalPlan.totalAllocatedHours);
    });
  });

  describe('Academic History (College Records - Read Only)', () => {
    it('seeds history for every completed semester (1 to currentSemester - 1)', () => {
      // Demo student is in Semester 6: should have Semesters 1, 2, 3, 4, 5
      const history = getAcademicHistoryForStudent(6);
      expect(history.length).toBe(5);
      expect(history.map((s) => s.semester)).toEqual([1, 2, 3, 4, 5]);

      // Verify each semester has subjects, credits, and SGPA
      history.forEach((sem) => {
        expect(sem.subjects.length).toBeGreaterThan(0);
        expect(sem.totalCredits).toBeGreaterThan(0);
        expect(sem.sgpa).toBeGreaterThan(0);
        expect(sem.cumulativeCgpa).toBeGreaterThan(0);
      });
    });

    it('is generic so a student in any semester gets all their earlier ones', () => {
      // Semester 1: no earlier completed semesters
      expect(getAcademicHistoryForStudent(1)).toHaveLength(0);

      // Semester 2: gets semester 1
      const sem2Student = getAcademicHistoryForStudent(2);
      expect(sem2Student).toHaveLength(1);
      expect(sem2Student[0].semester).toBe(1);

      // Semester 4: gets semesters 1, 2, 3
      const sem4Student = getAcademicHistoryForStudent(4);
      expect(sem4Student).toHaveLength(3);
      expect(sem4Student.map((s) => s.semester)).toEqual([1, 2, 3]);

      // Semester 8: gets semesters 1 through 7
      const sem8Student = getAcademicHistoryForStudent(8);
      expect(sem8Student).toHaveLength(7);
      expect(sem8Student.map((s) => s.semester)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('calculates CGPA cumulatively across all completed semesters (not just most recent)', () => {
      const history = getAcademicHistoryForStudent(6);
      const cgpa = calculateCumulativeCgpa(history);

      // Manual verification:
      // Sem 1: 19 cr, 165 pts
      // Sem 2: 20 cr, 167 pts
      // Sem 3: 20 cr, 170 pts
      // Sem 4: 19 cr, 151 pts
      // Sem 5: 20 cr, 175 pts
      // Total: 98 cr, 828 pts => 828 / 98 = 8.4489... => 8.45
      expect(cgpa).toBe(8.45);

      // Cumulative CGPA in the 5th semester record matches overall cumulative CGPA
      expect(history[4].cumulativeCgpa).toBe(8.45);
    });

    it('includes arrears according to configurable college rule', () => {
      // Create a mock semester history with an arrear subject
      const mockHistory = [
        {
          semester: 1,
          term: 'Fall',
          sgpa: 6.0,
          cumulativeCgpa: 6.0,
          totalCredits: 10,
          subjects: [
            { code: 'CS101', name: 'Intro CS', credits: 4, grade: 'A', gradePoints: 8 }, // 32 pts
            { code: 'MA101', name: 'Calculus', credits: 4, grade: 'B', gradePoints: 6 }, // 24 pts
            { code: 'PH101', name: 'Physics', credits: 2, grade: 'RA', gradePoints: 0, isArrear: true }, // 0 pts
          ],
        },
      ];

      // Rule: Arrears included in credits denominator (Standard college rule)
      // Total pts = 32 + 24 + 0 = 56. Total credits = 4 + 4 + 2 = 10. CGPA = 56 / 10 = 5.60
      const cgpaWithArrearsInCredits = calculateCumulativeCgpa(mockHistory, {
        arrearsCountedInCredits: true,
      });
      expect(cgpaWithArrearsInCredits).toBe(5.6);

      // Rule: Arrears excluded from credits denominator until cleared
      // Total pts = 56. Total credits = 4 + 4 = 8. CGPA = 56 / 8 = 7.00
      const cgpaWithoutArrearsInCredits = calculateCumulativeCgpa(mockHistory, {
        arrearsCountedInCredits: false,
      });
      expect(cgpaWithoutArrearsInCredits).toBe(7.0);
    });
  });
});
