export interface User {
    email: string;
    username: string;
    bio: string | null;
    image: string;
    token: string;
}

export interface UserResponse {
    user: User;
}
