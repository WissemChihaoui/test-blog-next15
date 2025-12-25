// ====================
// FILE: app/lib/blogService.ts
// ====================
import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface Blog {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogNavigation {
  title: string;
  slug: string;
}

export interface BlogWithRelations {
  blog: Blog;
  prev: BlogNavigation | null;
  next: BlogNavigation | null;
  related: Blog[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getAllBlogs(): Promise<Blog[]> {
  try {
    const db = await getDatabase();
    const blogs = await db
      .collection<Blog>('blogs')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return blogs;
  } catch (error) {
    console.error('Error fetching all blogs:', error);
    throw new Error('Failed to fetch blogs');
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogWithRelations | null> {
  try {
    const db = await getDatabase();
    const blog = await db.collection<Blog>('blogs').findOne({ slug });

    if (!blog) {
      return null;
    }

    // Get all blogs sorted by date for prev/next navigation
    const allBlogs = await db
      .collection<Blog>('blogs')
      .find({})
      .sort({ createdAt: 1 })
      .toArray();

    const currentIndex = allBlogs.findIndex((b) => b.slug === slug);
    
    const prev = currentIndex > 0 
      ? { title: allBlogs[currentIndex - 1].title, slug: allBlogs[currentIndex - 1].slug }
      : null;
    
    const next = currentIndex < allBlogs.length - 1
      ? { title: allBlogs[currentIndex + 1].title, slug: allBlogs[currentIndex + 1].slug }
      : null;

    // Get related posts - FIRST by same category
    const relatedByCategory = await db
      .collection<Blog>('blogs')
      .find({
        slug: { $ne: slug },
        category: blog.category,
      })
      .limit(3)
      .toArray();

    let related: Blog[] = [...relatedByCategory];

    // If we need more related posts, get by matching tags
    if (related.length < 3) {
      const excludeSlugs = [slug, ...related.map((r) => r.slug)];
      
      const relatedByTags = await db
        .collection<Blog>('blogs')
        .find({
          slug: { $nin: excludeSlugs },
          tags: { $in: blog.tags },
        })
        .toArray();

      // Sort by number of matching tags (most matches first)
      const blogTagsSet = new Set(blog.tags);
      const sortedByTags = relatedByTags
        .map((b) => ({
          ...b,
          matchCount: b.tags.filter((t) => blogTagsSet.has(t)).length,
        }))
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 3 - related.length);

      related = [...related, ...sortedByTags];
    }

    return {
      blog,
      prev,
      next,
      related: related.slice(0, 3),
    };
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    throw new Error('Failed to fetch blog');
  }
}

export async function createBlog(
  blogData: Omit<Blog, '_id' | 'slug' | 'createdAt' | 'updatedAt'>
): Promise<Blog> {
  try {
    const db = await getDatabase();
    const slug = generateSlug(blogData.title);

    // Check if slug already exists
    const existing = await db.collection<Blog>('blogs').findOne({ slug });
    if (existing) {
      throw new Error('A blog with this title already exists');
    }

    // Auto-save category if it's new
    const categoriesCollection = db.collection('categories');
    await categoriesCollection.updateOne(
      { name: blogData.category },
      { 
        $setOnInsert: { 
          name: blogData.category, 
          createdAt: new Date() 
        } 
      },
      { upsert: true }
    );

    // Auto-save tags if they're new
    const tagsCollection = db.collection('tags');
    for (const tag of blogData.tags) {
      await tagsCollection.updateOne(
        { name: tag },
        { 
          $setOnInsert: { 
            name: tag, 
            createdAt: new Date() 
          } 
        },
        { upsert: true }
      );
    }

    // Create the new blog
    const newBlog: Omit<Blog, '_id'> = {
      ...blogData,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Blog>('blogs').insertOne(newBlog as Blog);
    
    return {
      ...newBlog,
      _id: result.insertedId,
    } as Blog;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const db = await getDatabase();
    const categories = await db
      .collection('categories')
      .find({})
      .sort({ name: 1 })
      .toArray();
    return categories.map((cat) => cat.name);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getAllTags(): Promise<string[]> {
  try {
    const db = await getDatabase();
    const tags = await db
      .collection('tags')
      .find({})
      .sort({ name: 1 })
      .toArray();
    return tags.map((tag) => tag.name);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}