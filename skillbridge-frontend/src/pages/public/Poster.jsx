import { Link } from 'react-router-dom';

export default function Poster() {
  return (
    <main className="page-shell poster-page">
      <section className="poster-header shadow-lg">
        <div className="poster-header-content">
          <span className="poster-badge">Project Poster</span>
          <h1>SkillBridge</h1>
          <p className="lead">A creative visual summary of the SkillBridge platform, built for course creation, learning, submission, and progress tracking.</p>
          <div className="poster-keypoints">
            <div>
              <strong>Context</strong>
              <p>Full-stack eLearning with role-based access for students, teachers, and admins.</p>
            </div>
            <div>
              <strong>Built with</strong>
              <p>React, Vite, Express, MySQL, JWT auth, file uploads, and styled Bootstrap.</p>
            </div>
            <div>
              <strong>Goal</strong>
              <p>Make learning workflows intuitive while showcasing real-world web application architecture.</p>
            </div>
          </div>
          <Link className="btn btn-light btn-lg mt-3" to="/about">See the platform</Link>
        </div>
      </section>

      <section className="poster-grid">
        <article className="poster-card poster-card-emphasis">
          <h2>Problem</h2>
          <p>Students and teachers need a polished project that demonstrates real course workflows, database persistence, auth, file upload, and grading without overwhelming complexity.</p>
        </article>

        <article className="poster-card">
          <h2>How it works</h2>
          <ul>
            <li>Users register and sign in with secure JWT authentication.</li>
            <li>Teachers create courses, lessons, and assignments.</li>
            <li>Students enroll, review lessons, and submit assignments fast.</li>
          </ul>
        </article>

        <article className="poster-card">
          <h2>Methodology</h2>
          <p>The app uses a clean separation of frontend pages and backend API routes, with CORS support and database seeding for sample content.</p>
          <p>Reusable components and layout shells keep the UI consistent across roles.</p>
        </article>

        <article className="poster-card poster-card-accent">
          <h2>Next steps</h2>
          <ul>
            <li>Extend course categories and search.</li>
            <li>Improve assignment feedback and grading workflows.</li>
            <li>Add real-time notifications and file previews.</li>
          </ul>
        </article>

        <article className="poster-card poster-card-team">
          <h2>Team</h2>
          <div className="poster-team-grid">
            <div><strong>Project</strong><br />Student learning platform</div>
            <div><strong>Frontend</strong><br />React, Vite, Bootstrap</div>
            <div><strong>Backend</strong><br />Express, MySQL, JWT</div>
            <div><strong>Data</strong><br />Role-based users, courses, categories, lessons</div>
          </div>
        </article>
      </section>
    </main>
  );
}
