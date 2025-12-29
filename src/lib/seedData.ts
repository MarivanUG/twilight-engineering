export const sampleSettings = {
  siteName: 'TECL Engineering',
  supportEmail: 'support@tecl.com',
  enableStore: true,
  headerLogo: '',
  footerLogo: '',
  socialLinks: {
    facebook: 'https://facebook.com/tecl',
    twitter: 'https://twitter.com/tecl',
    linkedin: 'https://linkedin.com/company/tecl'
  },
  metaTitle: 'TECL Engineering — Logistics, Security & Construction',
  metaDescription: 'TECL Engineering provides logistics, security systems, and civil engineering services across East Africa. We deliver safe, reliable, and innovative solutions for public and private sectors.'
};

export const sampleSlides = [
  { id: 's1', title: 'Reliable Logistics', subtitle: 'Timely and secure cargo delivery across the region', order: 0, imageUrl: '' },
  { id: 's2', title: 'Secure Systems', subtitle: 'Integrated security solutions for businesses and estates', order: 1, imageUrl: '' },
  { id: 's3', title: 'Construction & Maintenance', subtitle: 'Durable infrastructure and professional maintenance services', order: 2, imageUrl: '' }
];

export const sampleProducts = [
  { id: 'p1', name: 'Solar Floodlight', price: 120000, description: 'High-intensity solar floodlight for outdoor security and site lighting.', imageUrl: '', createdAt: Date.now() },
  { id: 'p2', name: 'Industrial UPS', price: 450000, description: 'Reliable power backup for critical systems and servers.', imageUrl: '', createdAt: Date.now() },
];

export const sampleProjects = [
  { id: 'pr1', title: 'Kampala Logistics Hub', summary: 'Design and build of a regional logistics and warehousing hub.', imageUrl: '', createdAt: Date.now() },
  { id: 'pr2', title: 'Security Upgrade — City Mall', summary: 'Installed access control and CCTV systems across multiple sites.', imageUrl: '', createdAt: Date.now() }
];

export const sampleTeam = [
  { id: 't1', name: 'Jane Doe', role: 'Managing Director', bio: 'Over 15 years managing engineering projects across East Africa.', imageUrl: '' },
  { id: 't2', name: 'John Otim', role: 'Head of Security', bio: 'Experienced security systems engineer and project lead.', imageUrl: '' }
];

export const sampleMessages = [
  { id: 'm1', from: 'visitor', text: 'Hello, I need a quote for site lighting', createdAt: Date.now() }
];

export const sampleServices = [
  { id: 's1', icon: 'Zap', title: "Power Line Construction", description: "Comprehensive surveying, designing, and construction of Low, Medium, and High Voltage networks.", order: 0 },
  { id: 's2', icon: 'Sun', title: "Solar Systems", description: "Professional design and sizing of solar energy systems for home & industry.", order: 1 },
  { id: 's3', icon: 'Video', title: "CCTV & Security", description: "Installation of advanced IP Cameras and security alarm systems.", order: 2 },
  { id: 's4', icon: 'Droplet', title: "Civil & Water Works", description: "General civil engineering services including plumbing infrastructure.", order: 3 },
  { id: 's5', icon: 'Wind', title: "AC Systems", description: "Complete HVAC solutions including design, installation, and maintenance.", order: 4 },
  { id: 's6', icon: 'Wrench', title: "Underground Cabling", description: "Specialized trenching and cable laying for Medium Voltage lines.", order: 5 },
  { id: 's7', icon: 'Battery', title: "Material Supply", description: "Procurement and supply of genuine electrical materials.", order: 6 },
  { id: 's8', icon: 'Monitor', title: "Electrical Wiring", description: "Certified industrial, commercial, and residential wiring services.", order: 7 },
];

export const sampleTestimonials = [
  { id: 'test1', client: "John Doe", role: "Project Manager, Acme Corp", text: "TECL delivered our project ahead of schedule and within budget. Their professionalism and expertise are unmatched!", createdAt: Date.now() },
  { id: 'test2', client: "Jane Smith", role: "CEO, Innovate Ltd", text: "The security system installed by TECL has significantly improved our peace of mind. Highly recommend their services!", createdAt: Date.now() },
];

export const samplePartners = [
  { id: 'p1', name: "EACPL / Kayunga", logoUrl: "https://placehold.co/150x50/F3F4F6/000000/png?text=Partner+1", order: 0 },
  { id: 'p2', name: "Sogea Satom", logoUrl: "https://placehold.co/150x50/F3F4F6/000000/png?text=Partner+2", order: 1 },
  { id: 'p3', name: "Nile Heavy Engineering", logoUrl: "https://placehold.co/150x50/F3F4F6/000000/png?text=Partner+3", order: 2 },
  { id: 'p4', name: "Bwiza Furniture World", logoUrl: "https://placehold.co/150x50/F3F4F6/000000/png?text=Partner+4", order: 3 },
  { id: 'p5', name: "NWSC Mokono", logoUrl: "https://placehold.co/150x50/F3F4F6/000000/png?text=Partner+5", order: 4 },
  { id: 'p6', name: "Tian Tang Group", logoUrl: "https://placehold.co/150x50/F3F4F6/000000/png?text=Partner+6", order: 5 }
];

export const sampleCopy = {
  hero: {
    title: 'We Build Reliable Infrastructure & Secure Solutions',
    subtitle: 'TECL Engineering delivers integrated logistics, security systems, and civil engineering services across East Africa. From concept to commissioning — we ensure safety, quality, and on-time delivery.',
    cta: 'Explore Our Services'
  },
  services: [
    {
      key: 'logistics',
      title: 'Logistics & Supply Chain',
      description: 'Comprehensive logistics services including freight management, warehousing, fleet operations, and customs compliance. We optimise routes and secure high-value cargo with end-to-end tracking.'
    },
    {
      key: 'security',
      title: 'Security Systems & Monitoring',
      description: 'Design and installation of CCTV, access control, alarm systems and central monitoring. We integrate hardware and cloud services for reliable 24/7 protection.'
    },
    {
      key: 'civil',
      title: 'Civil Engineering & Construction',
      description: 'Project planning, design, and construction management for industrial, commercial, and infrastructure projects — delivering durable, code-compliant outcomes.'
    },
    {
      key: 'maintenance',
      title: 'Maintenance & Technical Support',
      description: 'Preventative and corrective maintenance services to keep your facilities and equipment operational with minimal downtime.'
    },
    {
      key: 'consulting',
      title: 'Consultancy & Compliance',
      description: 'Advisory services covering safety, regulatory compliance, procurement strategy, and operational efficiency to reduce costs and risk.'
    }
  ],
  about: {
    intro: 'TECL Engineering is a multidisciplinary engineering firm serving public and private clients in East Africa. We combine local expertise with international standards to deliver safe, reliable and sustainable projects.',
    mission: 'To provide world-class engineering and logistical support that empowers businesses and communities to thrive, ensuring safety, efficiency, and sustainability in every project we undertake.',
    vision: 'To be the leading partner for infrastructure and security solutions in Africa, recognized for our unwavering commitment to quality, integrity, and technological advancement.'
  }
};
