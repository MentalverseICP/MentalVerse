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
        { label: "Health Guidance", href: "#health-guidance" },
        { label: "Book Appointment", href: "#appointment" }
      ]
    },
    {
      title: "Solution",
      links: [
        { label: "Docs", href: "https://mentalverse-docs.vercel.app" },        
        { label: "Care", href: "https://mentalverse-docs.vercel.app/user-guides" },
        { label: "Support", href: "https://mentalverse-docs.vercel.app/mentorship" },
        { label: "What We Do", href: "https://mentalverse-docs.vercel.app/platform-overview" },
        { label: "Expertise", href: "https://mentalverse-docs.vercel.app/web3-technology" }
      ]
    },
    {
      title: "Follow Us",
      social: [
        // { icon: Facebook, href: "#facebook", label: "Facebook" },
        { icon: Instagram, href: "#instagram", label: "Instagram" },
        { icon: Twitter, href: "https://x.com/mentalverse_ICP", label: "X" },
        { icon: Linkedin, href: "#linkedin", label: "LinkedIn" }
      ]
    }
  ];

  return (
    <footer className="bg-background/80 backdrop-blur-lg border-t border-border">
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
                        href={'href' in link ? link.href : '#'}
                        target={'href' in link ? '_blank' : undefined}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center space-x-2"
                      >
                        {'icon' in link && link.icon && <link.icon className="w-4 h-4" />}
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
                      target='_blank'
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