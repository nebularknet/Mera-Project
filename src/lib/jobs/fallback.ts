import type { Job } from "./types";

/**
 * Default copy for roles whose DB row has no description yet. Matched by
 * lowercase title; anything the DB provides always wins (see applyFallback).
 */
type Fallback = Pick<Job, "description" | "requirements" | "responsibilities">;

const FALLBACKS: Record<string, Fallback> = {
  "cyber security": {
    description:
      "Help us protect Nebulark and our clients' products. You will assess systems for weaknesses, harden infrastructure and applications, and build security into how we design and ship software.",
    responsibilities: [
      "Run vulnerability assessments and penetration tests on web apps and cloud infrastructure",
      "Monitor for threats and respond to security incidents",
      "Review code and architecture for security risks",
      "Document findings and guide teams on remediation",
    ],
    requirements: [
      "Solid grounding in application security (OWASP Top 10) and networking",
      "Hands-on experience with security testing tools",
      "Clear written communication of risk",
    ],
  },
  "graphic designing": {
    description:
      "Shape the visual identity of Nebulark and our clients. You will turn ideas into polished brand, marketing and product visuals that are consistent, memorable and on-message.",
    responsibilities: [
      "Create branding, social, web and marketing assets",
      "Keep visuals consistent with brand guidelines",
      "Collaborate with designers, developers and marketing on deliverables",
      "Iterate quickly based on feedback",
    ],
    requirements: [
      "Strong portfolio showing typography, layout and colour skills",
      "Proficiency with Figma, Adobe Illustrator and Photoshop (or equivalents)",
      "Ability to manage multiple projects remotely",
    ],
  },
  "ui designer": {
    description:
      "Design clear, modern interfaces for the products and websites we build. You will own flows from wireframe to high-fidelity design and work closely with engineers to see them shipped.",
    responsibilities: [
      "Design user flows, wireframes and high-fidelity UI in Figma",
      "Maintain and extend our design system",
      "Hand off specs and assets to developers and review the built result",
      "Improve designs using user feedback and usability testing",
    ],
    requirements: [
      "Portfolio demonstrating web and/or mobile UI work",
      "Strong grasp of layout, typography, accessibility and responsive design",
      "Experience collaborating with engineers",
    ],
  },
  "business development": {
    description:
      "Grow Nebulark by finding and winning new clients and partnerships. You will identify opportunities, build relationships and help turn conversations into long-term engagements.",
    responsibilities: [
      "Research and reach out to prospective clients and partners",
      "Run discovery calls and prepare proposals",
      "Maintain the pipeline and report on progress",
      "Work with delivery teams to scope projects accurately",
    ],
    requirements: [
      "Excellent written and spoken English",
      "Experience in sales, partnerships or client-facing roles, ideally in tech or design services",
      "Self-driven and comfortable working remotely",
    ],
  },
};

export function applyFallback(job: Job): Job {
  const fb = FALLBACKS[job.title.trim().toLowerCase()];
  if (!fb) return job;
  return {
    ...job,
    description: job.description || fb.description,
    requirements: job.requirements.length ? job.requirements : fb.requirements,
    responsibilities: job.responsibilities.length ? job.responsibilities : fb.responsibilities,
  };
}
