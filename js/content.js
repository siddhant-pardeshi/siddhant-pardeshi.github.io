/* ============================================================
   CONTENT — single source of truth.
   Edit this file to update the site. Push to the deployment
   branch and GitHub Actions publishes the change automatically.

   HOW TO ADD A LINKEDIN POST:
     posts: add a record below (see schema comment). Set
     featuredRank on your most popular posts (1 = most popular).
     Set latestPostId to the record id of your newest post.
     Then update postsUpdatedAt.
   HOW TO ADD PHOTOS:
     drop the file in assets/hackathons/<event>/ (or portrait /
     certificates / projects/<project>/), then add a galleryItems
     record with the exact path and a real caption.
   ============================================================ */

window.CONTENT = (function () {
  "use strict";

  /* ---------- Identity & contact (from resume) ---------- */
  var site = {
    name: "Siddhant Pardeshi",
    roleLabel: "Software Developer | Java, Spring Boot, SQL & AWS",
    positioning: "Entry-level Computer Engineering graduate interested in Software Developer or Backend Engineer opportunities.",
    location: "Pune, Maharashtra, India",
    email: "siddhantpardeshi307@gmail.com",
    emailHref: "mailto:siddhantpardeshi307@gmail.com",
    phone: "+91 77219 17549",
    phoneHref: "tel:+917721917549",
    showPhone: true, // edit to false to hide the phone line publicly
    linkedin: "https://www.linkedin.com/in/siddhant-pardeshi-53788221a",
    github: "https://github.com/siddhant-pardeshi",
    resume: {
      path: "assets/resume/Siddhant_Pardeshi_General_Resume.pdf",
      label: "Siddhant_Pardeshi_General_Resume.pdf",
      available: true
    },
    availability: {
      enabled: true, // edit to false to hide the availability chip
      text: "Available to join immediately"
    },
    emailSubject: "Role discussion - Siddhant Pardeshi",
    profileSummary:
      "Siddhant Pardeshi is a Pune-based Computer Engineering graduate (SPPU, CGPA 8.13/10; GATE 2025 qualified) focused on Java, Spring Boot, MySQL, and React. His projects include BankNest, with 8+ REST APIs and transactional fund-transfer workflows, and LifeDrop, with 10+ REST APIs and role-based donation management. His team, UrbanSync, placed 4th overall at the OpenAI DevDay Exchange - Metro Hackathon Pune with MetroMind. Contact: siddhantpardeshi307@gmail.com."
  };

  /* ---------- LinkedIn posts ----------
     Schema per record:
     {
       id: "p1",
       url: "https://www.linkedin.com/feed/update/...",  // REQUIRED: the real direct post URL
       title: "Short headline for the post",
       excerpt: "Owner-approved summary or excerpt",
       image: "assets/...",        // optional
       imageAlt: "...",            // optional
       publishedAt: "2026-08-14",  // optional ISO date (YYYY-MM-DD)
       featuredRank: 1,            // optional; lower = more popular; rank 1 leads the spotlight
       reactions: 0, comments: 0,  // optional verified figures
       measuredAt: "2026-08-20",   // snapshot date for figures
       sourceCheckedAt: "2026-08-20"
     }
     featuredPostId / latestPostId select the spotlight + latest shortcut.
     Unknown fields should be omitted, not guessed. */
  var postsConfig = {
    postsUpdatedAt: null,   // e.g. "2026-11-01" — set when the collection is curated
    featuredPostId: null,   // e.g. "p1"
    latestPostId: null,     // e.g. "p3" — must be a post YOU confirm is latest
    rankingMethod: "featuredRank", // "featuredRank" | "engagement" (only with verified figures)
    posts: [
      /* EXAMPLE (delete comments when adding real posts):
      {
        id: "p1",
        url: "https://www.linkedin.com/feed/update/urn:li:activity:0000000000000000000/",
        title: "4th overall at the Metro Hackathon with Team UrbanSync",
        excerpt: "From idea to demo in 36 hours - what building MetroMind taught me about shipping as a team.",
        publishedAt: "2026-05-20",
        featuredRank: 1
      }
      */
    ]
  };

  /* ---------- GitHub highlights ----------
     featuredRank = owner-curated order. Verified stats are imported
     by the scheduled workflow into data/github-snapshot.json and are
     never invented here. */
  var repos = [
    {
      projectId: "banknest",
      repositoryUrl: "https://github.com/siddhant-pardeshi/BankNest",
      featuredRank: 1,
      description: "Full-stack banking web app built with Spring Boot and React - account workflows, transfers, and transaction history."
    },
    {
      projectId: "lifedrop",
      repositoryUrl: "https://github.com/siddhant-pardeshi/BloodDonation-Management",
      featuredRank: 2,
      description: "Role-based blood donation management system connecting donors, hospitals, and blood camps - Spring Boot + MySQL REST API with a React (Vite) frontend, live inventory for all 8 blood groups, and 90-day eligibility rules."
    },
    {
      projectId: "metromind",
      repositoryUrl: "https://github.com/siddhant-pardeshi/MetroMind",
      featuredRank: 3,
      description: "Team UrbanSync's OpenAI DevDay Exchange - Metro Hackathon Pune build: 4th place overall, top-10 finalist. AI commute copilot and civic toolkit for the Pune Metro (Urban Mobility track)."
    }
  ];

  /* ---------- Skills: group -> items -> evidence ----------
     Evidence only where the resume/repo support it. */
  var skillGroups = [
    {
      id: "languages",
      label: "Languages",
      skills: [
        { name: "Core Java (Java 17)", desc: "My primary language - used for both full-stack projects, from service layer logic to transactional workflows.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }, { label: "NPTEL Elite certificate", href: "https://drive.google.com/file/d/1V1Tzg6wp1lo1I_KfluyhWuTI4X9e8OdT/view?usp=sharing" }] },
        { name: "C", desc: "Foundation language from coursework; comfortable with pointers, memory model, and low-level reasoning.", evidence: [{ label: "Coursework", href: "#about" }] },
        { name: "C++", desc: "Used for data structures and algorithms practice and coursework.", evidence: [{ label: "Coursework", href: "#about" }, { label: "DSA course - LearnYard", href: "https://drive.google.com/file/d/1jeOdPghC7RwZJizlb7fIOtzu11y8DcjJ/view?usp=sharing" }] },
        { name: "JavaScript", desc: "Powers the React frontends of both projects and this portfolio's interactive pieces.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "SQL", desc: "Hand-written queries, relational modeling, and schema design for MySQL.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] }
      ]
    },
    {
      id: "backend",
      label: "Backend",
      skills: [
        { name: "Spring Boot", desc: "The backbone of both projects: REST controllers, service layer rules, and configuration.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "Spring Data JPA", desc: "Repository layer over MySQL - entity mapping, relationships, and query methods.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "Hibernate", desc: "ORM for LifeDrop's normalized schema - users, inventory, requests, camps.", evidence: [{ label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "REST APIs", desc: "8+ endpoints in BankNest (deposits, withdrawals, transfers, history); 10+ in LifeDrop (auth, inventory, request workflow).", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "Maven", desc: "Build and dependency management for both Java projects.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "Layered architecture (MVC)", desc: "Controller -> Service -> Repository -> Entity/DTO layering in both projects - the structure behind the simulations on this site.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] }
      ]
    },
    {
      id: "frontend",
      label: "Frontend",
      skills: [
        { name: "React.js", desc: "Role-specific dashboards in LifeDrop; live account dashboard in BankNest.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "React Router", desc: "Protected routes and navigation in both frontends.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "HTML5", desc: "Semantic markup across projects and this site.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "CSS3", desc: "Responsive layouts; this portfolio's design system is hand-built CSS.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "Bootstrap 5", desc: "Responsive UI components for BankNest's React dashboard.", evidence: [{ label: "Used in BankNest", href: "#banknest" }] },
        { name: "Axios", desc: "Centralized API layer on the client for both projects.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] }
      ]
    },
    {
      id: "databases",
      label: "Relational databases",
      skills: [
        { name: "MySQL", desc: "Primary database for both projects.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "Schema design", desc: "Normalized schema for LifeDrop: users, blood inventory, requests, donation camps, enum-based statuses.", evidence: [{ label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "Relational modeling", desc: "Foreign keys and relationships across user, transaction, inventory, and request data.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "SQL queries", desc: "Joins, aggregations, and constraint-aware updates behind transaction history and inventory tracking.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] }
      ]
    },
    {
      id: "tools",
      label: "Tools & platforms",
      skills: [
        { name: "Git (version control)", desc: "Branches, commits, and PR-style workflow across every project.", evidence: [{ label: "All repositories", href: "https://github.com/siddhant-pardeshi" }] },
        { name: "GitHub", desc: "Home of BankNest, LifeDrop, MetroMind, and this portfolio.", evidence: [{ label: "Explore my GitHub", href: "https://github.com/siddhant-pardeshi" }] },
        { name: "Eclipse", desc: "Java IDE for backend development.", evidence: [] },
        { name: "VS Code", desc: "Editor for React, SQL, and web work.", evidence: [] },
        { name: "Postman", desc: "API testing for the REST endpoints in both projects.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "Windows", desc: "Daily development environment.", evidence: [] },
        { name: "Ubuntu", desc: "Linux comfort for tooling and deployment-style workflows.", evidence: [] }
      ]
    },
    {
      id: "cloud",
      label: "Cloud",
      skills: [
        { name: "Amazon Web Services (AWS)", desc: "Completed AWS Cloud Practitioner Essentials training - the named training credential, not a certification exam pass.", evidence: [{ label: "Training credential", href: "https://drive.google.com/file/d/1uMvNAIeQBrxGk954_5tUb48BuX_xMQOr/view?usp=sharing" }] }
      ]
    },
    {
      id: "concepts",
      label: "Core concepts",
      skills: [
        { name: "Data Structures & Algorithms", desc: "The core of my problem-solving practice - LearnYard DSA course plus ongoing practice.", evidence: [{ label: "DSA course - LearnYard", href: "https://drive.google.com/file/d/1jeOdPghC7RwZJizlb7fIOtzu11y8DcjJ/view?usp=sharing" }] },
        { name: "Object-Oriented Programming (OOP)", desc: "Encapsulation and layering show up directly in how I structure services and entities.", evidence: [{ label: "Used in BankNest", href: "#banknest" }, { label: "Used in LifeDrop", href: "#lifedrop" }] },
        { name: "DBMS", desc: "Normalization, transactions, and consistency - see the atomic transfer simulation in BankNest.", evidence: [{ label: "See the transfer sim", href: "#banknest" }] }
      ]
    }
  ];

  /* ---------- Achievements (evidence URLs from resume) ---------- */
  var achievements = {
    hackathon: {
      result: "4th place overall",
      event: "OpenAI DevDay Exchange - Metro Hackathon Pune",
      context: "Team UrbanSync / MetroMind / Top 10 finalists",
      links: [
        { label: "Project", href: "https://github.com/siddhant-pardeshi/MetroMind" },
        { label: "Event post", href: "https://lnkd.in/p/dpsMwwXf" }
      ]
    },
    items: [
      {
        id: "gate",
        kind: "Examination",
        title: "GATE 2025 qualified",
        desc: "Computer Science & Engineering. No score or rank is published here - the official scorecard is the source.",
        evidence: [{ label: "Scorecard", href: "https://drive.google.com/file/d/1FfntyEoafJDlVzbDJGiCSOo-q0YNpqTU/view?usp=sharing" }]
      },
      {
        id: "uitest",
        kind: "Award",
        title: "Autonomous UI Testing Hackathon",
        desc: "Award recipient.",
        evidence: [{ label: "Certificate", href: "https://drive.google.com/file/d/1l4UGtrblxng1qEPR1pxTGOLCrQ4f_y3F/view?usp=sharing" }]
      },
      {
        id: "fusion",
        kind: "Participation",
        title: "Fusion 2026 International Hackathon (SKNCOE)",
        desc: "Participant; Certificate of Achievement.",
        date: "Oct 2026",
        evidence: [{ label: "Certificate", href: "https://lnkd.in/p/dXfRkyyR" }]
      },
      {
        id: "vidyadhan",
        kind: "Scholarship",
        title: "Vidyadhan Scholarship",
        desc: "Selected for academic excellence.",
        evidence: []
      },
      {
        id: "tfws",
        kind: "Recognition",
        title: "TFWS Scheme - Government of Maharashtra",
        desc: "Tuition fee waiver for engineering admission.",
        evidence: []
      }
    ]
  };

  /* ---------- Education & credentials ---------- */
  var education = {
    degree: {
      title: "Bachelor of Engineering, Computer Engineering",
      school: "Savitribai Phule Pune University (SPPU), Pune",
      dates: "Dec 2021 - Jun 2025",
      cgpa: "CGPA 8.13/10 - First Class with Distinction"
    },
    schools: [
      { name: "HSC (Class XII), Science - Vidya Valley North Point Junior College", year: "2021", score: "74.77%" },
      { name: "SSC (Class X) - D.I.C.'s English Medium School", year: "2018", score: "94.40%" }
    ]
  };

  var credentials = [
    {
      name: "AWS Cloud Practitioner Essentials",
      issuer: "Amazon Web Services",
      status: "Training completed", // named training credential - NOT an exam pass
      date: null,
      evidence: [{ label: "Certificate", href: "https://drive.google.com/file/d/1uMvNAIeQBrxGk954_5tUb48BuX_xMQOr/view?usp=sharing" }]
    },
    {
      name: "Java Full Stack Development",
      issuer: "IT Vedant - Java, Spring Boot, MySQL, HTML/CSS/JavaScript, React",
      status: "In progress",
      date: null,
      evidence: []
    },
    {
      name: "Programming in Java - NPTEL, IIT Kharagpur",
      issuer: "Elite Certificate",
      status: "Completed",
      date: "Jan-Apr 2024",
      evidence: [{ label: "Certificate", href: "https://drive.google.com/file/d/1V1Tzg6wp1lo1I_KfluyhWuTI4X9e8OdT/view?usp=sharing" }]
    },
    {
      name: "100% Job-Ready DSA Course",
      issuer: "LearnYard",
      status: "Completed",
      date: "Jul 2024",
      evidence: [{ label: "Certificate", href: "https://drive.google.com/file/d/1jeOdPghC7RwZJizlb7fIOtzu11y8DcjJ/view?usp=sharing" }]
    }
  ];

  /* ---------- Gallery ----------
     Each record: { id, src?, width?, height?, alt, caption, category,
     eventName?, date?, projectId?, featured? }
     category: "hackathons" | "team" | "projects" | "certificates" | "portrait"
     Until you add photos, tiles render as designed abstract
     illustrations (marked as such) based on real achievements. */
  var galleryItems = [
    {
      id: "g-metro-1",
      category: "hackathons",
      caption: "OpenAI DevDay Exchange - Metro Hackathon Pune",
      eventName: "Metro Hackathon Pune",
      alt: "Abstract illustration of the Metro Hackathon stage with a lime signal line and 4th place marker",
      placeholder: { motif: "stage", accent: "lime" },
      featured: true,
      size: "wide"
    },
    {
      id: "g-metro-2",
      category: "team",
      caption: "Building MetroMind with Team UrbanSync",
      eventName: "Metro Hackathon Pune",
      alt: "Abstract illustration of four connected teammate nodes around a shared build",
      placeholder: { motif: "team", accent: "violet" },
      featured: true
    },
    {
      id: "g-uitest-1",
      category: "hackathons",
      caption: "Autonomous UI Testing Hackathon - Award",
      eventName: "Autonomous UI Testing Hackathon",
      alt: "Abstract illustration of a UI window being checked by an automated test cursor",
      placeholder: { motif: "award", accent: "apricot" }
    },
    {
      id: "g-fusion-1",
      category: "hackathons",
      caption: "Fusion 2026 International Hackathon (SKNCOE)",
      eventName: "Fusion 2026",
      date: "Oct 2026",
      alt: "Abstract illustration of an international hackathon arena with orbiting participant badges",
      placeholder: { motif: "orbit", accent: "violet" }
    },
    {
      id: "g-portrait-1",
      category: "portrait",
      caption: "Siddhant Pardeshi - portrait coming soon",
      alt: "SP monogram placeholder for a portrait photo",
      placeholder: { motif: "monogram", accent: "lime" },
      featured: true,
      size: "tall"
    },
    {
      id: "g-banknest-1",
      category: "projects",
      caption: "BankNest - backend architecture",
      projectId: "banknest",
      alt: "Schematic illustration of BankNest's layered architecture",
      placeholder: { motif: "schema", accent: "violet" }
    },
    {
      id: "g-lifedrop-1",
      category: "projects",
      caption: "LifeDrop - request workflow",
      projectId: "lifedrop",
      alt: "Schematic illustration of LifeDrop's Pending to Approved to Fulfilled workflow",
      placeholder: { motif: "flow", accent: "apricot" }
    }
  ];

  /* ---------- Byte: guide lines ---------- */
  var byteLines = {
    greeting: "Hey, I'm Byte. Want the quick tour?",
    idle: [
      "Two projects, lots of backend thinking.",
      "Short on time? I've got a quick summary.",
      "The skill map links every tool to real evidence."
    ],
    reactions: [
      "Hehe, that tickles.",
      "Blush mode activated.",
      "Okay okay, one more spin.",
      "You found my happy dance!"
    ],
    projects: "This one shows how a transfer stays consistent.",
    achievements: "Team UrbanSync placed 4th overall. Take a look.",
    contact: "Found what you needed? Siddhant's email is right here.",
    sleepy: "Zzz... take your time, I'll be here."
  };

  return {
    site: site,
    postsConfig: postsConfig,
    repos: repos,
    skillGroups: skillGroups,
    achievements: achievements,
    education: education,
    credentials: credentials,
    galleryItems: galleryItems,
    byteLines: byteLines
  };
})();
