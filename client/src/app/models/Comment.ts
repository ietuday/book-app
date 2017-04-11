export interface IComment {
  bookId?: string;
  messages: Array<{
    author: string;
    created_at?: string;
    text: string;
  }>;
}
