import { NextResponse } from 'next/server';
import { getAllBlogs, createBlog } from '@/app/lib/blogService';

export async function GET() {
  // Get all blogs logic
}

export async function POST(request: Request) {
  try {
    const blogData = await request.json();
    
    // Basic validation
    if (!blogData.title || !blogData.slug || !blogData.content || !blogData.excerpt || !blogData.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add timestamps
    const now = new Date();
    const blogWithTimestamps = {
      ...blogData,
      createdAt: now,
      updatedAt: now,
      tags: blogData.tags || []
    };

    const createdBlog = await createBlog(blogWithTimestamps);
    return NextResponse.json(createdBlog, { status: 201 });
    
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}