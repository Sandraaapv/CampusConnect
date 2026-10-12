package com.campusconnect.controller;

import com.campusconnect.model.TimetableSlot;
import com.campusconnect.repository.TimetableSlotRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/timetable")
public class TimetableController {

    private final TimetableSlotRepository timetableSlotRepository;

    public TimetableController(TimetableSlotRepository timetableSlotRepository) {
        this.timetableSlotRepository = timetableSlotRepository;
    }

    @GetMapping
    public ResponseEntity<List<TimetableSlot>> getTimetable() {
        return ResponseEntity.ok(timetableSlotRepository.findAll());
    }

    @GetMapping("/ics")
    public ResponseEntity<String> getTimetableIcs() {
        List<TimetableSlot> slots = timetableSlotRepository.findAll();
        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//CampusConnect//Academic Timetable//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n");
        for (TimetableSlot slot : slots) {
            ics.append("BEGIN:VEVENT\r\n");
            ics.append("UID:").append(slot.getId()).append("@campusconnect\r\n");
            ics.append("SUMMARY:").append(slot.getSubjectName()).append(" (").append(slot.getSubjectCode()).append(")\r\n");
            ics.append("DESCRIPTION:Faculty: ").append(slot.getFacultyName()).append(" | Type: ").append(slot.getSlotType()).append("\r\n");
            ics.append("LOCATION:").append(slot.getRoom()).append("\r\n");
            ics.append("END:VEVENT\r\n");
        }
        ics.append("END:VCALENDAR\r\n");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"timetable.ics\"")
                .contentType(MediaType.parseMediaType("text/calendar; charset=utf-8"))
                .body(ics.toString());
    }
}
