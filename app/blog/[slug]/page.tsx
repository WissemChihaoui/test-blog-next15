import { getBlogBySlug } from '@/app/lib/blogService';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Tag, Folder, Calendar, Clock, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BlogPage({ params }: { params: { slug: string } }) {
  // Await the params promise
  const { slug } = await params;
  const result = await getBlogBySlug(slug);

  if (!result) {
    notFound();
  }

  const { blog, prev, next, related } = result;
  
  const readingTime = Math.ceil(blog.content.split(/\s+/).length / 200);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-slate-800 hover:text-slate-600 transition">
              Blog Platform
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium"
            >
              All Posts
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
          
          <article className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Folder className="w-4 h-4" />
                  {blog.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {readingTime} min read
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{blog.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              </div>
            </div>
          </article>

          <div className="flex justify-between items-center pt-8 border-t border-slate-200">
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
              >
                <ChevronLeft className="w-5 h-5" />
                <div>
                  <span className="text-sm text-slate-500">Previous</span>
                  <p className="font-medium">{prev.title}</p>
                </div>
              </Link>
            ) : (
              <div></div>
            )}
            
            {next && (
              <Link
                href={`/blog/${next.slug}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition ml-auto text-right"
              >
                <div>
                  <span className="text-sm text-slate-500">Next</span>
                  <p className="font-medium">{next.title}</p>
                </div>
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">You might also like</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full mb-3">
                        {post.category}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{post.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}