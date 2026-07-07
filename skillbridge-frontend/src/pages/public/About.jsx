export default function About() {
  return (
    <main className="page-shell">
      <div className="content-panel">
        <h1 className="h3">About SkillBridge</h1>
        <p>
          SkillBridge is a full-stack eLearning project for students practicing real application development.
          It keeps the code approachable while demonstrating authentication, role-based dashboards,
          database queries, file uploads, and common course workflows.
        </p>
        <div className="row g-3 mt-2">
          <div className="col-md-4">
            <div className="stat-card">
              <h2 className="h5">Teachers</h2>
              <p className="mb-0 text-muted">Create courses, add lessons, upload materials, and grade submissions.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <h2 className="h5">Students</h2>
              <p className="mb-0 text-muted">Enroll in courses, learn from lessons, submit work, and view feedback.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <h2 className="h5">Admins</h2>
              <p className="mb-0 text-muted">Manage users, categories, courses, and platform status from one dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
