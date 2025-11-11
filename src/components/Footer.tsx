import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Music, Mail, MapPin, MessageCircle, Twitter } from "lucide-react";
import logo from "@/assets/grace-rhythm-sounds-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#02132B] via-[#041B3A] to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-16 mb-8">
          {/* Brand Section */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Grace Rhythm Sounds" className="h-10 w-10" />
              <span className="font-bold text-lg">Grace Rhythm Sounds</span>
            </Link>
            <p className="text-sm opacity-80 mb-4">
            Grace Rhythm Sounds | Inspiring souls through gospel music, uplifting melodies, and divine rhythms.
            </p>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-80 mb-3">
              Follow Us On Social Media
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/gracerhythmsounds"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-smooth"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/gracerhythmsounds"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-smooth"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@gracerhythmsounds"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-smooth"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/grace_sounds1"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-smooth"
                aria-label="X (Twitter)"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/@gracerhythmsounds.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-smooth"
                aria-label="TikTok"
              >
                <Music className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm opacity-80 hover:text-accent transition-smooth">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-sm opacity-80 hover:text-accent transition-smooth">
                  Our Artists
                </Link>
              </li>
              <li>
                <Link to="/releases" className="text-sm opacity-80 hover:text-accent transition-smooth">
                  Music Releases
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm opacity-80 hover:text-accent transition-smooth">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Agreements */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Agreements</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm opacity-80 hover:text-accent transition-smooth">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/contract-agreement" className="text-sm opacity-80 hover:text-accent transition-smooth">
                  Contract Agreement
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5 text-accent" />
                <div>
                  <a href="mailto:info@gracerhythmsounds.com" className="hover:text-accent transition-smooth block">
                    info@gracerhythmsounds.com
                  </a>
                  <a href="mailto:support@gracerhythmsounds.com" className="hover:text-accent transition-smooth block mt-1">
                    support@gracerhythmsounds.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-accent" />
                <div>
                  <span className="opacity-100 font-semibold">Address:</span>
                  <div className="mt-2 space-y-3">
                    <div className="border border-white/10 rounded-md p-3 bg-white/5">
                      <p className="text-xs uppercase tracking-wide text-accent font-semibold mb-1">United Kingdom</p>
                      <p>42 Guilemot Close, IP145GJ Stowmarket, England, UK</p>
                    </div>
                    <div className="border border-white/10 rounded-md p-3 bg-white/5">
                      <p className="text-xs uppercase tracking-wide text-accent font-semibold mb-1">Nigeria</p>
                      <p>Behind Ibiza Club, No. 10 Dr. G.C Nsude Street, Koroduma, Karu, Nigeria</p>
                    </div>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-accent" />
                <div>
                  <span className="opacity-100 font-semibold">WhatsApp Only:</span>
                  <div className="mt-1 space-y-1">
                    <a href="https://wa.me/2347045501149" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-smooth block">
                      +234 704 550 1149
                    </a>
                    <a href="https://wa.me/447417556926" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-smooth block">
                      +44 7417 556926
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm opacity-80">
          <p>&copy; {currentYear} Grace Rhythm Sounds. All rights reserved.</p>
          <p className="mt-2">
            Developed by{" "}
            <a
              href="https://brightwebs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 underline hover:text-sky-300 transition-smooth"
            >
              Bright Webs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
