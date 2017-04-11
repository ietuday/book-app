interface IBook {
  _id?: string;
  title: string;
  author: string;
  coverUrl?: string;
  epubUrl?: string;
  description?: string;
  slug?: string;
  total_rating?: number;
  total_rates?: number;
  rating?: number;
  added_at?: any;
  views?: number;
  paid?: boolean;
  price?: number;
}

export class Book implements IBook {
  _id?: string;
  title: string;
  author: string;
  coverUrl?: string;
  epubUrl?: string;
  description?: string;
  slug?: string;
  total_rating?: number;
  total_rates?: number;
  rating?: number;
  added_at?: any;
  views?: number;
  paid?: boolean;
  price?: number;

  constructor(details: IBook) {
    this.title = details.title;
    this.author = details.author;
    this.description = details.description;
    this.price = details.price || 0;
    this.paid = details.paid || false;
  }
}
