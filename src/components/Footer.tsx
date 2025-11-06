import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Music } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Grace Rhythm Sounds" className="h-10 w-10" />
              <span className="font-bold text-lg">Grace Rhythm Sounds</span>
            </Link>
            <p className="text-sm opacity-80 mb-4">
            Grace Rhythm Sounds | Inspiring souls through gospel music, uplifting melodies, and divine rhythms.
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
                href="https://tiktok.com/@gracerhythmsounds"
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

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/collaborate" className="text-sm opacity-80 hover:text-accent transition-smooth">
                  Collaborate
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm opacity-80 hover:text-accent transition-smooth">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-sm opacity-80 hover:text-accent transition-smooth">
                  News & Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Email: info@gracerhythmsounds.org</li>
              <li>Business: support@gracerhythmsounds.org</li>
              <li>Location: Global Operations, Lagos State</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm opacity-80">
          <p>&copy; {currentYear} Grace Rhythm Sounds. All rights reserved.</p>
          <p className="mt-2">
            Developed by{" "}
            <a
              href="https://webs.brights.com.ng"
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
