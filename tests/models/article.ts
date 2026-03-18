export interface Author {
    username: string;
    bio: string | null;
    image: string;
    following: boolean;
}

export interface Article {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: string;
    updatedAt: string;
    favorited: boolean;
    favoritesCount: number;
    author: Author;
}

export interface ArticlesResponse {
    articles: Article[];
    articlesCount: number;
}

export interface ArticleResponse {
    article: Article;
}

export interface ArticleFields {
    title: string;
    description: string;
    body: string;
    tagList: string[];
}

export interface ArticlePayload {
    article: ArticleFields;
}
