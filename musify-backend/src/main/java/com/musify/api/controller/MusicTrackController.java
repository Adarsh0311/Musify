package com.musify.api.controller;

import com.musify.api.dto.MusicTrackRequest;
import com.musify.api.dto.UploadUrlResponse;
import com.musify.api.dto.PaginatedResponse;
import com.musify.api.model.MusicTrack;
import com.musify.api.service.MusicTrackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.net.URLDecoder;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/musictrack")
@RequiredArgsConstructor
@Slf4j
public class MusicTrackController {

    private final MusicTrackService musicTrackService;

    @GetMapping("/upload-url")
    public ResponseEntity<UploadUrlResponse> getUploadUrl(@RequestParam String artistName,
            @RequestParam String songName) {
        log.info("Request to get upload URL for artist: {} and song: {}", artistName, songName);

        try {
            artistName = URLDecoder.decode(artistName, "UTF-8");
            songName = URLDecoder.decode(songName, "UTF-8");

            log.info("Decoded Request to get upload URL for artist: {} and song: {}", artistName, songName);
        } catch (Exception e) {
            log.error("Failed to decode artist name or song name", e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        UploadUrlResponse uploadUrl = musicTrackService.getUploadUrl(artistName, songName);
        log.info("Generated upload URL successfully for key: {}", uploadUrl.s3Key());
        return new ResponseEntity<>(uploadUrl, HttpStatus.OK);
    }

    @PostMapping("/metadata")
    public ResponseEntity<MusicTrack> uploadMetadata(@Valid @RequestBody MusicTrackRequest musicTrackRequest) {
        log.info("Request to save metadata for song: {}", musicTrackRequest.getSongName());
        log.debug("Payload: {}", musicTrackRequest);
        MusicTrack musicTrackToSave = MusicTrack.builder()
                .artistName(musicTrackRequest.getArtistName())
                .songName(musicTrackRequest.getSongName())
                .s3Key(musicTrackRequest.getS3Key())
                .duration(musicTrackRequest.getDuration())
                .build();

        MusicTrack addMusicTrack = musicTrackService.addMusicTrack(musicTrackToSave);
        log.info("Metadata saved successfully for songId: {}", addMusicTrack.getS3Key());
        return new ResponseEntity<>(addMusicTrack, HttpStatus.CREATED);
    }

    @GetMapping("/{songId}")
    public ResponseEntity<MusicTrack> getSongById(@PathVariable String songId) {
        log.info("Request to get song by ID: {}", songId);
        MusicTrack musicTrack = musicTrackService.getSongById(songId);
        log.info("Returning song details for ID: {}", songId);
        return new ResponseEntity<>(musicTrack, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse> getAllSongs(
            @RequestParam(required = false, defaultValue = "20") int limit,
            @RequestParam(required = false) String nextToken,
            @RequestParam(required = false) String search) {
        log.info("Request to get all songs with limit={}, nextToken={}, search={}", limit, nextToken, search);

        PaginatedResponse response = musicTrackService.getAllSongs(limit, nextToken, search);

        log.info("Returned {} songs, nextToken present: {}", response.getItems().size(),
                response.getNextToken() != null);

        return ResponseEntity.ok(response);
    }

    /**
     *
     * @return String - the preSigned URL to stream the song
     */
    @GetMapping("/stream")
    public ResponseEntity<String> streamSong(@RequestParam String key) {
        log.info("Request to stream song with key: {}", key);

        try {
            key = URLDecoder.decode(key, "UTF-8");
            log.info("Decoded Request to stream song with key: {}", key);
        } catch (Exception e) {
            log.error("Failed to decode key", e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        String streamUrl = musicTrackService.getStreamUrl(key);
        log.debug("Stream URL generated successfully");
        return new ResponseEntity<>(streamUrl, HttpStatus.OK);
    }

    @DeleteMapping("/{songId}")
    public ResponseEntity<Void> deleteSong(@PathVariable String songId) {
        log.info("Request to delete song with ID: {}", songId);
        musicTrackService.deleteSong(songId);
        log.info("Song deleted successfully");
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
