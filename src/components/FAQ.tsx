import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
  emoji: string;
}

const faqData: FAQItem[] = [
  {
    emoji: "🎯",
    question: "What is Grace Rhythm Sounds?",
    answer: "Grace Rhythm Sounds is a faith-driven music platform that discovers, mentors, produces, and globally distributes gospel music. We empower artists to preach Christ through sound while earning from their creative work."
  },
  {
    emoji: "🌍",
    question: "Who can join Grace Rhythm Sounds?",
    answer: "We welcome gospel artists, producers, songwriters, and creatives who are passionate about faith, excellence, and impact. Whether you're emerging or established, if your heart beats for Christ and creativity, you're invited."
  },
  {
    emoji: "🎵",
    question: "What kind of music do you support?",
    answer: "We support gospel and faith-inspired music across genres—worship, contemporary gospel, Afro-gospel, spoken word, and more. If it glorifies Christ and uplifts souls, it belongs here."
  },
  {
    emoji: "🧑‍🎤",
    question: "How do I become a featured artist?",
    answer: "You can apply via our Artist Submission Form. We prayerfully and professionally review each submission, looking for authenticity, excellence, and alignment with our mission."
  },
  {
    emoji: "🛠",
    question: "What services do you offer artists?",
    answer: "We provide:\n\n• Mentorship and spiritual guidance\n• Music production and songwriting support\n• Branding and content strategy\n• Global distribution via platforms like DistroKid\n• Royalty splits and transparent payouts\n• Promotional campaigns and platform exposure"
  },
  {
    emoji: "💸",
    question: "How do royalties and payouts work?",
    answer: "We use automated royalty splits through DistroKid to ensure artists are paid fairly and transparently. Each artist receives their share directly, with no hidden fees or delays."
  },
  {
    emoji: "📢",
    question: "Can I collaborate with other artists on the platform?",
    answer: "Absolutely. We encourage collaboration, co-writing, and joint releases. Grace Rhythm Sounds is a community, not just a service."
  },
  {
    emoji: "📝",
    question: "Do I retain rights to my music?",
    answer: "Yes. Artists retain full ownership of their music. We operate with integrity and clarity—our role is to support, not control."
  },
  {
    emoji: "🧭",
    question: "Is Grace Rhythm Sounds a label?",
    answer: "We're more than a label—we're a movement. While we offer label-like services, our heart is mentorship, empowerment, and kingdom impact."
  },
  {
    emoji: "📍",
    question: "Where is Grace Rhythm Sounds based?",
    answer: "We are headquartered in the United Kingdom, with a global reach. Our artists and audience span continents, united by faith and sound."
  },
  {
    emoji: "🙌",
    question: "How is faith integrated into the platform?",
    answer: "Faith is our foundation. We pray over projects, mentor with biblical principles, and ensure every song carries the message of Christ. Excellence and anointing go hand in hand."
  },
  {
    emoji: "📬",
    question: "How can I contact the team?",
    answer: "You can reach us via our Contact Form or email us at info@gracerhythmsounds.com. We'd love to hear from you."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions (FAQ)
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our platform, services, and community
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((faq, index) => (
            <Card
              key={index}
              className={cn(
                "border-2 shadow-soft hover:shadow-strong transition-all duration-300 overflow-hidden",
                openIndex === index && "shadow-strong border-accent/50"
              )}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-2xl flex-shrink-0">{faq.emoji}</span>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-accent" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>
              
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === index ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="px-6 pb-6 pt-0">
                  <div className="pl-10 border-l-2 border-accent/30">
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

