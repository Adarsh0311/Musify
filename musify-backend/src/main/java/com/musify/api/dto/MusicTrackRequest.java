package com.musify.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NonNull;

@Data
public class MusicTrackRequest {
    @NotBlank(message = "Artist name is required")
    private String artistName;
    @NotBlank(message = "Song name is required")
    private String songName;
    @NotBlank(message = "S3 key is required")
    private String s3Key;
    private Integer duration;

}
