import { createFileRoute } from "@tanstack/react-router";
import { blogPosts, formatDate } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Blog — PEHNAV" }, { name: "description", content: "Fashion, style guides and stories from PEHNAV." }] }),
  component: Blog,
});

function Blog() {
  const { tl } = useI18n();
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <p className="eyebrow text-gold">Journal</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">The PEHNAV Blog</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {blogPosts.map((post) => (
          <article key={post.id} className="group overflow-hidden rounded-md border border-border bg-card">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={post.image} alt={tl(post.title)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <span className="eyebrow text-gold">{post.category}</span>
              <h2 className="mt-2 font-display text-lg font-bold">{tl(post.title)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{tl(post.excerpt)}</p>
              <p className="mt-3 text-xs text-muted-foreground">{formatDate(post.date)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
