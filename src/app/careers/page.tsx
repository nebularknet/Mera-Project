import type { Metadata } from "next";

import { getOpenJobs } from "@/lib/careers/jobs";
import { CareersApply } from "./careers-apply";

export const metadata: Metadata = {
  title: "Careers at Nebulark",
  description:
    "Join the Nebulark team. Explore open roles and apply — shape the future with innovation, creativity and technology.",
};

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const jobs = await getOpenJobs();

  return (
    <main style={{ backgroundColor: "#000000", minHeight: "100vh", paddingTop: 90 }}>
      {/* Hero */}
      <section className="services-section">
        <div className="container text-center">
          <h1 className="values-title" style={{ fontSize: "3rem" }}>
            Join Our <span className="highlight">Team</span>
          </h1>
          <p style={{ color: "var(--white)", opacity: 0.7, fontSize: "1.15rem" }}>
            Shape the future with innovation, creativity and technology.
          </p>
        </div>
      </section>

      {/* Positions + apply modal */}
      <CareersApply
        jobs={jobs.map((j) => ({
          id: j.id,
          title: j.title,
          location: j.location,
          description: j.description,
        }))}
      />

      {jobs.length === 0 && (
        <p
          style={{ color: "var(--white)", opacity: 0.6, textAlign: "center", paddingBottom: 60 }}
        >
          There are no open positions right now. Please check back soon.
        </p>
      )}
    </main>
  );
}
