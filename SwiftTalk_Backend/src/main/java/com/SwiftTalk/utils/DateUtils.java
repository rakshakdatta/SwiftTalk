package com.SwiftTalk.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtils {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static String format(LocalDateTime dateTime) {
        return dateTime != null ? FORMATTER.format(dateTime) : null;
    }

    public static LocalDateTime now() {
        return LocalDateTime.now();
    }
}
