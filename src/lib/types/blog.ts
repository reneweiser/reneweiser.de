export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  image?: string;
  tags: string[];
  published: boolean;
  readingTime: string;
}
