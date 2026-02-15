package com.musify.api.service;

import com.musify.api.repository.MusicTrackRepository;
import com.musify.api.dto.UploadUrlResponse;
import com.musify.api.dto.PaginatedResponse;
import com.musify.api.exception.DuplicateSongException;
import com.musify.api.model.MusicTrack;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MusicTrackService {

    private final MusicTrackRepository musicTrackRepository;
    private final S3Service s3Service;

    public MusicTrack addMusicTrack(MusicTrack musicTrack) {
        return musicTrackRepository.save(musicTrack);
    }

    public MusicTrack getSongById(String songId) {
        // return musicTrackRepository.findByPartitionKeyAndSortKey(songId);
        return null;
    }

    public PaginatedResponse getAllSongs(int limit, String nextToken, String searchQuery) {
        return musicTrackRepository.findAll(limit, nextToken, searchQuery);
    }

    public MusicTrack updateSong(MusicTrack musicTrack) {
        return musicTrackRepository.updateSong(musicTrack);
    }

    public void deleteSong(String songId) {
        // musicTrackRepository.deleteSongByPartitionAndSortKey(songId);
    }

    public UploadUrlResponse getUploadUrl(String artistName, String songName) {
        if (musicTrackRepository.exists(artistName, songName))
            throw new DuplicateSongException("Song with " + artistName + " and " + songName + " already exists");

        String s3Key = "tracks/" + artistName + "/" + songName + ".mp3";
        String url = s3Service.presignedPutObjectRequestUrl(s3Key);
        return new UploadUrlResponse(s3Key, url);
    }

    public String getStreamUrl(String key) {
        return s3Service.presignedGetObjectRequestUrl(key);

    }

}
