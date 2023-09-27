type RedditPackagedMediaData = {
    playbackMp4s: {
        duration: number;
        permutations: {
            source: {
                url: string;
                dimensions: {
                    width: number;
                    height: number;
                };
            };
        }[];
    };
}

