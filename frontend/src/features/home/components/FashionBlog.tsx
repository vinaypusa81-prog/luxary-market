'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

const POSTS = [
  { id: 1, title: 'Top 10 Summer Trends You Need in 2026', excerpt: 'As temperatures rise, so does the style quotient. From breezy linens to vibrant prints, discover this summer\'s must-haves.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80', category: 'Trends', readTime: '4 min', href: '/blog/summer-trends-2026' },
  { id: 2, title: 'How to Build a Capsule Wardrobe on a Budget', excerpt: 'A capsule wardrobe doesn\'t have to break the bank. Our style experts guide you through building versatile looks.', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80', category: 'Style Guide', readTime: '6 min', href: '/blog/capsule-wardrobe-budget' },
  { id: 3, title: 'The Return of Ethnic Fusion: A Style Guide', excerpt: 'Ethnic fusion wear is making a bold comeback. Learn how to style traditional pieces with a modern twist.', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', category: 'Fashion', readTime: '5 min', href: '/blog/ethnic-fusion-guide' },
];

export function FashionBlog() {
  return (
    <section className="py-14 container-main" aria-label="Fashion blog">
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stories</span>
          </div>
          <h2 className="section-title">Fashion Stories</h2>
        </motion.div>
        <Link href="/blog" className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
          All Stories <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {POSTS.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Link href={post.href} className="card-hover group block overflow-hidden rounded-2xl">
              <div className="relative h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-3 left-3 badge bg-background/90 backdrop-blur-sm text-foreground">{post.category}</span>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-2">{post.readTime} read</p>
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
