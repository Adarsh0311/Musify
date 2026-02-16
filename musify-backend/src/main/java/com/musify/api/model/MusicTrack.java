package com.musify.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@DynamoDbBean // similar to entity in JPA
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MusicTrack {
    private String artistName; // partition key
    private String songName; // sort key
    private String artistNameLower; // for case-insensitive search
    private String songNameLower; // for case-insensitive search
    private String s3Key;
    private Integer duration;

    @DynamoDbPartitionKey
    public String getArtistName() {
        return artistName;
    }

    @DynamoDbSortKey
    public String getSongName() {
        return songName;
    }

}
