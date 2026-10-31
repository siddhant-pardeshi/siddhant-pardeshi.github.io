#!/usr/bin/env node
/* ============================================================
   GitHub content sync — public repository metadata only.
   - Reads the public repos of OWNER via the official GitHub API
   - Writes data/github-snapshot.json ONLY when meaningful data
     changed (a timestamp alone never triggers a redeploy)
   - On rate limits / errors: exits cleanly and keeps the
     last-known-good snapshot untouched
   - Token comes from GH_TOKEN env (workflow-provided); it is
     never written to the snapshot or any public file
   ============================================================ */

import { writeFileSync, readFileSync, existsSync } from "node:fs";

const OWNER = process.env.OWNER || "siddhant-pardeshi";
const TOKEN = process.env.GH_TOKEN || "";
const OUT = "data/github-snapshot.json";

const FEATURED = ["BankNest", "BloodDonation-Management", "MetroMind"];
const EXCLUDE_FROM_MORE = new Set([
  ...FEATURED,
  "siddhant-pardeshi", // profile README repo, not a portfolio project
  "siddhant-pardeshi.github.io" // this site
]);

function api(path) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-content-sync",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  return fetch(`https://api.github.com${path}`, { headers });
}

function pick(r, keys) {
  const o = {};
  for (const k of keys) o[k] = r[k] ?? null;
  return o;
}

async function main() {
  let repos;
  try {
    const res = await api(`/users/${OWNER}/repos?per_page=100&sort=pushed`);
    if (res.status === 403 || res.status === 429) {
      console.warn("Rate limited — keeping last-known-good snapshot.");
      process.exit(0);
    }
    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status} — keeping last-known-good snapshot.`);
      process.exit(0);
    }
    repos = await res.json();
  } catch (err) {
    console.warn("Network error — keeping last-known-good snapshot.", err && err.message);
    process.exit(0);
  }

  const publicRepos = repos.filter((r) => !r.private && !r.fork && !r.archived);

  const featured = {};
  for (const name of FEATURED) {
    const r = publicRepos.find((x) => x.name === name);
    if (!r) continue; // featured case studies stand on their own; absence adds nothing
    featured[name] = {
      ...pick(r, ["stars", "forks", "language", "description", "pushedAt", "htmlUrl"]),
      stars: r.stargazers_count,
      forks: r.forks_count,
      pushedAt: r.pushed_at,
      htmlUrl: r.html_url
    };
  }

  const more = publicRepos
    .filter((r) => !EXCLUDE_FROM_MORE.has(r.name))
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 8)
    .map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      pushedAt: r.pushed_at
    }));

  // Validate: every URL we publish must be https on github.com
  for (const m of more) {
    try {
      const u = new URL(m.url);
      if (u.protocol !== "https:" || !u.hostname.endsWith("github.com")) throw new Error("bad url");
    } catch {
      m.url = `https://github.com/${OWNER}/${m.name}`;
    }
  }

  const payload = {
    source: "github-api",
    owner: OWNER,
    fetchedAt: new Date().toISOString(),
    repos: featured,
    more
  };

  // Change detection WITHOUT the fetch timestamp
  const meaningful = JSON.stringify({ repos: payload.repos, more: payload.more });
  if (existsSync(OUT)) {
    try {
      const prev = JSON.parse(readFileSync(OUT, "utf8"));
      const prevMeaningful = JSON.stringify({ repos: prev.repos, more: prev.more });
      if (prevMeaningful === meaningful) {
        console.log("No meaningful repository change — snapshot untouched.");
        process.exit(0);
      }
    } catch {
      // corrupt previous snapshot — fall through and rewrite
    }
  }

  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Snapshot updated: ${FEATURED.filter((f) => featured[f]).length} featured, ${more.length} more.`);
}

main();
