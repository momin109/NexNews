// import { Header, Footer } from "@/components/FrontendLayout";

import { Award, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <main className=" container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-16">
        <section className="text-center space-y-6">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic mb-8">
            About Daily Post
          </h1>
          <p className="text-2xl font-bold leading-relaxed text-muted-foreground">
            We are dedicated to delivering the most reliable, comprehensive, and
            unbiased news to our global audience. Since our founding, we've
            prioritized truth and integrity above all else.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-2xl font-black tracking-tighter uppercase italic">
              Our Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              To inform, engage, and empower our readers by providing factual
              journalism that matters. We believe that access to accurate
              information is a fundamental right.
            </p>
          </div>
          <div className="bg-card border p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <Award size={28} />
            </div>
            <h3 className="text-2xl font-black tracking-tighter uppercase italic">
              Excellence
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              With a team of award-winning journalists and reporters stationed
              around the globe, we ensure that every story we cover is
              thoroughly researched and verified.
            </p>
          </div>
        </div>

        <section className="bg-primary text-primary-foreground rounded-3xl p-12 text-center space-y-8">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">
            Join Our Global Community
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-1">
              <div className="text-5xl font-black tracking-tighter">10M+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-primary-foreground/60">
                Monthly Readers
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-5xl font-black tracking-tighter">150+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-primary-foreground/60">
                Journalists
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-5xl font-black tracking-tighter">24/7</div>
              <div className="text-sm font-bold uppercase tracking-widest text-primary-foreground/60">
                News Coverage
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
