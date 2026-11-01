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
    aboutPortrait: "assets/portrait/formal-03-art-wall.jpg",
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
     All photos are owner-supplied and placed under assets/ with
     descriptive names. Captions describe what is actually in the
     photo; event names come from the owner's folders and visible
     event signage. Categories: hackathons | team | events | hobby |
     portrait | projects. video: true renders a playable lightbox. */
  var METRO = "OpenAI DevDay Exchange - Metro Hackathon Pune";
  var FUSION = "Fusion 2026 International Hackathon (SKNCOE)";
  var GENSPARK = "Genspark community event";
  var MEET = "Tech community meetups";
  var TREK = "Jivdhan Fort trek & camping";
  var PORT = "Portfolio portraits";

  var galleryItems = [
    /* ----- Metro Hackathon: the story ----- */
    { id: "m-01", src: "assets/hackathons/metro-hackathon/metro-01-team-arrives.jpg", category: "team", caption: "Team UrbanSync arrives at the venue", eventName: METRO, alt: "Team UrbanSync taking a group selfie in the venue lobby", featured: true },
    { id: "m-23", src: "assets/hackathons/metro-hackathon/metro-23-build-on-metro.jpg", category: "hackathons", caption: "The build happens on the metro itself", eventName: METRO, alt: "Hackathon participants working on laptops inside a moving Pune Metro train", featured: true, size: "wide" },
    { id: "m-09", src: "assets/hackathons/metro-hackathon/metro-09-stage-quad.jpg", category: "hackathons", caption: "On the DevDay Exchange stage", eventName: METRO, alt: "Four team members posing on the OpenAI DevDay Exchange stage under the event screen", featured: true, size: "wide" },
    { id: "m-20", src: "assets/hackathons/metro-hackathon/metro-20-devday-swag.jpg", category: "team", caption: "DevDay swag - OpenAI tote bags", eventName: METRO, alt: "Three team members holding OpenAI DevDay Exchange tote bags on stage", featured: true },
    { id: "m-24", src: "assets/hackathons/metro-hackathon/metro-24-train-hack-room.jpg", category: "hackathons", caption: "A train car turned into a hack room", eventName: METRO, alt: "A Pune Metro train coach full of participants coding on laptops", size: "wide" },
    { id: "m-06", src: "assets/hackathons/metro-hackathon/metro-06-metro-ride.jpg", category: "team", caption: "Riding the Pune Metro together", eventName: METRO, alt: "Three team members giving thumbs up inside a metro train" },
    { id: "m-07", src: "assets/hackathons/metro-hackathon/metro-07-laptop-on-metro.jpg", category: "team", caption: "Laptop out before the doors even open", eventName: METRO, alt: "Team members with a laptop on a metro train" },
    { id: "m-02", src: "assets/hackathons/metro-hackathon/metro-02-openai-banner.jpg", category: "hackathons", caption: "At the OpenAI banner", eventName: METRO, alt: "Three participants standing beside an OpenAI roll-up banner" },
    { id: "m-03", src: "assets/hackathons/metro-hackathon/metro-03-team-selfie.jpg", category: "team", caption: "Team selfie at the venue", eventName: METRO, alt: "Five team members taking a selfie in front of an OpenAI banner" },
    { id: "m-04", src: "assets/hackathons/metro-hackathon/metro-04-full-squad.jpg", category: "team", caption: "The full squad", eventName: METRO, alt: "Six team members posing together at the hackathon venue" },
    { id: "m-05", src: "assets/hackathons/metro-hackathon/metro-05-way-in.jpg", category: "team", caption: "Hyped on the way in", eventName: METRO, alt: "Group selfie in a bright venue corridor" },
    { id: "m-08", src: "assets/hackathons/metro-hackathon/metro-08-community.jpg", category: "hackathons", caption: "With the wider hackathon community", eventName: METRO, alt: "A larger group of participants with event lanyards" },
    { id: "m-10", src: "assets/hackathons/metro-hackathon/metro-10-stage-trio.jpg", category: "hackathons", caption: "Stage moment", eventName: METRO, alt: "Three team members on the DevDay Exchange stage" },
    { id: "m-11", src: "assets/hackathons/metro-hackathon/metro-11-event-video.mp4", video: true, category: "hackathons", caption: "Event film - DevDay Exchange", eventName: METRO, alt: "Video clip from the OpenAI DevDay Exchange Metro Hackathon" },
    { id: "m-12", src: "assets/hackathons/metro-hackathon/metro-12-pune-metro-logo.jpg", category: "team", caption: "At the Pune Metro mark", eventName: METRO, alt: "Three team members in front of the Pune Metro logo" },
    { id: "m-13", src: "assets/hackathons/metro-hackathon/metro-13-station-smiles.jpg", category: "team", caption: "All smiles at the metro station", eventName: METRO, alt: "Three team members giving thumbs up at the station" },
    { id: "m-14", src: "assets/hackathons/metro-hackathon/metro-14-community-wall.jpg", category: "hackathons", caption: "The community wall", eventName: METRO, alt: "Seven participants in front of the DevDay Exchange Community Event wall", size: "wide" },
    { id: "m-15", src: "assets/hackathons/metro-hackathon/metro-15-cafe-front.jpg", category: "team", caption: "Team dinner spot", eventName: METRO, alt: "The lit front of Cafe Black Cat and Wolf at night" },
    { id: "m-16", src: "assets/hackathons/metro-hackathon/metro-16-team-dinner.jpg", category: "team", caption: "Post-hackathon debrief over dinner", eventName: METRO, alt: "Six team members around a cafe table" },
    { id: "m-17", src: "assets/hackathons/metro-hackathon/metro-17-platform-selfie.jpg", category: "team", caption: "Platform selfie before the build", eventName: METRO, alt: "Five team members on the metro platform" },
    { id: "m-18", src: "assets/hackathons/metro-hackathon/metro-18-main-stage.jpg", category: "hackathons", caption: "Team UrbanSync on the main stage", eventName: METRO, alt: "Four team members on the main stage in front of the event screen", featured: true },
    { id: "m-19", src: "assets/hackathons/metro-hackathon/metro-19-stage-vertical.jpg", category: "hackathons", caption: "Stage light", eventName: METRO, alt: "Four team members standing under the stage lights" },
    { id: "m-21", src: "assets/hackathons/metro-hackathon/metro-21-stage-portrait.jpg", category: "hackathons", caption: "On stage at the community event", eventName: METRO, alt: "Three team members on stage with the event screen behind them" },
    { id: "m-22", src: "assets/hackathons/metro-hackathon/metro-22-auditorium.jpg", category: "hackathons", caption: "Sessions at the DevDay auditorium", eventName: METRO, alt: "An auditorium session with a speaker on stage" },
    /* ----- Fusion 2026 ----- */
    { id: "f-02", src: "assets/hackathons/fusion-2026/fusion-02-skncoder-group.jpg", category: "hackathons", caption: "Fusion 2026 at SKNCOE - the crew", eventName: FUSION, alt: "A large group of participants in front of the SKNCOE and Fusion banners", featured: true, size: "wide" },
    { id: "f-01", src: "assets/hackathons/fusion-2026/fusion-01-crew-selfie.jpg", category: "team", caption: "With the crew at Fusion", eventName: FUSION, alt: "Four participants taking a selfie at the Fusion hackathon" },
    { id: "f-03", src: "assets/hackathons/fusion-2026/fusion-03-night-walk.jpg", category: "team", caption: "Night walks between rounds", eventName: FUSION, alt: "Four participants on the campus at night" },
    { id: "f-04", src: "assets/hackathons/fusion-2026/fusion-04-skncoe-wall.jpg", category: "hackathons", caption: "At the SKNCOE wall", eventName: FUSION, alt: "Two participants in front of the SKNCOE honour boards" },
    { id: "f-05", src: "assets/hackathons/fusion-2026/fusion-05-build-session.jpg", category: "hackathons", caption: "Heads-down build session", eventName: FUSION, alt: "Siddhant in an event t-shirt during a work session at Fusion" },
    { id: "f-06", src: "assets/hackathons/fusion-2026/fusion-06-day-two.jpg", category: "team", caption: "Day-two energy", eventName: FUSION, alt: "Four participants outdoors on the second day" },
    { id: "f-07", src: "assets/hackathons/fusion-2026/fusion-07-event-video.mp4", video: true, category: "hackathons", caption: "Event film - Fusion 2026", eventName: FUSION, alt: "Video clip from the Fusion 2026 hackathon" },
    /* ----- Genspark community event ----- */
    { id: "gs-01", src: "assets/hackathons/genspark/genspark-01-event-banner.jpg", category: "events", caption: "Genspark community night", eventName: GENSPARK, alt: "A group under string lights beside the Genspark Event banner", featured: true, size: "wide" },
    { id: "gs-02", src: "assets/hackathons/genspark/genspark-02-rooftop-crew.jpg", category: "events", caption: "With builders on the rooftop", eventName: GENSPARK, alt: "Group selfie on a rooftop venue at night" },
    { id: "gs-03", src: "assets/hackathons/genspark/genspark-03-mural-chat.jpg", category: "events", caption: "Community conversations", eventName: GENSPARK, alt: "Three people chatting in front of a floral mural" },
    { id: "gs-04", src: "assets/hackathons/genspark/genspark-04-code-night.jpg", category: "events", caption: "Code Night crew", eventName: GENSPARK, alt: "Group selfie at the Genspark rooftop event" },
    { id: "gs-05", src: "assets/hackathons/genspark/genspark-05-terrace-talks.jpg", category: "events", caption: "Terrace talks after the event", eventName: GENSPARK, alt: "Three people on a lit terrace at night" },
    /* ----- Tech meetups ----- */
    { id: "e-17", src: "assets/events/tech-meetups/meetup-17-devcon-viii.jpg", category: "events", caption: "Zoho DevCon VIII India", eventName: MEET, alt: "Three attendees in front of the DevCon VIII India screen", featured: true },
    { id: "e-08", src: "assets/events/tech-meetups/meetup-08-map-wall.jpg", category: "events", caption: "At the famous map wall", eventName: MEET, alt: "Siddhant wearing a name badge in front of a world map wall with red hats", size: "tall" },
    { id: "e-11", src: "assets/events/tech-meetups/meetup-11-doastro-visit.jpg", category: "events", caption: "Visit to the Doastro Technologies office", eventName: MEET, alt: "Seven people in front of the Doastro Technologies logo wall" },
    { id: "e-01", src: "assets/events/tech-meetups/meetup-01-community-selfie.jpg", category: "events", caption: "With a fellow builder", eventName: MEET, alt: "Selfie with another developer at a community meetup" },
    { id: "e-02", src: "assets/events/tech-meetups/meetup-02-squad-a.jpg", category: "events", caption: "Meetup squad", eventName: MEET, alt: "Three attendees at a marble wall" },
    { id: "e-05", src: "assets/events/tech-meetups/meetup-05-catchup-a.jpg", category: "events", caption: "Community catch-up", eventName: MEET, alt: "Selfie with a fellow community member" },
    { id: "e-07", src: "assets/events/tech-meetups/meetup-07-sessions-badges.jpg", category: "events", caption: "Sessions and name badges", eventName: MEET, alt: "Four attendees with name badges beside poster walls" },
    { id: "e-09", src: "assets/events/tech-meetups/meetup-09-office-tour.jpg", category: "events", caption: "Office tour", eventName: MEET, alt: "Selfie inside a modern open office" },
    { id: "e-10", src: "assets/events/tech-meetups/meetup-10-group-map-wall.jpg", category: "events", caption: "The meetup group at the map wall", eventName: MEET, alt: "Five attendees at the world map wall" },
    { id: "e-12", src: "assets/events/tech-meetups/meetup-12-doastro-reception-a.jpg", category: "events", caption: "Doastro reception", eventName: MEET, alt: "Two attendees at a glowing reception sign" },
    { id: "e-14", src: "assets/events/tech-meetups/meetup-14-elevator-crew.jpg", category: "events", caption: "Elevator crew", eventName: MEET, alt: "Six people in a group selfie in an elevator lobby" },
    { id: "e-15", src: "assets/events/tech-meetups/meetup-15-dev-mural.jpg", category: "events", caption: "With the dev community", eventName: MEET, alt: "Five developers in front of a colorful mural" },
    { id: "e-16", src: "assets/events/tech-meetups/meetup-16-studio-session.jpg", category: "events", caption: "Studio session at the FlytBase office", eventName: MEET, alt: "Siddhant with headphones at the FlytBase office" },
    { id: "e-18", src: "assets/events/tech-meetups/meetup-18-rooftop-night-a.jpg", category: "events", caption: "Rooftop meetup nights", eventName: MEET, alt: "Group selfie on a terrace at night with string lights" },
    { id: "e-19", src: "assets/events/tech-meetups/meetup-19-rooftop-night-b.jpg", category: "events", caption: "One more for the road", eventName: MEET, alt: "Group selfie on a rooftop at night" },
    /* ----- Hobby: Jivdhan trek ----- */
    { id: "h-06", src: "assets/hobby/jivdhan-trek/trek-06-rock-cut-steps.jpg", category: "hobby", caption: "The rock-cut steps of Jivdhan", eventName: TREK, alt: "The trekking group resting on the carved rock steps of Jivdhan Fort", featured: true, size: "tall" },
    { id: "h-04", src: "assets/hobby/jivdhan-trek/trek-04-fort-needle-view.jpg", category: "hobby", caption: "Jivdhan Fort and the needle at sunrise", eventName: TREK, alt: "The fort massif and a rock needle in morning haze", size: "wide" },
    { id: "h-01", src: "assets/hobby/jivdhan-trek/trek-01-sunrise-selfie.jpg", category: "hobby", caption: "Sunrise at the base village", eventName: TREK, alt: "Siddhant in a beanie with the fort behind him at sunrise" },
    { id: "h-02", src: "assets/hobby/jivdhan-trek/trek-02-camp-night-a.jpg", category: "hobby", caption: "Camp night - tents up", eventName: TREK, alt: "Night selfie at the campsite with tents behind" },
    { id: "h-07", src: "assets/hobby/jivdhan-trek/trek-07-trek-crew.jpg", category: "hobby", caption: "The trek crew at the base", eventName: TREK, alt: "A large group of trekkers with the fort behind them" },
    { id: "h-08", src: "assets/hobby/jivdhan-trek/trek-08-on-the-rocks.jpg", category: "hobby", caption: "Jivdhan Fort behind me", eventName: TREK, alt: "Siddhant sitting on a rock with the fort and needle behind" },
    { id: "h-09", src: "assets/hobby/jivdhan-trek/trek-09-whole-gang.jpg", category: "hobby", caption: "The whole gang", eventName: TREK, alt: "The full trekking group posing on rocks" },
    /* ----- Portraits ----- */
    { id: "p-02", src: "assets/portrait/formal-02-waterfall-wall.jpg", category: "portrait", caption: "By the waterfall wall", eventName: PORT, alt: "Siddhant in formal attire in front of a textured waterfall wall", featured: true, size: "tall" },
    { id: "p-03", src: "assets/portrait/formal-03-art-wall.jpg", category: "portrait", caption: "In front of the amber canvas", eventName: PORT, alt: "Siddhant in a light blue shirt in front of an amber abstract painting" },
    { id: "p-01", src: "assets/portrait/formal-01-lobby-lounge.jpg", category: "portrait", caption: "Lobby lounge", eventName: PORT, alt: "Siddhant seated in a hotel lounge in formal attire" },
    { id: "p-04", src: "assets/portrait/formal-04-wood-panel.jpg", category: "portrait", caption: "Wood-panel portrait", eventName: PORT, alt: "Siddhant standing by a wooden panel and lilies" },
    { id: "p-05", src: "assets/portrait/formal-05-floral-lobby.jpg", category: "portrait", caption: "Floral lobby", eventName: PORT, alt: "Siddhant in a lobby with large floral arrangements" },
    { id: "p-06", src: "assets/portrait/formal-06-evening-light.jpg", category: "portrait", caption: "Evening light", eventName: PORT, alt: "Close portrait of Siddhant by a water wall at dusk" },
    /* ----- Projects (designed schematics until screenshots arrive) ----- */
    { id: "g-banknest-1", category: "projects", caption: "BankNest - backend architecture", projectId: "banknest", alt: "Schematic illustration of BankNest's layered architecture", placeholder: { motif: "schema", accent: "violet" } },
    { id: "g-lifedrop-1", category: "projects", caption: "LifeDrop - request workflow", projectId: "lifedrop", alt: "Schematic illustration of LifeDrop's Pending to Approved to Fulfilled workflow", placeholder: { motif: "flow", accent: "apricot" } }
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
