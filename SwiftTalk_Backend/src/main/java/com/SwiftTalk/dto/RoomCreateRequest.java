package com.SwiftTalk.dto;

import java.util.Set;

import lombok.Data;

@Data
public class RoomCreateRequest {
    private String name;
    private boolean isGroup;
    private Set<Long> participantIds;
}
