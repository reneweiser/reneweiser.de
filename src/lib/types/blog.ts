export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  image?: string;
  imageAlt?: string;
  tags: string[];
  published: boolean;
  readingTime: string;
}
