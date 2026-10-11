package com.campusconnect.dto;

import com.campusconnect.model.User;

public record UserDto(
        String id,
        String name,
        String email,
        String registerNumber,
        String department,
        Integer semester,
        boolean emailVerified,
        String role
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getStudentRecord().getName(),
                user.getEmail(),
                user.getStudentRecord().getRegisterNumber(),
                user.getStudentRecord().getDepartment(),
                user.getStudentRecord().getSemester(),
                user.isEmailVerified(),
                user.getRole()
        );
    }
}
