package com.campusconnect.service;

import com.campusconnect.model.Circular;
import com.campusconnect.repository.CircularRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CircularService {

    private final CircularRepository circularRepository;

    public CircularService(CircularRepository circularRepository) {
        this.circularRepository = circularRepository;
    }

    public List<Circular> getCirculars(String dept, Integer sem, String query) {
        return circularRepository.searchCirculars(dept, sem, query);
    }
}
