// import { Header, Footer } from "@/components/FrontendLayout";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Contact() {
  return (
    <main className="flex-1 container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">
            Get In Touch
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Have a tip, feedback, or inquiry? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10">
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <Mail size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">
                    Email Us
                  </h3>
                  <p className="text-muted-foreground font-medium">
                    For news tips: tips@dailypost.com
                  </p>
                  <p className="text-muted-foreground font-medium">
                    General: info@dailypost.com
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <Phone size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">
                    Call Us
                  </h3>
                  <p className="text-muted-foreground font-medium">
                    Office: +880 1234 567890
                  </p>
                  <p className="text-muted-foreground font-medium">
                    Newsroom: +880 1987 654321
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <MapPin size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">
                    Our Office
                  </h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    123 News Plaza, Panthapath,
                    <br />
                    Dhaka 1215, Bangladesh
                  </p>
                </div>
              </div>
            </div>

            {/* Mock Map */}
            <div className="aspect-video bg-muted rounded-3xl border-2 border-dashed border-primary/20 flex items-center justify-center text-muted-foreground overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop')] bg-cover opacity-20 grayscale"></div>
              <span className="relative z-10 font-black uppercase tracking-widest text-sm bg-background/80 px-4 py-2 rounded-full border">
                Interactive Map View
              </span>
            </div>
          </div>

          <Card className="p-8 md:p-10 rounded-3xl shadow-2xl shadow-primary/5 border-primary/10">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-widest text-xs">
                    Full Name
                  </Label>
                  <Input
                    placeholder="John Doe"
                    className="bg-muted/30 border-none h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-widest text-xs">
                    Email Address
                  </Label>
                  <Input
                    placeholder="john@example.com"
                    className="bg-muted/30 border-none h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-widest text-xs">
                  Subject
                </Label>
                <Input
                  placeholder="What is this about?"
                  className="bg-muted/30 border-none h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-widest text-xs">
                  Your Message
                </Label>
                <Textarea
                  placeholder="How can we help you today?"
                  className="bg-muted/30 border-none min-h-[150px] resize-none"
                />
              </div>
              <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2 text-lg shadow-xl shadow-primary/20">
                <Send size={20} /> Send Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}

import { Card } from "@/components/ui/card";
