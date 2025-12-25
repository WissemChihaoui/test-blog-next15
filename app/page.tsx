import { getAllBlogs } from '@/app/lib/blogService';
import Link from 'next/link';
import { Tag, Folder, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const blogs = await getAllBlogs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-slate-800 hover:text-slate-600 transition">
              Blog Platform
            </Link>
            <div className="flex gap-3">
              <Link
                href="/blog/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Create Post
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-800">Latest Posts</h2>
            <p className="text-slate-600">{blogs.length} {blogs.length === 1 ? 'post' : 'posts'}</p>
          </div>

          {blogs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 border border-slate-200 text-center">
              <p className="text-slate-600 text-lg mb-4">No blog posts yet.</p>
              <Link
                href="/create"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {blogs.map((blog) => (
                <article
                  key={blog._id?.toString()}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-slate-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/blog/${blog.slug}`}>
                        <h3 className="text-2xl font-semibold text-slate-800 mb-2 hover:text-blue-600 transition cursor-pointer">
                          {blog.title}
                        </h3>
                      </Link>
                      <p className="text-slate-600 mb-4 line-clamp-2">{blog.excerpt}</p>
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          <Folder size={14} />
                          {blog.category}
                        </span>
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                          >
                            <Tag size={14} />
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                            +{blog.tags.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="ml-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium whitespace-nowrap"
                    >
                      Read More
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-600">
          <p>&copy; 2024 Blog Platform. Built with Next.js 15 & MongoDB.</p>
        </div>
      </footer>
    </div>
  );
}