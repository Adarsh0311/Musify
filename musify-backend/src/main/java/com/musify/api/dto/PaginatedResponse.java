package com.musify.api.dto;

import com.musify.api.model.MusicTrack;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaginatedResponse {
    private List<MusicTrack> items;
    private String nextToken;
}
