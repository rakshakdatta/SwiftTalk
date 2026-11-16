package com.SwiftTalk.service;

import java.util.List;

import com.SwiftTalk.dto.CallLogDTO;

public interface CallLogService {

    void saveCallLog(CallLogDTO dto);

    List<CallLogDTO> getCallLogsByUser(Long userId);
}
