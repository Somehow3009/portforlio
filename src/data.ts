export interface Skill {
  id: string
  name: string
  icon: string
  color: string
  mastery: number // 0-100
  years: number
  tagline: string
}

export interface Project {
  id: string
  title: string
  color: string
  description: string
  problem: string
  solution: string
  tech: string[]
  github: string
  live: string
  highlight: string
}

export interface ProfileInfo {
  name: string
  title: string
  bio: string
  location: string
  email: string
  phone: string
  education: string
  socials: { label: string; url: string }[]
}

export const profile: ProfileInfo = {
  name: 'HUYNH HUU KHANG',
  title: 'AI / Full Stack Engineer',
  bio: 'AI-focused Full Stack Engineer with experience building AI-powered applications, SaaS platforms, and backend services using React, Next.js, Node.js, Python, and modern LLM technologies. Hands-on experience integrating OpenAI and Gemini APIs, RAG pipelines, embeddings, prompt engineering, and AI Agents into real-world products.',
  location: 'Can Tho, Viet Nam',
  email: 'huukhang3092@gmail.com',
  phone: '(+84) 932 948 900',
  education: 'B.E. INFORMATION TECHNOLOGY · CAN THO UNIVERSITY · 2024',
  socials: [
    { label: 'GitHub', url: 'https://github.com/somehow3009' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/hữu-khang-huỳnh' },
  ],
}

export const skills: Skill[] = [
  {
    id: 'llm-ai',
    name: 'LLM / AI',
    icon: '🧠',
    color: '#a855f7',
    mastery: 88,
    years: 2,
    tagline: 'OpenAI · Gemini · RAG · AI Agents',
  },
  {
    id: 'react-nextjs',
    name: 'React / Next.js',
    icon: '⚛️',
    color: '#61dafb',
    mastery: 90,
    years: 3,
    tagline: 'Responsive UI · TypeScript · Tailwind',
  },
  {
    id: 'nodejs',
    name: 'Node.js / NestJS',
    icon: '🟩',
    color: '#68a063',
    mastery: 87,
    years: 3,
    tagline: 'REST APIs · Backend services · Express',
  },
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    color: '#f7c02b',
    mastery: 82,
    years: 3,
    tagline: 'Flask · ML pipelines · LLM workflows',
  },
  {
    id: 'database',
    name: 'Databases',
    icon: '🗄️',
    color: '#00f0ff',
    mastery: 80,
    years: 3,
    tagline: 'PostgreSQL · MySQL · MongoDB · Redis',
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: '🔧',
    color: '#39ff88',
    mastery: 75,
    years: 2,
    tagline: 'Docker · GitHub Actions · Linux · AWS',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    icon: '🏛️',
    color: '#ffd24a',
    mastery: 80,
    years: 3,
    tagline: 'Clean Architecture · SOLID · RESTful · RBAC',
  },
]

export interface Experience {
  id: string
  company: string
  role: string
  period: string
  color: string
  bullets: string[]
  tech: string[]
}

export const experiences: Experience[] = [
  {
    id: 'titops',
    company: 'Titops',
    role: 'Project Coordinator & Software Engineer',
    period: 'Jul 2024 – Present',
    color: '#ffd24a',
    bullets: [
      'Developed and maintained full-stack web applications and AI-powered product features.',
      'Built backend services and REST APIs using Node.js/NestJS, Python, and Laravel.',
      'Integrated OpenAI and Gemini APIs for LLM-powered features and AI Agents.',
      'Designed RAG-based workflows using embeddings and retrieval for context-aware responses.',
      'Built responsive frontends with React, Next.js, and TypeScript.',
      'Wrote and optimized queries for PostgreSQL, MySQL, MongoDB, and Redis.',
      'Used Docker and Git-based workflows for development and deployment.',
      'Collaborated directly with clients and cross-functional engineering teams.',
    ],
    tech: ['React', 'Next.js', 'NestJS', 'Python', 'OpenAI', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'trustxlabs',
    company: 'TrustXLabs',
    role: 'Delivery Center – Tools & Technology Engineer',
    period: 'Mar 2025 – Mar 2026',
    color: '#00f0ff',
    bullets: [
      'Developed API-driven tools and backend services for client delivery.',
      'Researched AI-powered dev tools and emerging technologies.',
      'Implemented CI/CD automation with GitHub Actions.',
      'Improved performance with Redis caching and async processing.',
      'Conducted technical feasibility research and prototyping.',
    ],
    tech: ['Python', 'Node.js', 'GitHub Actions', 'Redis', 'AWS'],
  },
  {
    id: 'taydocent',
    company: 'Tay Do Cement JSC',
    role: 'IT Helpdesk – Software Developer',
    period: 'Mar 2024 – Jul 2024',
    color: '#39ff88',
    bullets: [
      'Supported internal software systems and investigated issues.',
      'Analyzed system behavior and coordinated troubleshooting.',
      'Maintained Linux servers and networking infrastructure.',
    ],
    tech: ['Linux', 'Nginx', 'Networking'],
  },
  {
    id: 'viettel',
    company: 'Viettel Can Tho',
    role: 'Software Development Intern',
    period: 'May 2023 – Jul 2023',
    color: '#ff2d95',
    bullets: [
      'Researched IoT solutions for smart aquaculture.',
      'Studied sensors, connected devices, and automation systems.',
      'Developed Python/Flask prototypes for sound analysis and object recognition.',
    ],
    tech: ['Python', 'Flask', 'IoT'],
  },
]

export const projects: Project[] = [
  {
    id: 'bizen-ai',
    title: 'Bizen.ai — AI SaaS Platform',
    color: '#a855f7',
    description: 'AI-powered SaaS platform integrating LLM APIs, RAG pipelines, and prompt engineering for real-world business use cases.',
    problem: 'Businesses need practical AI solutions but lack the expertise to integrate LLMs into their workflows.',
    solution:
      'Designed and implemented AI application workflows using OpenAI/Gemini APIs, RAG-based retrieval, embeddings, and prompt engineering. Coordinated the full product lifecycle from MVP to production.',
    tech: ['OpenAI API', 'Gemini API', 'RAG', 'Embeddings', 'React', 'Node.js'],
    github: 'https://github.com/somehow3009',
    live: '',
    highlight: 'Full AI SaaS product — from client requirements to production',
  },
  {
    id: 'ai-agent-workflows',
    title: 'AI Agent Integration',
    color: '#00f0ff',
    description: 'Built AI Agent pipelines for context-aware chatbots and automated decision-making systems.',
    problem: 'Static chatbots fail to handle complex, context-dependent business queries.',
    solution:
      'Integrated LLM-powered AI Agents with tool-calling, memory, and RAG retrieval to deliver context-aware, multi-turn conversations for SaaS products.',
    tech: ['Python', 'OpenAI API', 'RAG', 'Redis', 'PostgreSQL'],
    github: 'https://github.com/somehow3009',
    live: '',
    highlight: 'Multi-turn AI agents with real-time context retrieval',
  },
  {
    id: 'fullstack-saas',
    title: 'Full-Stack SaaS Platform',
    color: '#39ff88',
    description: 'End-to-end SaaS application with REST APIs, responsive frontend, and production deployment.',
    problem: 'Clients need scalable, maintainable web applications with modern tech stacks.',
    solution:
      'Built backend services with NestJS/Express, React/Next.js frontend, PostgreSQL/MongoDB data layer, and Docker-based CI/CD pipelines using GitHub Actions.',
    tech: ['React', 'Next.js', 'NestJS', 'PostgreSQL', 'Docker', 'GitHub Actions'],
    github: 'https://github.com/somehow3009',
    live: '',
    highlight: 'Full-stack delivery — API · UI · DB · DevOps',
  },
  {
    id: 'iot-aquaculture',
    title: 'IoT Smart Aquaculture',
    color: '#f7c02b',
    description: 'Research prototype for IoT-based smart aquaculture automation using sensors and AI.',
    problem: 'Traditional aquaculture lacks real-time monitoring and automated decision systems.',
    solution:
      'Researched IoT sensor networks and developed Python/Flask prototypes for sound analysis and object recognition in aquaculture environments.',
    tech: ['Python', 'Flask', 'IoT', 'Sensors', 'Machine Learning'],
    github: 'https://github.com/somehow3009',
    live: '',
    highlight: 'IoT + AI prototype for aquaculture automation',
  },
]

export const zoneMeta = [
  { id: 'landing', label: 'LANDING PLATFORM', coord: [0, 0, 0] },
  { id: 'skills', label: 'THE SKILL FORGE', coord: [-38, 0, 8] },
  { id: 'projects', label: 'THE PROJECT GALAXY', coord: [38, 0, 8] },
  { id: 'career', label: 'THE CAREER TRAIL', coord: [-38, -10, -8] },
  { id: 'hubs', label: 'THE INNOVATION HUB', coord: [0, 0, 40] },
]
