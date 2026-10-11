package com.campusconnect.repository;

import com.campusconnect.model.LoginEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginEventRepository extends JpaRepository<LoginEvent, Long> {
    List<LoginEvent> findTop10ByUserIdOrderByAtDesc(String userId);

    long countByIpAndSuccessFalseAndAtAfter(String ip, LocalDateTime after);

    long countByUserIdAndSuccessFalseAndAtAfter(String userId, LocalDateTime after);
}
