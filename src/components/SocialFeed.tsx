import React from 'react';

// Simulación de feed de Instagram (puedes reemplazar por integración real)
const posts = [
  {
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400',
    alt: 'Auto destacado 1',
    href: 'https://www.instagram.com/p/DU5n0_fEWq9/',
  },
  {
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400',
    alt: 'Auto destacado 2',
    href: 'https://www.instagram.com/p/DU5n0_fEWq9/',
  },
  {
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400',
    alt: 'Auto destacado 3',
    href: 'https://www.instagram.com/p/DU5n0_fEWq9/',
  },
];

export const SocialFeed: React.FC = () => (
  <div className="grid grid-cols-1 gap-4">
    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-outline mb-2">Instagram</h4>
    <div className="grid grid-cols-3 gap-2">
      {posts.map((post, idx) => (
        <a key={idx} href={post.href} target="_blank" rel="noopener noreferrer">
          <img src={post.image} alt={post.alt} className="rounded-xl object-cover aspect-square w-full h-auto hover:opacity-80 transition-opacity" />
        </a>
      ))}
    </div>
  </div>
);
