package com.SwiftTalk.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.SwiftTalk.dto.CallLogDTO;
import com.SwiftTalk.service.CallLogService;

@RestController
@RequestMapping("/calls")
public class CallController {

    @Autowired
    private CallLogService callLogService;

    @PostMapping
    public void saveCallLog(@RequestBody CallLogDTO dto) {
        callLogService.saveCallLog(dto);
    }

    @GetMapping("/{userId}")
    public List<CallLogDTO> getCallLogs(@PathVariable Long userId) {
        return callLogService.getCallLogsByUser(userId);
    }

    // Optional: health check or debug endpoint for signaling
    @GetMapping("/status")
    public String signalingStatus() {
        return "Signaling endpoint is active via WebSocket on /signaling";
    }
}
