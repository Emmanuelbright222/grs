import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";

const Terms = () => {
  return (
    <div className="relative min-h-screen">
      <MusicBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <header className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Grace Rhythm Sounds – Terms and Conditions
              </h1>
            </header>

            <div className="space-y-8 text-muted-foreground text-base md:text-lg leading-relaxed">
              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  1. Introduction
                </h2>
                <p>
                  Welcome to Grace Rhythm Sounds (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
                  By accessing or using gracerhythmsounds.com, you agree to comply with and be bound by these Terms and Conditions.
                  These govern your relationship with us as an artist, producer, partner, or visitor.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  2. Eligibility
                </h2>
                <p>
                  To use our services, you must be at least 18 years old or have parental/guardian consent. You must provide
                  accurate information and agree to abide by our values of integrity, excellence, and Christ-centered creativity.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  3. Services
                </h2>
                <p className="mb-3">Grace Rhythm Sounds offers:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Artist discovery, mentorship, and music production</li>
                  <li>Distribution via platforms like DistroKid</li>
                  <li>Royalty management and transparent payouts</li>
                  <li>Branding, promotion, and global audience engagement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  4. Intellectual Property
                </h2>
                <p>
                  All content produced or distributed through Grace Rhythm Sounds remains the intellectual property of the
                  respective creators unless otherwise agreed. You grant us a non-exclusive license to use your content for
                  promotion, distribution, and platform growth.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  5. Financial Terms
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Royalties are split and paid according to agreed terms via automated systems (e.g., DistroKid splits).</li>
                  <li>Artists must provide valid payment details and comply with tax and legal obligations.</li>
                  <li>Grace Rhythm Sounds reserves the right to withhold payments in cases of fraud, breach, or unresolved disputes.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  6. Termination of Contract
                </h2>
                <p className="mb-3">Either party may terminate this agreement under the following conditions:</p>
                <p className="font-semibold text-foreground">By Artist:</p>
                <p className="mb-3">
                  With 30 days&rsquo; written notice, provided all outstanding obligations are fulfilled.
                </p>
                <p className="font-semibold text-foreground">By Grace Rhythm Sounds:</p>
                <ul className="list-disc list-inside space-y-2 mb-3">
                  <li>Breach of contract or platform values</li>
                  <li>Misrepresentation or fraud</li>
                  <li>Harmful conduct affecting the platform or its community</li>
                </ul>
                <p className="font-semibold text-foreground">Upon termination:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Distribution rights revert to the artist unless otherwise agreed</li>
                  <li>Outstanding royalties will be paid within 60 days</li>
                  <li>Access to platform services will be revoked</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  7. Code of Conduct
                </h2>
                <p>
                  Users must uphold respectful, faith-aligned behavior. Hate speech, abuse, or exploitation will result in
                  immediate termination and possible legal action.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  8. Limitation of Liability
                </h2>
                <p>
                  Grace Rhythm Sounds is not liable for indirect losses, third-party platform failures, or delays in royalty
                  processing beyond our control.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  9. Amendments
                </h2>
                <p>
                  We may update these Terms periodically. Continued use of the platform implies acceptance of any changes.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  10. Governing Law
                </h2>
                <p>
                  These Terms are governed by the laws of the United Kingdom.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;

