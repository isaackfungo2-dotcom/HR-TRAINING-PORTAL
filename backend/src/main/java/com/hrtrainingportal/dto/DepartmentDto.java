package com.hrtrainingportal.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DepartmentDto {
    private Long id;
    private String name;
    private String description;
}
