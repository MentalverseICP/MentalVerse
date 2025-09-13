import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Contact",
      links: [
        { label: "123 Main Street, City, State 12345", icon: MapPin },
        { label: "+1 (555) 123-4567", icon: Phone },
        { label: "info@mentalverse.com", icon: Mail }
      ]
    },
    {
      title: "Navigate",
      links: [
        { label: "Home", href: "#home" },
        { label: "Services", href: "#services" },
        { label: "Testimonials", href: "#testimonials" },
        { label: "Resources", href: "#resources" },
        { label: "Download App", href: "#download" }
      ]
    },
    {
      title: "Solution",
      links: [
        { label: "Care", href: "#care" },
        { label: "Support", href: "#support" },
        { label: "What We Do", href: "#what-we-do" },
        { label: "Expertise", href: "#expertise" }
      ]
    },
    {
      title: "Follow Us",
      social: [
        { icon: Facebook, href: "#facebook", label: "Facebook" },
        { icon: Instagram, href: "#instagram", label: "Instagram" },
        { icon: Twitter, href: "#twitter", label: "Twitter" },
        { icon: Linkedin, href: "#linkedin", label: "LinkedIn" }
      ]
    }
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-foreground font-semibold text-lg mb-6">{section.title}</h3>
              
              {section.links && (
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href || '#'}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center space-x-2"
                      >
                        {link.icon && <link.icon className="w-4 h-4" />}
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {section.social && (
                <div className="flex space-x-4">
                  {section.social.map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-muted hover:bg-primary rounded-lg flex items-center justify-center transition-colors duration-300 group"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
                    </motion.a>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Copyright */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border text-center"
        >
          <p className="text-muted-foreground">
            © {currentYear} MentalVerse. All rights reserved. Built with Web3 technology for a better mental health future.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};