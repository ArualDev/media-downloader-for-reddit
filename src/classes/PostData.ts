enum PostType {
    Image = 'image',
    Video = 'video',
    Gallery = 'gallery'
}

class PostData {
    url: string;
    postType: PostType | null = null;
    downloads = [];

    constructor(url: string) {
        this.url = url;
    }
}