package com.campusconnect.repository;

import com.campusconnect.model.Circular;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CircularRepository extends JpaRepository<Circular, String> {

    @Query("SELECT c FROM Circular c WHERE " +
           "(:dept IS NULL OR :dept = '' OR LOWER(c.department) = LOWER(:dept)) AND " +
           "(:sem IS NULL OR c.semester IS NULL OR c.semester = :sem) AND " +
           "(:q IS NULL OR :q = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.content) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.tags) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "ORDER BY c.date DESC")
    List<Circular> searchCirculars(@Param("dept") String dept, @Param("sem") Integer sem, @Param("q") String q);
}
