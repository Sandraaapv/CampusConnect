package com.campusconnect.service;

import com.campusconnect.dto.FacultyDto;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final FacultySubjectRepository facultySubjectRepository;
    private final FacultyOfficeHourRepository officeHourRepository;
    private final SubjectRepository subjectRepository;
    private final ObjectMapper objectMapper;

    public FacultyService(
            FacultyRepository facultyRepository,
            FacultySubjectRepository facultySubjectRepository,
            FacultyOfficeHourRepository officeHourRepository,
            SubjectRepository subjectRepository) {
        this.facultyRepository = facultyRepository;
        this.facultySubjectRepository = facultySubjectRepository;
        this.officeHourRepository = officeHourRepository;
        this.subjectRepository = subjectRepository;
        this.objectMapper = new ObjectMapper();
    }

    public List<FacultyDto> getAllFaculty() {
        List<Faculty> list = facultyRepository.findAll();
        if (list.isEmpty()) {
            seedDefaultFaculty();
            list = facultyRepository.findAll();
        }
        return list.stream().map(this::toDto).toList();
    }

    public List<FacultyDto> getMyFaculty(String studentId) {
        List<FacultyDto> all = getAllFaculty();
        List<Subject> mySubjects = subjectRepository.findAll();
        Set<String> myCodes = new HashSet<>();
        for (Subject s : mySubjects) {
            myCodes.add(s.getCode());
        }

        return all.stream().filter(f ->
                f.getSubjects() != null && f.getSubjects().stream().anyMatch(sub -> myCodes.contains(sub.getCode()))
        ).toList();
    }

    public FacultyDto getFacultyById(String id) {
        return facultyRepository.findById(id).map(this::toDto).orElse(null);
    }

    private FacultyDto toDto(Faculty f) {
        List<String> specs = new ArrayList<>();
        if (f.getSpecializationsJson() != null && !f.getSpecializationsJson().isBlank()) {
            try {
                specs = objectMapper.readValue(f.getSpecializationsJson(), new TypeReference<List<String>>() {});
            } catch (Exception ignored) {}
        }

        List<FacultySubject> subs = facultySubjectRepository.findByFacultyId(f.getId());
        List<FacultyDto.SubjectRef> subjectRefs = subs.stream()
                .map(s -> new FacultyDto.SubjectRef(s.getSubjectId(), s.getSubjectCode(), s.getSubjectName()))
                .toList();

        List<FacultyOfficeHour> ohs = officeHourRepository.findByFacultyId(f.getId());
        List<FacultyDto.OfficeHourRef> ohRefs = ohs.stream()
                .map(o -> new FacultyDto.OfficeHourRef(o.getDay(), o.getStartTime(), o.getEndTime()))
                .toList();

        return new FacultyDto(
                f.getId(), f.getName(), f.getDesignation(), f.getDepartment(),
                f.getEmail(), f.getCabin(), specs, f.getBio(),
                subjectRefs, ohRefs
        );
    }

    private synchronized void seedDefaultFaculty() {
        if (!facultyRepository.findAll().isEmpty()) return;

        Faculty f1 = new Faculty(
                "fac-ramesh", "Dr. Ramesh Kumar", "Professor & Head of Department", "Computer Science & Engineering",
                "ramesh.kumar@campusconnect.edu", "CS Block, Room 301 (HOD Office)",
                "[\"Computer Networks\", \"Wireless Sensor Networks\", \"Network Security\"]",
                "Ph.D. from IIT Madras. 18+ years of academic research in software-defined networking and distributed protocols."
        );
        Faculty f2 = new Faculty(
                "fac-ananya", "Prof. Ananya Sen", "Associate Professor", "Computer Science & Engineering",
                "ananya.sen@campusconnect.edu", "CS Block, Room 208",
                "[\"Design & Analysis of Algorithms\", \"Computational Complexity\", \"Graph Algorithms\"]",
                "M.Tech from IISc Bangalore. Coach for ACM ICPC regional finalists with active industry consulting in algorithmic optimization."
        );
        Faculty f3 = new Faculty(
                "fac-srinivasan", "Dr. V. Srinivasan", "Professor", "Computer Science & Engineering",
                "v.srinivasan@campusconnect.edu", "CS Block, Room 314",
                "[\"Operating Systems\", \"Kernel Architecture\", \"Distributed Systems\"]",
                "22+ years in academia. Former system architect at Sun Microsystems. Lead researcher in high-performance virtual memory management."
        );
        Faculty f4 = new Faculty(
                "fac-meera", "Dr. Meera Patel", "Associate Professor", "Computer Science & Engineering",
                "meera.patel@campusconnect.edu", "CS Block, Room 212",
                "[\"Database Management Systems\", \"Big Data Engineering\", \"NoSQL Architectures\"]",
                "Ph.D. in Data Engineering. Author of 24 international IEEE journal papers on distributed query optimization and B-Tree indexing."
        );

        facultyRepository.saveAll(List.of(f1, f2, f3, f4));

        facultySubjectRepository.saveAll(List.of(
                new FacultySubject("fac-ramesh", "sub-cn", "CS3604", "Computer Networks"),
                new FacultySubject("fac-ananya", "sub-dsa", "CS3601", "Data Structures & Algorithms"),
                new FacultySubject("fac-srinivasan", "sub-os", "CS3602", "Operating Systems"),
                new FacultySubject("fac-meera", "sub-dbms", "CS3603", "Database Management Systems")
        ));

        officeHourRepository.saveAll(List.of(
                new FacultyOfficeHour("fac-ramesh", "Monday", "14:00", "16:00"),
                new FacultyOfficeHour("fac-ramesh", "Wednesday", "15:00", "17:00"),
                new FacultyOfficeHour("fac-ananya", "Tuesday", "11:00", "13:00"),
                new FacultyOfficeHour("fac-ananya", "Thursday", "14:00", "16:00"),
                new FacultyOfficeHour("fac-srinivasan", "Monday", "11:00", "13:00"),
                new FacultyOfficeHour("fac-srinivasan", "Wednesday", "14:00", "16:00"),
                new FacultyOfficeHour("fac-meera", "Tuesday", "14:00", "16:00"),
                new FacultyOfficeHour("fac-meera", "Friday", "10:00", "12:00")
        ));
    }
}
