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
     All photos are owner-supplied; filenames and context (when/what
     was clicked) were named by the owner. Captions describe what is
     actually in the photo blended with the owner's context.
     Categories: hackathons | team | events | hobby | portrait |
     projects. video: true renders a playable lightbox. */
  var METRO = "OpenAI DevDay Exchange - Metro Hackathon Pune";
  var FUSION = "Fusion 2026 International Hackathon (SKNCOE)";
  var GENSPARK = "Genspark community event";
  var TREK = "Jivdhan Fort trek & camping";
  var PORT = "Portfolio portraits";

  var galleryItems = [
    /* ----- Metro Hackathon: the full story, morning to the win ----- */
    { id: "m-01", src: "assets/hackathons/metro-hackathon/Morning_Metrostation_arrival.jpg", category: "team", caption: "Morning arrival — Team UrbanSync reaches the venue", eventName: METRO, alt: "Team UrbanSync taking a group selfie in the venue lobby in the morning", featured: true },
    { id: "m-02", src: "assets/hackathons/metro-hackathon/Morning_MetroStation_Pic.jpg", category: "team", caption: "At the OpenAI banner before kickoff", eventName: METRO, alt: "Participants beside the OpenAI roll-up banner at the metro station venue" },
    { id: "m-03", src: "assets/hackathons/metro-hackathon/Morning_MetroStatio_Pic.jpg", category: "team", caption: "Squad selfie at the station", eventName: METRO, alt: "Five team members taking a selfie in front of an OpenAI banner" },
    { id: "m-04", src: "assets/hackathons/metro-hackathon/MetroStation_Morning_Squad.jpg", category: "team", caption: "The morning squad, hyped", eventName: METRO, alt: "Six team members posing together at the hackathon venue" },
    { id: "m-05", src: "assets/hackathons/metro-hackathon/Metro_Station_Platform_Click.jpg", category: "team", caption: "Morning energy at the platform", eventName: METRO, alt: "Group selfie in a bright station corridor" },
    { id: "m-06", src: "assets/hackathons/metro-hackathon/Inside_Metro_Ride.jpg", category: "team", caption: "Riding the Pune Metro together", eventName: METRO, alt: "Three team members giving thumbs up inside a metro train" },
    { id: "m-07", src: "assets/hackathons/metro-hackathon/Inside_Metro_Ride_Pic.jpg", category: "team", caption: "Laptop out before the doors even open", eventName: METRO, alt: "Team members with a laptop on a metro train" },
    { id: "m-08", src: "assets/hackathons/metro-hackathon/Metrostation_OpenAI_Team Karan M V.jpg", category: "hackathons", caption: "The hackathon community, with Karan M V", eventName: METRO, alt: "A larger group of participants with event lanyards at the venue" },
    { id: "m-23", src: "assets/hackathons/metro-hackathon/Inside_MetroRide_Coding.jpg", category: "hackathons", caption: "The build happens on the metro itself", eventName: METRO, alt: "Hackathon participants working on laptops inside a moving Pune Metro train", featured: true, size: "wide" },
    { id: "m-24", src: "assets/hackathons/metro-hackathon/Inside_Metro_Ride_Hackathon.jpg", category: "hackathons", caption: "A train car turned into a hack room", eventName: METRO, alt: "A Pune Metro train coach full of participants coding on laptops", size: "wide" },
    { id: "m-11", src: "assets/hackathons/metro-hackathon/Inside_MetroRide.mp4", video: true, category: "hackathons", caption: "Event film — coding on the ride", eventName: METRO, alt: "Video clip from the OpenAI DevDay Exchange Metro Hackathon" },
    { id: "m-09", src: "assets/hackathons/metro-hackathon/Metrostation_Auditrium.jpg", category: "hackathons", caption: "On the DevDay Exchange stage", eventName: METRO, alt: "Four team members posing on the OpenAI DevDay Exchange stage under the event screen", featured: true, size: "wide" },
    { id: "m-10", src: "assets/hackathons/metro-hackathon/Metro_Auditorium_Pic.jpg", category: "hackathons", caption: "Stage moment in the auditorium", eventName: METRO, alt: "Three team members on the DevDay Exchange stage" },
    { id: "m-18", src: "assets/hackathons/metro-hackathon/Metro_Hackathon_Stage_Auditorium_Click.jpg", category: "hackathons", caption: "Team UrbanSync on the main stage", eventName: METRO, alt: "Three team members on stage with the event screen behind them", featured: true },
    { id: "m-19", src: "assets/hackathons/metro-hackathon/OpenAI_4th_Place_Winning Team.jpg", category: "hackathons", caption: "The 4th-place winning team on stage", eventName: METRO, alt: "Four team members standing under the stage lights after the results", featured: true },
    { id: "m-20", src: "assets/hackathons/metro-hackathon/MetroHackathon_Auditorium.jpg", category: "team", caption: "DevDay swag — OpenAI tote bags", eventName: METRO, alt: "Three team members holding OpenAI DevDay Exchange tote bags on stage" },
    { id: "m-22", src: "assets/hackathons/metro-hackathon/Hackathon_Winning_Trio_Team.jpg", category: "hackathons", caption: "Sessions at the DevDay auditorium", eventName: METRO, alt: "An auditorium session with a speaker on stage and the team in the audience" },
    { id: "m-26", src: "assets/hackathons/metro-hackathon/Metrostation_Platform_Click.jpg", category: "hackathons", caption: "Team UrbanSync on the main stage", eventName: METRO, alt: "Four team members on the main stage in front of the event screen", featured: true, size: "wide" },
    { id: "m-27", src: "assets/hackathons/metro-hackathon/Netro_Station_logofront.jpg", category: "hackathons", caption: "The community wall at the station", eventName: METRO, alt: "Seven participants in front of the DevDay Exchange Community Event wall", size: "wide" },
    { id: "m-12", src: "assets/hackathons/metro-hackathon/Inside_MetroAuditorium_Team.jpg", category: "team", caption: "Team at the Pune Metro mark inside the station", eventName: METRO, alt: "Team members in front of the Pune Metro logo inside the station" },
    { id: "m-13", src: "assets/hackathons/metro-hackathon/MetroStation_TeamAfterWinning.jpg", category: "team", caption: "Team after the win — all smiles", eventName: METRO, alt: "Three team members giving thumbs up at the station after the results" },
    { id: "m-17", src: "assets/hackathons/metro-hackathon/Hackathon_Winners_Cafe_Celebration.jpg", category: "team", caption: "Winning crew, platform celebration", eventName: METRO, alt: "Five team members celebrating on the metro platform" },
    { id: "m-14", src: "assets/hackathons/metro-hackathon/MetroStation_Exit_AfterWinnningClick.jpg", category: "team", caption: "After the win — the celebration spot", eventName: METRO, alt: "The lit front of Cafe Black Cat and Wolf at night", size: "wide" },
    { id: "m-15", src: "assets/hackathons/metro-hackathon/MetroHackathon_Winners_Celebration_Spot.jpg", category: "team", caption: "Winners' celebration dinner", eventName: METRO, alt: "Six team members around a cafe table after the hackathon" },
    /* ----- Fusion 2026 ----- */
    { id: "f-02", src: "assets/hackathons/fusion-2026/fusion-02-Hackathon_Volunteer_Pic_coder-group.jpg", category: "hackathons", caption: "Fusion 2026 at SKNCOE — with the volunteers", eventName: FUSION, alt: "A large group of participants and volunteers in front of the SKNCOE and Fusion banners", featured: true, size: "wide", date: "Oct 2026" },
    { id: "f-01", src: "assets/hackathons/fusion-2026/fusion-01-Mrning_Hackathon_crew-selfie.jpg", category: "team", caption: "Morning crew selfie at Fusion", eventName: FUSION, alt: "Four participants taking a selfie at the Fusion hackathon", date: "Oct 2026" },
    { id: "f-03", src: "assets/hackathons/fusion-2026/fusion-03-Hackathon_Jamming_Session_night-walk.jpg", category: "team", caption: "Jamming session — night walk between rounds", eventName: FUSION, alt: "Four participants on the campus at night", date: "Oct 2026" },
    { id: "f-04", src: "assets/hackathons/fusion-2026/fusion-04-Hackathon_BuddyTeammateskncoe-wall.jpg", category: "hackathons", caption: "With buddies at the SKNCOE wall", eventName: FUSION, alt: "Two participants in front of the SKNCOE honour boards", date: "Oct 2026" },
    { id: "f-05", src: "assets/hackathons/fusion-2026/fusion-05-Hackathon_Last_Round-Submission.jpg", category: "hackathons", caption: "Last round — submission push", eventName: FUSION, alt: "Siddhant in an event t-shirt during the final submission round at Fusion", date: "Oct 2026" },
    { id: "f-06", src: "assets/hackathons/fusion-2026/fusion-06-day-two_Hackathon_Exit_Pic.jpg", category: "team", caption: "Day two — heading out", eventName: FUSION, alt: "Four participants outdoors on the second day", date: "Oct 2026" },
    { id: "f-07", src: "assets/hackathons/fusion-2026/fusion-07-event-video.mp4", video: true, category: "hackathons", caption: "Event film — Fusion 2026", eventName: FUSION, alt: "Video clip from the Fusion 2026 hackathon", date: "Oct 2026" },
    /* ----- Genspark community event ----- */
    { id: "gs-01", src: "assets/hackathons/genspark/Genspark_Hackathn_Host_pic.jpg", category: "events", caption: "Genspark night — with the host", eventName: GENSPARK, alt: "A group under string lights beside the Genspark Event banner", featured: true, size: "wide" },
    { id: "gs-02", src: "assets/hackathons/genspark/genspark-Hackathon_Participants_rooftop-crew.jpg", category: "events", caption: "Participants on the rooftop", eventName: GENSPARK, alt: "Group selfie on a rooftop venue at night" },
    { id: "gs-03", src: "assets/hackathons/genspark/genspark-Hackathon_Exit.jpg", category: "events", caption: "Community conversations on the way out", eventName: GENSPARK, alt: "Three people chatting in front of a floral mural" },
    { id: "gs-04", src: "assets/hackathons/genspark/genspark-Hackathon_CodeChatcode-night.jpg", category: "events", caption: "CodeChat — code night crew", eventName: GENSPARK, alt: "Group selfie at the Genspark rooftop event" },
    { id: "gs-05", src: "assets/hackathons/genspark/genspark-Hackathon_Participant_Friends.jpg", category: "events", caption: "With participant friends", eventName: GENSPARK, alt: "Three people on a lit terrace at night" },
    /* ----- Tech community meetups ----- */
    { id: "e-17", src: "assets/events/tech-meetups/Devcon_Meetup.jpg", category: "events", caption: "Zoho DevCon VIII India", eventName: "Zoho DevCon VIII India", alt: "Three attendees in front of the DevCon VIII India screen", featured: true },
    { id: "e-14", src: "assets/events/tech-meetups/Devcon_Meetup_Lift.jpg", category: "events", caption: "DevCon day — elevator crew", eventName: "Zoho DevCon VIII India", alt: "Six people in a group selfie in an elevator" },
    { id: "e-08", src: "assets/events/tech-meetups/Redhat_Wall_Meetup.jpg", category: "events", caption: "At the Red Hat map wall — badge on", eventName: "Red Hat community meetup", alt: "Siddhant wearing a name badge in front of the Red Hat world-map wall", size: "tall" },
    { id: "e-10", src: "assets/events/tech-meetups/Redhat_Meetup_participants.jpg", category: "events", caption: "Red Hat meetup participants", eventName: "Red Hat community meetup", alt: "Four attendees with name badges beside the Pune poster walls" },
    { id: "e-05", src: "assets/events/tech-meetups/Redhat_Meetup.jpg", category: "events", caption: "With a fellow builder at the Red Hat meetup", eventName: "Red Hat community meetup", alt: "Selfie with another developer at the Red Hat meetup" },
    { id: "e-01", src: "assets/events/tech-meetups/AWS_Meetup_Shubham londhe.jpg", category: "events", caption: "AWS meetup — with Shubham Londhe", eventName: "AWS community meetup", alt: "Selfie with Shubham Londhe at the AWS community meetup" },
    { id: "e-02", src: "assets/events/tech-meetups/AWS_Meetup_Lobby.jpg", category: "events", caption: "AWS meetup lobby squad", eventName: "AWS community meetup", alt: "Three attendees in the AWS meetup lobby" },
    { id: "e-11", src: "assets/events/tech-meetups/Doastra_Meetup_team.jpg", category: "events", caption: "Doastra Technologies meetup — the team", eventName: "Doastra Technologies meetup", alt: "Seven people in front of the Doastra Technologies logo wall" },
    { id: "e-12", src: "assets/events/tech-meetups/Doastra_Host.jpg", category: "events", caption: "With the host at Doastra", eventName: "Doastra Technologies meetup", alt: "Two attendees at the glowing Doastra reception" },
    { id: "e-15", src: "assets/events/tech-meetups/Entain_Office_Meetup.jpg", category: "events", caption: "Entain office meetup", eventName: "Entain office meetup", alt: "Five developers in front of a colorful racecar mural at the Entain office" },
    { id: "e-16", src: "assets/events/tech-meetups/Entain_Office_Meetup_Speaker.jpg", category: "events", caption: "With the speaker at Entain", eventName: "Entain office meetup", alt: "Duo selfie with the session speaker at the Entain office mural" },
    { id: "e-16b", src: "assets/events/tech-meetups/IDC_Meetup.jpg", category: "events", caption: "IDC meetup on stage", eventName: "IDC meetup", alt: "Two attendees in front of the IDC meetup stage backdrop" },
    { id: "e-16c", src: "assets/events/tech-meetups/IDC_Meetup_host.jpg", category: "events", caption: "With the IDC meetup host", eventName: "IDC meetup", alt: "Two attendees at the big clock wall at the IDC meetup" },
    { id: "e-16d", src: "assets/events/tech-meetups/Flystbase_Hackathon.jpg", category: "events", caption: "FlytBase hackathon day — office floor", eventName: "FlytBase hackathon", alt: "Siddhant in a blue shirt at the FlytBase office floor with a big screen behind" },
    { id: "e-16e", src: "assets/events/tech-meetups/Flytbase_Hackathon.jpg", category: "events", caption: "Heads down at the FlytBase hackathon", eventName: "FlytBase hackathon", alt: "Siddhant with headphones at the FlytBase office" },
    { id: "e-16f", src: "assets/events/tech-meetups/Flytbase_Hackathon_Winner.jpg", category: "events", caption: "FlytBase hackathon — winners moment", eventName: "FlytBase hackathon", alt: "The crew with a gift bag at the FlytBase green wall after the hackathon" },
    /* ----- Hobby: Jivdhan trek ----- */
    { id: "h-08", src: "assets/hobby/jivdhan-trek/trek-08-Fort_Entry_Stairs_on-the-rocks.jpg", category: "hobby", caption: "Fort entry — the rock-cut stairs of Jivdhan", eventName: TREK, alt: "The trekking group resting on the carved rock steps at Jivdhan Fort's entry", featured: true, size: "tall" },
    { id: "h-04", src: "assets/hobby/jivdhan-trek/trek-04-fort-needle_SelfieBefre_Fort_Climb-view.jpg", category: "hobby", caption: "Before the climb — Jivdhan Fort and the needle", eventName: TREK, alt: "The fort massif and a rock needle in morning haze with trekkers heading up", size: "wide" },
    { id: "h-01", src: "assets/hobby/jivdhan-trek/trek-01-Camping_Night_sunrise-selfie.jpg", category: "hobby", caption: "Camping night done — sunrise at the base", eventName: TREK, alt: "Siddhant in a beanie with the fort behind him at sunrise after camping" },
    { id: "h-03", src: "assets/hobby/jivdhan-trek/trek-03-Starting_FortClimb-b.jpg", category: "hobby", caption: "Starting the fort climb", eventName: TREK, alt: "Trekkers beginning the Jivdhan Fort climb" },
    { id: "h-07", src: "assets/hobby/jivdhan-trek/trek-07-Climbing_Crew_trek-crew.jpg", category: "hobby", caption: "The climbing crew", eventName: TREK, alt: "A large group of trekkers with the fort behind them" },
    { id: "h-06", src: "assets/hobby/jivdhan-trek/trek-06-Fort_Pic_Treking.jpg", category: "hobby", caption: "Jivdhan Fort behind me", eventName: TREK, alt: "Siddhant resting on a rock with the fort and needle behind" },
    { id: "h-09", src: "assets/hobby/jivdhan-trek/trek-09-Trekking_Crew_Pic.jpg", category: "hobby", caption: "The trekking crew, top to bottom", eventName: TREK, alt: "The full trekking group posing on rocks" },
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
      "The skill map links every tool to real evidence.",
      "Psst — rub my belly sideways. I like it."
    ],
    reactions: [
      "Hehe, that tickles.",
      "Blush mode activated.",
      "Okay okay, one more spin.",
      "You found my happy dance!"
    ],
    dizzy: "Okay okay… the world is doing a barrel roll 🌀",
    dance: "DANCE MODE! You found my secret moves 🧡",
    pet: "Ahh, that's the spot. Keep going.",
    fast: "Whoa — fast hands!",
    sections: {
      work: "Two builds, two playable walkthroughs. Try them!",
      skills: "Every tool here links to real evidence.",
      achievements: "4th overall with Team UrbanSync. So proud of this one.",
      gallery: "Real moments — that's us on the metro!",
      posts: "Follow the build on LinkedIn and GitHub.",
      about: "That's the human behind the logic.",
      contact: "Found what you needed? Siddhant's email is right here."
    },
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
