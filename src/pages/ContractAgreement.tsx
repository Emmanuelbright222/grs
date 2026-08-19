import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";

const ContractAgreement = () => {
  return (
    <div className="relative min-h-screen">
      <MusicBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <header className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Artist Agreement with Grace Rhythm Sounds
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Formal collaboration framework between Grace Rhythm Sounds and partnering artists.
              </p>
            </header>

            <div className="space-y-8 text-muted-foreground text-base md:text-lg leading-relaxed bg-white/90 dark:bg-background/80 backdrop-blur-sm border border-white/10 rounded-3xl shadow-strong p-8 md:p-12">
              <section className="space-y-4">
                <p>
                  <strong>Grace Rhythm Sounds</strong>, operating under{" "}
                  <a
                    href="https://gracerhythmsounds.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    gracerhythmsounds.com
                  </a>
                  , hereafter referred to as <strong>&ldquo;the Label&rdquo;</strong>, and{" "}
                  <span className="font-semibold text-foreground">[Artist Name]</span>, hereafter referred to as{" "}
                  <strong>&ldquo;the Artist&rdquo;</strong>, enter into the following agreement.
                </p>
                <p>
                  <strong>Effective Date:</strong> 10th November 2025.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  1. Purpose
                </h2>
                <p>
                  This Agreement outlines the terms under which the Artist collaborates with the Label for the production,
                  promotion, distribution, and monetization of musical works.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  2. Royalty Split Structure
                </h2>
                <p className="mb-4">
                  The net revenue generated from streaming, downloads, licensing, and other monetized uses of the Artist’s
                  music shall be split as follows:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm md:text-base border border-white/10 rounded-lg overflow-hidden">
                    <thead className="bg-accent text-accent-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">
                          Cost Responsibility
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Artist Share
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Label Share
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background/80">
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3">
                          Label covers production, promotion, distribution
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">60%</td>
                        <td className="px-4 py-3 font-semibold text-foreground">40%</td>
                      </tr>
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3">
                          Artist covers production; Label covers promotion and distribution
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">70%</td>
                        <td className="px-4 py-3 font-semibold text-foreground">30%</td>
                      </tr>
                      <tr className="border-t border-white/10">
                        <td className="px-4 py-3">
                          Artist covers all costs (production, promotion, distribution)
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">90%</td>
                        <td className="px-4 py-3 font-semibold text-foreground">10%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>
                    “Net revenue” means gross income after platform fees, transaction costs, and applicable taxes.
                  </li>
                  <li>
                    Cost responsibilities must be documented and agreed upon prior to release.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  3. Services Provided by the Label
                </h2>
                <p className="mb-3">
                  Depending on the cost-sharing arrangement, the Label may provide:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Music production and engineering</li>
                  <li>Promotional campaigns and digital marketing</li>
                  <li>Distribution to streaming platforms and stores</li>
                  <li>Royalty tracking and transparent reporting</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  4. Term and Termination
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>This Agreement remains in effect for [insert duration or project scope].</li>
                  <li>Either party may terminate with 30 days’ written notice, subject to settlement of outstanding obligations.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  5. Dispute Resolution
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Parties agree to first seek resolution through good-faith negotiation and out-of-court settlement.</li>
                  <li>
                    If unresolved, the matter shall be referred to arbitration, conducted by a mutually agreed-upon arbitrator.
                  </li>
                  <li>The arbitration decision shall be final and binding.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  6. Legal and Financial Compliance
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Both parties agree to uphold ethical standards, financial transparency, and compliance with laws.</li>
                  <li>The Label shall provide regular royalty statements and ensure timely payouts.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  7. Signatures
                </h2>
                <p>
                  Both parties acknowledge that signatures will be captured digitally or in writing on the official contract
                  document issued by Grace Rhythm Sounds. This page serves as the reference copy of the agreement terms.
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

export default ContractAgreement;

