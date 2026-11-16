package com.SwiftTalk.mapper;

import com.SwiftTalk.dto.CallLogDTO;
import com.SwiftTalk.entity.CallLog;
import com.SwiftTalk.entity.User;

public class CallLogMapper {

    public static CallLogDTO toDTO(CallLog log) {
        if (log == null) return null;

        CallLogDTO dto = new CallLogDTO();
        dto.setCallerId(log.getCaller().getId());
        dto.setReceiverId(log.getReceiver().getId());
        dto.setVideoCall(log.isVideoCall());
        dto.setDurationInSeconds(log.getDurationInSeconds());
        dto.setStatus(log.getStatus());
        dto.setTimestamp(log.getTimestamp());
        return dto;
    }

    public static CallLog fromDTO(CallLogDTO dto, User caller, User receiver) {
        return CallLog.builder()
                .caller(caller)
                .receiver(receiver)
                .isVideoCall(dto.isVideoCall())
                .durationInSeconds(dto.getDurationInSeconds())
                .status(dto.getStatus())
                .timestamp(dto.getTimestamp())
                .build();
    }
}
