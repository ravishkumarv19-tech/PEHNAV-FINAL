import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — PEHNAV" }, { name: "description", content: "Get in touch with PEHNAV." }] }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Contact Us</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-5 text-sm">
          <p className="text-muted-foreground">We'd love to hear your story. Reach out anytime.</p>
          <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-gold" /> hello@pehnav.com</p>
          <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-gold" /> +91 98765 43210</p>
          <p className="flex items-center gap-3"><MapPin className="h-5 w-5 text-gold" /> Mumbai, India</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-3">
          <input required placeholder="Name" className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold" />
          <input required type="email" placeholder="Email" className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold" />
          <textarea required rows={5} placeholder="Message" className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold" />
          <button className="rounded-md bg-foreground px-8 py-3 text-sm uppercase tracking-wider text-background">Send Message</button>
          {sent && <p className="text-sm text-gold">Thanks! We'll be in touch soon.</p>}
        </form>
      </div>
    </div>
  );
}
