package com.musify.api.repository;

import com.musify.api.model.MusicTrack;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class MusicTrackRepository {
    private final DynamoDbEnhancedClient dynamoDbEnhancedClient;
    private DynamoDbTable<MusicTrack> musicTrackTable;

    @PostConstruct
    public void init() {
        musicTrackTable = dynamoDbEnhancedClient.table("MusicTrack", TableSchema.fromBean(MusicTrack.class));
    }

    public MusicTrack save(MusicTrack musicTrack) {
        musicTrackTable.putItem(musicTrack);
        return musicTrack;
    }

    public MusicTrack findByPartitionKeyAndSortKey(String artistName, String songName) {

        final String finalArtistName = artistName.trim();
        final String finalSongName = songName.trim();

        return musicTrackTable.getItem(r -> r.key(k -> k.partitionValue(finalArtistName).sortValue(finalSongName)));
    }

    public List<MusicTrack> findAll() {
        List<MusicTrack> musicTracks = new ArrayList<>();
         musicTrackTable.scan().items().forEach(musicTracks::add);
         return musicTracks;
    }

    public void deleteSongByPartitionAndSortKey(String artistName, String songName) {
        final String finalArtistName = artistName.trim().toLowerCase();
        final String finalSongName = songName.trim().toLowerCase();
        musicTrackTable.deleteItem(k -> k.key(k1 -> k1.partitionValue(finalArtistName).sortValue(finalSongName)));
    }

    public MusicTrack updateSong(MusicTrack musicTrack) {
        musicTrackTable.putItem(musicTrack);
        return musicTrack;
    }

    public boolean exists(String artistName, String songName) {
        return findByPartitionKeyAndSortKey(artistName, songName) != null;
    }


}
