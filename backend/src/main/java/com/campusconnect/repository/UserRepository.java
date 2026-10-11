package com.campusconnect.repository;

import com.campusconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:identifier) OR LOWER(u.studentRecord.registerNumber) = LOWER(:identifier)")
    Optional<User> findByIdentifier(@Param("identifier") String identifier);

    boolean existsByEmailIgnoreCase(String email);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.studentRecord.registerNumber) = LOWER(:regNo)")
    boolean existsByRegisterNumberIgnoreCase(@Param("regNo") String regNo);
}
