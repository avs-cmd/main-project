/* =========================================================

   TALERANG CAMPUS AMBASSADOR - ADMIN PORTAL

   Local API: http://127.0.0.1:8000

   Demo mode uses sample data only.

\========================================================= */



"use strict";



// ------------------------------

// Configuration and application state

// ------------------------------

const $ = (id) => document.getElementById(id);

const TOKEN_KEY = "talerangAdminAccessToken";



let demoMode = false;

let selectedStudentId = null;

let students = [];

let submissions = [];

let rewards = [];

let rankings = [];



// ------------------------------

// Demo data (does not affect database)

// ------------------------------

const demoStudents = [

  {

    id: 101,

    full_name: "Aarav Mehta",

    email: "aarav.mehta@example.com",

    mobile: "9876500001",

    college: "HR College",

    linkedin_url: "https://linkedin.com/",

    designation: "Chapter Ambassador",

    total_points: 420,

    completed_activities: 3,

    rewards_count: 1,

  },

  {

    id: 102,

    full_name: "Isha Sharma",

    email: "isha.sharma@example.com",

    mobile: "9876500002",

    college: "NM College",

    linkedin_url: "https://linkedin.com/",

    designation: "Campus Ambassador",

    total_points: 110,

    completed_activities: 2,

    rewards_count: 0,

  },

  {

    id: 103,

    full_name: "Riya Kapoor",

    email: "riya.kapoor@example.com",

    mobile: "9876500003",

    college: "Jai Hind College",

    linkedin_url: "https://linkedin.com/",

    designation: "Campus Ambassador",

    total_points: 300,

    completed_activities: 2,

    rewards_count: 1,

  },

];



const demoSubmissions = [

  { submission_id: 501, student_id: 101, task_title: "Brochure Distribution", student_description: "Distributed Talerang brochures to students outside the college auditorium.", submitted_at: "2026-10-29", points: 100, status: "completed", photo_url: "", admin_remarks: "" },

  { submission_id: 502, student_id: 101, task_title: "Put Up Posters", student_description: "Placed programme posters on the college notice board.", submitted_at: "2026-10-27", points: 100, status: "completed", photo_url: "", admin_remarks: "" },

  { submission_id: 503, student_id: 101, task_title: "Social Media Post", student_description: "Shared the Campus Ambassador registration drive on Instagram.", submitted_at: "2026-10-25", points: 50, status: "completed", photo_url: "", admin_remarks: "" },

  { submission_id: 504, student_id: 102, task_title: "Workshop", student_description: "Helped coordinate a student career-readiness workshop.", submitted_at: "2026-10-28", points: 100, status: "completed", photo_url: "", admin_remarks: "" },

  { submission_id: 505, student_id: 102, task_title: "Weekly Team Call", student_description: "Participated in the weekly chapter call.", submitted_at: "2026-10-26", points: 10, status: "completed", photo_url: "", admin_remarks: "" },

  { submission_id: 506, student_id: 103, task_title: "Refer a Student", student_description: "Referred a classmate to the programme.", submitted_at: "2026-10-30", points: 200, status: "completed", photo_url: "", admin_remarks: "" },

  { submission_id: 507, student_id: 103, task_title: "Brochure Distribution", student_description: "Shared brochures during the college club fair.", submitted_at: "2026-10-24", points: 100, status: "completed", photo_url: "", admin_remarks: "" },

];



const demoRewards = [
  { id: 701, student_id: 101, student_name: "Aarav Mehta", student_email: "aarav.mehta@example.com", reward_name: "Talerang Gift Pack", points_at_request: 250, current_points: 420, student_note: "I would like to request this reward.", requested_at: "2026-11-01", status: "pending", admin_remarks: "" },
  { id: 702, student_id: 102, student_name: "Isha Sharma", student_email: "isha.sharma@example.com", reward_name: "Spotify Subscription", points_at_request: 750, current_points: 110, student_note: "Please consider my request.", requested_at: "2026-11-02", status: "pending", admin_remarks: "" },
  { id: 703, student_id: 103, student_name: "Riya Kapoor", student_email: "riya.kapoor@example.com", reward_name: "₹500 Voucher", points_at_request: 500, current_points: 300, student_note: "Thank you.", requested_at: "2026-11-03", status: "approved", admin_remarks: "Your reward request has been approved." },
];



// ------------------------------

// Small utilities

// ------------------------------

function escapeHTML(value) {

  return String(value ?? "").replace(/[&<>"']/g, (char) => ({

    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",

  })[char]);

}



function normaliseStatus(value) {

  return String(value || "pending").toLowerCase().replaceAll("_", " ");

}



function formatDate(value) {

  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-IN", {

    day: "2-digit", month: "short", year: "numeric",

  });

}



function showMessage(message, isError = false) {

  const element = $("globalMessage");

  element.textContent = message;

  element.classList.toggle("error", isError);

  element.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });

}



function setAuthMessage(message) {

  $("authMessage").textContent = message || "";

}



function getStudentName(student) {

  return student.full_name || student.name || "Student";

}



function getStudentPoints(student) {

  return Number(student.total_points ?? student.points ?? 0);

}



function getSubmissionId(item) {

  return Number(item.submission_id ?? item.id);

}



function getSubmissionTitle(item) {

  return item.task_title || item.task_name || `Task #${getSubmissionId(item)}`;

}



function getSubmissionCaption(item) {

  return item.student_description || item.caption || "No description provided.";

}



function getSubmissionPhoto(item) {

  return item.photo_url || item.photo_path || "";

}



// ------------------------------

// API helper

// ------------------------------

async function api(path, options = {}) {

  const baseURL = String(window.TALERANG_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

  const token = localStorage.getItem(TOKEN_KEY);

  const headers = { ...(options.headers || {}) };



  if (options.body && !(options.body instanceof FormData)) {

    headers["Content-Type"] = "application/json";

  }

  if (token) headers.Authorization = `Bearer ${token}`;



  const response = await fetch(`${baseURL}${path}`, { ...options, headers });

  const data = await response.json().catch(() => ({}));



  if (!response.ok) {

    const detail = typeof data.detail === "string" ? data.detail : `Request failed (${response.status})`;

    throw new Error(detail);

  }

  return data;

}



function requireLiveMode() {

  if (demoMode) return false;

  if (!localStorage.getItem(TOKEN_KEY)) {

    showMessage("Please log in again to continue.", true);

    logout();

    return false;

  }

  return true;

}



// ------------------------------

// Login, logout and demo mode

// ------------------------------

async function handleLogin(event) {

  event.preventDefault();

  setAuthMessage("Signing in...");



  try {

    const identity = $("adminLoginEmail").value.trim();

    const password = $("adminLoginPassword").value;

    const login = await api("/user/login", {

      method: "POST",

      body: JSON.stringify({ identity, password }),

    });



    if (!login.access_token) throw new Error("The login response did not contain an access token.");

    localStorage.setItem(TOKEN_KEY, login.access_token);



    const currentUser = await api("/user/me");

    if (String(currentUser.role || "").toLowerCase() !== "admin") {

      localStorage.removeItem(TOKEN_KEY);

      throw new Error("This account does not have admin access.");

    }



    demoMode = false;

    $("adminAuth").classList.add("hidden");

    $("adminPortal").classList.remove("hidden");

    $("demoBanner").classList.add("hidden");

    setAuthMessage("");

    await loadStudents();

    await loadRankings();

    await loadRewards();

    await loadAnnouncements();



    showPage("students");

  } catch (error) {

    setAuthMessage(error.message || "Unable to log in. Check the backend and credentials.");

  }

}



function logout() {

  localStorage.removeItem(TOKEN_KEY);

  demoMode = false;

  selectedStudentId = null;

  $("adminPortal").classList.add("hidden");

  $("adminAuth").classList.remove("hidden");

  $("demoBanner").classList.add("hidden");

  $("adminLoginPassword").value = "";

  setAuthMessage("You have been logged out.");

}



function startDemo() {

  demoMode = true;

  students = demoStudents.map((student) => ({ ...student }));

  submissions = demoSubmissions.map((item) => ({ ...item }));

  rewards = demoRewards.map((reward) => ({ ...reward }));

  rankings = [];



  $("adminAuth").classList.add("hidden");

  $("adminPortal").classList.remove("hidden");

  $("demoBanner").classList.remove("hidden");

  $("globalMessage").classList.add("hidden");



  renderStudents();

  renderRankings();

  renderRewards();

  showPage("students");

}



// ------------------------------

// Navigation

// ------------------------------

function showPage(page) {

  document.querySelectorAll(".admin-page").forEach((section) => {

    section.classList.toggle("active", section.id === `${page}Page`);

  });

  document.querySelectorAll(".admin-nav-item").forEach((button) => {

    button.classList.toggle("active", button.dataset.page === page);

  });



  const titles = {

    students: "Student Information",

    rankings: "Rankings",

    rewards: "Reward Management",

    announcements: "Announcements",

  };

  $("pageTitle").textContent = titles[page] || "Student Information";



  if (page === "students") loadStudents().catch((error) => showMessage(error.message, true));

  if (page === "rankings") loadRankings().catch((error) => showMessage(error.message, true));

  if (page === "rewards") loadRewards().catch((error) => showMessage(error.message, true));

  if (page === "announcements") {loadAnnouncements().catch((error) => showMessage(error.message, true));

}

}





// ------------------------------

// Student information and profiles

// ------------------------------

async function loadStudents() {

  if (demoMode) return renderStudents();

  if (!requireLiveMode()) return;



  $("studentsTable").innerHTML = '<tr><td colspan="7" class="empty-state">Loading students...</td></tr>';

  try {

    const result = await api("/admin/students");

    students = Array.isArray(result) ? result : (result.students || result.items || []);

    renderStudents();

  } catch (error) {

    $("studentsTable").innerHTML = `<tr><td colspan="7" class="empty-state">${escapeHTML(error.message)}</td></tr>`;

    throw error;

  }

}



function renderStudents() {

  const tableBody = $("studentsTable");

  if (!students.length) {

    tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No students found.</td></tr>';

    return;

  }



  tableBody.innerHTML = students.map((student) => {

    const name = getStudentName(student);

    const linkedin = student.linkedin_url || student.linkedin || "";

    return `

      <tr class="student-row" data-student-id="${Number(student.id)}">

        <td><strong>${escapeHTML(name)}</strong></td>

        <td>${escapeHTML(student.email || "—")}</td>

        <td>${escapeHTML(student.college || "—")}</td>

        <td>${linkedin ? `<a href="${escapeHTML(linkedin)}" target="_blank" rel="noopener noreferrer">View LinkedIn ↗</a>` : "—"}</td>

        <td><strong>${getStudentPoints(student).toLocaleString("en-IN")}</strong></td>

        <td>${escapeHTML(student.designation || "—")}</td>

        <td>${Number(student.rewards_count ?? student.reward_count ?? 0)}</td>

      </tr>`;

  }).join("");



  document.querySelectorAll(".student-row").forEach((row) => {

    row.addEventListener("click", () => openStudentProfile(Number(row.dataset.studentId)));

  });

  filterStudents();

}



function filterStudents() {

  const query = $("studentSearch").value.trim().toLowerCase();

  document.querySelectorAll(".student-row").forEach((row) => {

    row.hidden = !row.textContent.toLowerCase().includes(query);

  });

}



async function openStudentProfile(studentId) {

  selectedStudentId = studentId;

  const student = students.find((item) => Number(item.id) === studentId);

  if (!student) return;



  let studentSubmissions = submissions.filter((item) => Number(item.student_id) === studentId);

  if (!demoMode) {

    const profileBox = $("studentProfile");

    profileBox.classList.remove("hidden");

    profileBox.innerHTML = '<div class="content-card"><p class="empty-state">Loading student profile and activity history...</p></div>';



    try {

      const result = await api(`/admin/students/${studentId}/submissions`);

      studentSubmissions = Array.isArray(result) ? result : (result.submissions || result.items || []);

      submissions = submissions.filter((item) => Number(item.student_id) !== studentId).concat(

        studentSubmissions.map((item) => ({ ...item, student_id: studentId }))

      );

    } catch (error) {

      showMessage(`Could not load activity history: ${error.message}`, true);

      return;

    }

  }



  renderStudentProfile(student, studentSubmissions);

}



function renderStudentProfile(student, studentSubmissions) {

  const profileBox = $("studentProfile");

  const studentId = Number(student.id);

  const studentRewards = rewards.filter((reward) => Number(reward.student_id) === studentId);

  const name = getStudentName(student);

  const linkedin = student.linkedin_url || student.linkedin || "";



  profileBox.classList.remove("hidden");

  profileBox.innerHTML = `

    <div class="content-card profile-card">

      <div class="card-header">

        <div>

          <span class="section-label">CAMPUS AMBASSADOR PROFILE</span>

          <h2>${escapeHTML(name)}</h2>

          <p>${escapeHTML(student.college || "—")} · ${escapeHTML(student.designation || "—")}</p>

        </div>

        <button class="mini-button neutral" id="closeProfile" type="button">Close profile</button>

      </div>

      <div class="profile-stats">

        <div><strong>${getStudentPoints(student).toLocaleString("en-IN")}</strong><small>Total points</small></div>

        <div><strong>${studentSubmissions.length}</strong><small>Activities submitted</small></div>

        <div><strong>${studentRewards.length || Number(student.rewards_count || 0)}</strong><small>Reward requests</small></div>

      </div>

      <div class="profile-info">

        <span><b>Email</b>${escapeHTML(student.email || "—")}</span>

        <span><b>Mobile</b>${escapeHTML(student.mobile || "—")}</span>

        <span><b>LinkedIn</b>${linkedin ? `<a href="${escapeHTML(linkedin)}" target="_blank" rel="noopener noreferrer">View profile ↗</a>` : "—"}</span>

      </div>

      <h3>Activity History</h3>

      <p class="muted-note">Review submitted evidence. Undo reverses approved points; Reject marks the submission as not accepted.</p>

      <div class="profile-task-grid">

        ${studentSubmissions.length ? studentSubmissions.map((item) => renderSubmissionCard(item)).join("") : '<p class="muted-note">No activity submissions found.</p>'}

      </div>

      <h3>Rewards</h3>

      <div class="profile-rewards">

        ${studentRewards.length ? studentRewards.map((reward) => `

          <div><strong>${escapeHTML(reward.reward_name)}</strong>

          <span>${escapeHTML(reward.status)}${reward.voucher_code ? ` · ${escapeHTML(reward.voucher_code)}` : ""}</span></div>`).join("") : '<p class="muted-note">No reward requests recorded in this session.</p>'}

      </div>

    </div>`;



  $("closeProfile").addEventListener("click", () => profileBox.classList.add("hidden"));

  profileBox.querySelectorAll("[data-submission-action]").forEach((button) => {

    button.addEventListener("click", () => reviewSubmission(

      Number(button.dataset.submissionId), button.dataset.submissionAction

    ));

  });

}



function renderSubmissionCard(item) {

  const id = getSubmissionId(item);

  const status = normaliseStatus(item.status);

  const points = Number(item.points ?? item.approved_points ?? 0);

  const photo = getSubmissionPhoto(item);

  const remarks = item.admin_remarks || "";



  return `

    <article class="submission-card">

      <div class="submission-heading">

        <div><h4>${escapeHTML(getSubmissionTitle(item))}</h4><p>${escapeHTML(formatDate(item.submitted_at || item.date))}</p></div>

        <span class="status ${escapeHTML(status)}">${escapeHTML(status)}</span>

      </div>

      <p class="submission-caption">${escapeHTML(getSubmissionCaption(item))}</p>

      ${photo ? `

        <a class="submission-photo-link" href="${escapeHTML(photo)}" target="_blank" rel="noopener noreferrer">

          <img class="submission-photo" src="${escapeHTML(photo)}" alt="${escapeHTML(getSubmissionTitle(item))} evidence">

          <span>View full photo ↗</span>

        </a>` : '<div class="photo-empty">No photo attached.</div>'}

      <div class="submission-footer"><strong>${points} points</strong><span>Submission #${id}</span></div>

      ${remarks ? `<p class="muted-note">Admin remarks: ${escapeHTML(remarks)}</p>` : ""}

      <div class="submission-actions">

        ${status === "completed" ? `

          <button class="mini-button neutral" type="button" data-submission-action="undo" data-submission-id="${id}">Undo task</button>

          <button class="mini-button danger" type="button" data-submission-action="reject" data-submission-id="${id}">Reject task</button>` : `<span class="muted-note">${status === "undone" ? "Points reversed" : status === "rejected" ? "No points awarded" : "No action available"}</span>`}

      </div>

    </article>`;

}



async function reviewSubmission(submissionId, action) {

  const item = submissions.find((submission) => getSubmissionId(submission) === submissionId);

  if (!item) return;

  const actionLabel = action === "undo" ? "undo this submission and reverse its points" : "reject this submission";

  if (!window.confirm(`Are you sure you want to ${actionLabel}?`)) return;



  if (demoMode) {

    item.status = action === "undo" ? "undone" : "rejected";

    item.points = 0;

    const student = students.find((entry) => Number(entry.id) === Number(item.student_id));

    if (student) {

      student.total_points = submissions

        .filter((submission) => Number(submission.student_id) === Number(student.id) && normaliseStatus(submission.status) === "completed")

        .reduce((total, submission) => total + Number(submission.points || 0), 0);

    }

    showMessage(`Submission ${submissionId} ${action === "undo" ? "undone" : "rejected"} in demo mode.`);

    renderStudents();

    renderRankings();

    await openStudentProfile(Number(item.student_id));

    return;

  }



  try {

    await api(`/admin/submissions/${submissionId}/${action}`, {

      method: "POST",

      body: JSON.stringify({ remarks: "Reviewed from Admin Portal" }),

    });

    showMessage(`Submission ${action === "undo" ? "undone" : "rejected"} successfully.`);

    await loadStudents();

    await loadRankings();

    await openStudentProfile(Number(item.student_id));

  } catch (error) {

    showMessage(error.message, true);

  }

}



// ------------------------------

// Rankings

// ------------------------------

async function loadRankings() {

  if (demoMode) return renderRankings();

  if (!requireLiveMode()) return;



  $("rankingTable").innerHTML = '<tr><td colspan="4" class="empty-state">Loading rankings...</td></tr>';

  try {

    const result = await api("/admin/rankings");

    rankings = Array.isArray(result) ? result : (result.rankings || result.items || []);

    renderRankings();

  } catch (error) {

    $("rankingTable").innerHTML = `<tr><td colspan="4" class="empty-state">${escapeHTML(error.message)}</td></tr>`;

    throw error;

  }

}



function renderRankings() {

  const rows = demoMode

    ? [...students].sort((a, b) => getStudentPoints(b) - getStudentPoints(a)).map((student, index) => ({

      rank: index + 1, full_name: getStudentName(student), college: student.college,

      total_points: getStudentPoints(student),

    }))

    : rankings;



  $("rankingTable").innerHTML = rows.length ? rows.map((row, index) => `

    <tr>

      <td>#${Number(row.rank || index + 1)}</td>

      <td><strong>${escapeHTML(row.full_name || row.name || "Student")}</strong></td>

      <td>${escapeHTML(row.college || "—")}</td>

      <td>${Number(row.total_points ?? row.points ?? 0).toLocaleString("en-IN")} pts</td>

    </tr>`).join("") : '<tr><td colspan="4" class="empty-state">No ranking records found.</td></tr>';

}



// ------------------------------

// Reward request management

// ------------------------------

async function loadRewards() {
  if (demoMode) return renderRewards();
  if (!requireLiveMode()) return;

  $("rewardRequestList").innerHTML = '<p class="empty-state">Loading reward requests...</p>';
  try {
    const result = await api("/rewards/requests");
    rewards = Array.isArray(result) ? result : (result.requests || result.items || []);
    renderRewards();
  } catch (error) {
    $("rewardRequestList").innerHTML = `<p class="empty-state">${escapeHTML(error.message)}</p>`;
    throw error;
  }
}

function renderRewards() {
  const counts = { pending: 0, approved: 0, rejected: 0, issued: 0 };
  rewards.forEach((reward) => {
    const status = normaliseStatus(reward.status);
    if (Object.prototype.hasOwnProperty.call(counts, status)) counts[status] += 1;
  });

  $("rewardPendingCount").textContent = String(counts.pending);
  ["pending", "approved", "rejected", "issued"].forEach((status) => {
    const countElement = $(`reward${status.charAt(0).toUpperCase()}${status.slice(1)}Count`);
    if (countElement) countElement.textContent = String(counts[status]);
  });

  const activeFilter = $("rewardStatusFilter")?.value || "all";
  const filteredRewards = rewards.filter((reward) => {
    const status = normaliseStatus(reward.status);
    return activeFilter === "all" || status === activeFilter;
  });

  if (!filteredRewards.length) {
    $("rewardRequestList").innerHTML = `<p class="empty-state">${rewards.length ? "No requests match this status." : "No reward requests found."}</p>`;
    return;
  }

  $("rewardRequestList").innerHTML = filteredRewards.map((reward) => {
    const status = normaliseStatus(reward.status);
    const student = students.find((item) => Number(item.id) === Number(reward.student_id)) || {};
    const studentName = reward.student_name || student.full_name || student.name || `Student #${reward.student_id}`;
    const studentEmail = reward.student_email || student.email || "";
    const currentPoints = Number(reward.current_points ?? reward.student_current_points ?? student.total_points ?? student.points ?? 0);
    const pointsAtRequest = Number(reward.points_at_request ?? 0);
    const note = reward.student_note || reward.note || "No note provided.";
    const requestDate = reward.requested_at || reward.created_at;
    const remarks = reward.admin_remarks || "";

    return `
      <article class="reward-request-card">
        <div class="reward-request-top">
          <div>
            <h4>${escapeHTML(studentName)}</h4>
            <p>${escapeHTML(studentEmail || "Email not available")}</p>
          </div>
          <span class="status ${escapeHTML(status)}">${escapeHTML(status)}</span>
        </div>
        <div class="reward-meta admin-reward-meta">
          <span><small>Current points</small><strong>${currentPoints.toLocaleString("en-IN")} pts</strong></span>
          <span><small>Points at request</small><strong>${pointsAtRequest.toLocaleString("en-IN")} pts</strong></span>
          <span><small>Requested reward</small><strong>${escapeHTML(reward.reward_name || "—")}</strong></span>
          <span><small>Request date</small><strong>${escapeHTML(formatDate(requestDate))}</strong></span>
          <span class="reward-note-field"><small>Student note</small><strong>${escapeHTML(note)}</strong></span>
        </div>
        <div class="reward-contact-actions">
          ${studentEmail ? `<button class="mini-button neutral" type="button" data-copy-email="${escapeHTML(studentEmail)}">Copy email</button>` : ""}
        </div>
        ${status === "pending" ? `
          <div class="reward-actions">
            <button class="mini-button success" type="button" data-reward-action="approve" data-reward-id="${Number(reward.id)}">Approve</button>
            <button class="mini-button danger" type="button" data-reward-action="reject" data-reward-id="${Number(reward.id)}">Reject</button>
          </div>` : ""}
        ${status === "approved" ? `<p class="reward-admin-remark approved-remark"><strong>Admin note:</strong> ${escapeHTML(remarks || "Your reward request has been approved.")}</p>` : ""}
        ${status === "rejected" ? `<p class="reward-admin-remark rejected-remark"><strong>Rejection reason:</strong> ${escapeHTML(remarks || "No reason provided.")}</p>` : ""}
        ${status === "issued" ? `<p class="reward-admin-remark"><strong>Previously marked as issued.</strong>${remarks ? ` ${escapeHTML(remarks)}` : ""}</p>` : ""}
      </article>`;
  }).join("");

  $("rewardRequestList").querySelectorAll("[data-reward-action]").forEach((button) => {
    button.addEventListener("click", () => handleRewardAction(Number(button.dataset.rewardId), button.dataset.rewardAction));
  });
  $("rewardRequestList").querySelectorAll("[data-copy-email]").forEach((button) => {
    button.addEventListener("click", () => copyEmail(button.dataset.copyEmail));
  });
}

async function handleRewardAction(rewardId, action) {
  const reward = rewards.find((item) => Number(item.id) === rewardId);
  if (!reward || !["approve", "reject"].includes(action)) return;

  const isReject = action === "reject";
  if (!window.confirm(`${isReject ? "Reject" : "Approve"} the request for ${reward.reward_name || "this reward"}?`)) return;

  let adminRemarks = "";
  if (isReject) {
    adminRemarks = window.prompt("Please enter the reason for rejecting this request:");
    if (adminRemarks === null) return;
    adminRemarks = adminRemarks.trim();
    if (!adminRemarks) {
      showMessage("Please enter a rejection reason.", true);
      return;
    }
  } else {
    const enteredRemarks = window.prompt("Optional note for the student:", "");
    if (enteredRemarks === null) return;
    adminRemarks = enteredRemarks.trim() || "Your reward request has been approved.";
  }

  if (demoMode) {
    reward.status = isReject ? "rejected" : "approved";
    reward.admin_remarks = adminRemarks;
    reward.reviewed_at = new Date().toISOString();
    renderRewards();
    showMessage(`Reward request ${isReject ? "rejected" : "approved"} in demo mode.`);
    return;
  }

  try {
    await api(`/rewards/requests/${rewardId}/${action}`, {
      method: "PATCH",
      body: JSON.stringify({ admin_remarks: adminRemarks })
    });
    await loadRewards();
    showMessage(`Reward request ${isReject ? "rejected" : "approved"} successfully. No email was sent.`);
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function copyEmail(email) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email);
    } else {
      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = email;
      temporaryInput.style.position = "fixed";
      temporaryInput.style.opacity = "0";
      document.body.appendChild(temporaryInput);
      temporaryInput.select();
      document.execCommand("copy");
      temporaryInput.remove();
    }
    showMessage(`Copied ${email}`);
  } catch {
    showMessage("Could not copy automatically. Please select and copy the email shown on the card.", true);
  }
}

// // Announcements (preview only)

// // ------------------------------

// function handleAnnouncementPreview(event) {

//   event.preventDefault();

//   const title = $("announcementTitle").value.trim();

//   const description = $("announcementDescription").value.trim();

//   const whatsappLink = $("announcementWhatsapp").value.trim();



//   $("announcementPreview").innerHTML = `

//     <span class="announcement-tag">ANNOUNCEMENT PREVIEW</span>

//     <h3>${escapeHTML(title)}</h3>

//     <p>${escapeHTML(description)}</p>

//     ${whatsappLink ? `<a href="${escapeHTML(whatsappLink)}" target="_blank" rel="noopener noreferrer">Join WhatsApp group ↗</a>` : ""}

//     <p class="muted-note">Preview only. This announcement has not been published to students.</p>`;

//   showMessage("Announcement preview updated. It has not been published to students.");

// }

// ------------------------------

// Announcements - Live API

// ------------------------------



async function loadAnnouncements() {

  if (demoMode) {

    $("announcementList").innerHTML =

      '<p class="empty-state">Announcements are unavailable in demo mode.</p>';

    return;

  }



  if (!requireLiveMode()) return;



  $("announcementList").innerHTML =

    '<p class="empty-state">Loading announcements...</p>';



  try {

    const result = await api("/announcements/admin");



    const items = Array.isArray(result)

      ? result

      : (result.announcements || result.items || []);



    renderAnnouncements(items);

  } catch (error) {

    $("announcementList").innerHTML =

      `<p class="empty-state">${escapeHTML(error.message)}</p>`;

  }

}



function renderAnnouncements(items) {

  const container = $("announcementList");



  if (!items.length) {

    container.innerHTML =

      '<p class="empty-state">No announcements created yet.</p>';

    return;

  }



  container.innerHTML = items.map((item) => {

    const published = Boolean(item.is_published);

    const link = item.whatsapp_link || "";



    return `

      <article class="reward-request-card announcement-item">

        <div class="reward-request-top">

          <div>

            <h4>${escapeHTML(item.title)}</h4>

            <p>${escapeHTML(formatDate(item.created_at))}</p>

          </div>

          <span class="status ${published ? "completed" : "pending"}">

            ${published ? "Published" : "Draft"}

          </span>

        </div>



        <p class="submission-caption">

          ${escapeHTML(item.description)}

        </p>



        ${link ? `

          <p>

            <a href="${escapeHTML(link)}"

               target="_blank"

               rel="noopener noreferrer">

              WhatsApp link ↗

            </a>

          </p>

        ` : ""}



        <div class="reward-actions">

          <button

            class="mini-button ${published ? "neutral" : "success"}"

            type="button"

            data-announcement-action="publish"

            data-announcement-id="${Number(item.id)}"

            data-published="${published}">

            ${published ? "Unpublish" : "Publish"}

          </button>



          <button

            class="mini-button neutral"

            type="button"

            data-announcement-action="edit"

            data-announcement-id="${Number(item.id)}">

            Edit

          </button>



          <button

            class="mini-button danger"

            type="button"

            data-announcement-action="delete"

            data-announcement-id="${Number(item.id)}">

            Delete

          </button>

        </div>

      </article>

    `;

  }).join("");



  container.querySelectorAll("[data-announcement-action]").forEach((button) => {

    button.addEventListener("click", () => {

      const id = Number(button.dataset.announcementId);

      const action = button.dataset.announcementAction;



      if (action === "publish") {

        toggleAnnouncement(id, button.dataset.published === "true");

      }



      if (action === "edit") {

        editAnnouncement(id, items);

      }



      if (action === "delete") {

        deleteAnnouncement(id);

      }

    });

  });

}





// Save a new announcement as a draft

async function handleAnnouncementPreview(event) {

  event.preventDefault();



  const title = $("announcementTitle").value.trim();

  const description = $("announcementDescription").value.trim();

  const whatsappLink = $("announcementWhatsapp").value.trim();



  if (!title || !description) {

    showMessage("Please enter the announcement title and description.", true);

    return;

  }



  if (demoMode) {

    showMessage("Log in to the live Admin Portal to save announcements.", true);

    return;

  }



  const button = $("announcementForm").querySelector('button[type="submit"]');

  button.disabled = true;

  button.textContent = "Saving...";



  try {

    await api("/announcements", {

      method: "POST",

      body: JSON.stringify({

        title,

        description,

        whatsapp_link: whatsappLink || null

      })

    });



    $("announcementForm").reset();



    $("announcementPreview").innerHTML = `

      <h3>No announcement yet</h3>

      <p>Your announcement preview will appear here.</p>

    `;



    await loadAnnouncements();

    showMessage("Announcement saved as a draft successfully.");

  } catch (error) {

    showMessage(error.message, true);

  } finally {

    button.disabled = false;

    button.textContent = "Save as Draft";

  }

}





// Publish or unpublish

async function toggleAnnouncement(id, currentlyPublished) {

  const nextStatus = !currentlyPublished;



  const actionText = nextStatus ? "publish" : "unpublish";



  if (!window.confirm(`Are you sure you want to ${actionText} this announcement?`)) {

    return;

  }



  try {

    await api(`/announcements/${id}/publish`, {

      method: "PATCH",

      body: JSON.stringify({

        is_published: nextStatus

      })

    });



    await loadAnnouncements();



    showMessage(

      `Announcement ${nextStatus ? "published" : "unpublished"} successfully.`

    );

  } catch (error) {

    showMessage(error.message, true);

  }

}





// Edit an announcement

async function editAnnouncement(id, items) {

  const item = items.find((announcement) => Number(announcement.id) === id);

  if (!item) return;



  const title = window.prompt("Edit announcement title:", item.title);

  if (title === null) return;



  const description = window.prompt(

    "Edit announcement description:",

    item.description

  );

  if (description === null) return;



  const whatsappLink = window.prompt(

    "Edit WhatsApp link (leave blank if not required):",

    item.whatsapp_link || ""

  );

  if (whatsappLink === null) return;



  if (!title.trim() || !description.trim()) {

    showMessage("Title and description cannot be empty.", true);

    return;

  }



  try {

    await api(`/announcements/${id}`, {

      method: "PUT",

      body: JSON.stringify({

        title: title.trim(),

        description: description.trim(),

        whatsapp_link: whatsappLink.trim() || null

      })

    });



    await loadAnnouncements();

    showMessage("Announcement updated successfully.");

  } catch (error) {

    showMessage(error.message, true);

  }

}





// Delete an announcement

async function deleteAnnouncement(id) {

  if (!window.confirm("Are you sure you want to delete this announcement?")) {

    return;

  }



  try {

    await api(`/announcements/${id}`, {

      method: "DELETE"

    });



    await loadAnnouncements();

    showMessage("Announcement deleted successfully.");

  } catch (error) {

    showMessage(error.message, true);

  }

}

// ------------------------------

// Event listeners and initial state

// ------------------------------

$("adminLoginForm").addEventListener("submit", handleLogin);

$("demoModeBtn").addEventListener("click", startDemo);

$("exitDemoBtn").addEventListener("click", logout);

$("logoutBtn").addEventListener("click", logout);

$("studentSearch").addEventListener("input", filterStudents);

$("announcementForm").addEventListener("submit", handleAnnouncementPreview);

$("refreshAnnouncements").addEventListener("click", loadAnnouncements);
if ($("rewardStatusFilter")) $("rewardStatusFilter").addEventListener("change", renderRewards);



document.querySelectorAll(".admin-nav-item").forEach((button) => {

  button.addEventListener("click", () => showPage(button.dataset.page));

});



// If an admin token already exists, validate it and reopen the portal.

(async function restoreAdminSession() {

  if (!localStorage.getItem(TOKEN_KEY)) return;

  try {

    const currentUser = await api("/user/me");

    if (String(currentUser.role || "").toLowerCase() !== "admin") throw new Error("Not an admin account");

    $("adminAuth").classList.add("hidden");

    $("adminPortal").classList.remove("hidden");

    await loadStudents();

    await loadRankings();

    await loadRewards();

    await loadAnnouncements();

    showPage("students");

  } catch {

    localStorage.removeItem(TOKEN_KEY);

  }

})();
