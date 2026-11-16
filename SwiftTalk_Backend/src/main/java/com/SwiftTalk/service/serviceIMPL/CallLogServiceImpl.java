package com.SwiftTalk.service.serviceIMPL;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.SwiftTalk.dto.CallLogDTO;
import com.SwiftTalk.entity.CallLog;
import com.SwiftTalk.entity.User;
import com.SwiftTalk.mapper.CallLogMapper;
import com.SwiftTalk.repository.CallLogRepository;
import com.SwiftTalk.repository.UserRepository;
import com.SwiftTalk.service.CallLogService;

@Service
public class CallLogServiceImpl implements CallLogService {

    @Autowired
    private CallLogRepository callLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void saveCallLog(CallLogDTO dto) {
        User caller = userRepository.findById(dto.getCallerId()).orElseThrow();
        User receiver = userRepository.findById(dto.getReceiverId()).orElseThrow();
        CallLog log = CallLogMapper.fromDTO(dto, caller, receiver);
        callLogRepository.save(log);
    }

    @Override
    public List<CallLogDTO> getCallLogsByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return callLogRepository.findByCaller(user).stream()
                .map(CallLogMapper::toDTO)
                .collect(Collectors.toList());
    }
}
