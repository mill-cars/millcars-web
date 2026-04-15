import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BlogCardProps {
  title: string;
  image: string;
  excerpt: string;
  href: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({ title, image, excerpt, href }) => (
  <a href={href} className="block rounded-3xl overflow-hidden bg-surface-container-lowest shadow-md hover:shadow-xl transition-shadow group">
    <div className="aspect-[4/2] overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-black mb-2 text-on-surface line-clamp-2">{title}</h3>
      <p className="text-sm text-on-surface-variant line-clamp-3 mb-3">{excerpt}</p>
      <span className="inline-flex items-center gap-1 text-primary font-bold text-xs uppercase tracking-widest">
        Leer más
        <ArrowRight className="w-4 h-4 ml-1" />
      </span>
    </div>
  </a>
);
