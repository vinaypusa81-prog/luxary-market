'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const DESIGNERS = [
  { id: 1, name: 'Sabyasachi', specialty: 'Bridal Couture', avatar: '🎨', href: '/designer/sabyasachi' },
  { id: 2, name: 'Manish Malhotra', specialty: 'Bollywood Fashion', avatar: '✨', href: '/designer/manish-malhotra' },
  { id: 3, name: 'Ritu Kumar', specialty: 'Heritage Weaves', avatar: '🌸', href: '/designer/ritu-kumar' },
  { id: 4, name: 'Masaba Gupta', specialty: 'Contemporary Prints', avatar: '🖌️', href: '/designer/masaba-gupta' },
  { id: 5, name: 'Tarun Tahiliani', specialty: 'Fusion Luxury', avatar: '💫', href: '/designer/tarun-tahiliani' },
  { id: 6, name: 'Anita Dongre', specialty: 'Sustainable Luxury', avatar: '🌿', href: '/designer/anita-dongre' },
];

export function FeaturedDesigners() {
  return (
    <section className="py-14 container-main" aria-label="Featured designers">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
        <h2 className="section-title">Featured Designers</h2>
        <p className="section-subtitle">Exclusive collections from India&apos;s most celebrated fashion designers</p>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {DESIGNERS.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            <Link href={d.href} className="card-hover flex flex-col items-center gap-3 p-5 text-center group">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center text-3xl">
                {d.avatar}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors">{d.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.specialty}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
