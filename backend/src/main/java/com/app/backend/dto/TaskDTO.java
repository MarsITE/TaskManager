package com.app.backend.dto;

import com.app.backend.model.Task.Status;
import lombok.Data;

@Data
public class TaskDTO {
    private String title;
    private String description;
    private Status status;
}
