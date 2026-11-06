/* =====================================================

   TALERANG CAMPUS AMBASSADOR

//===================================================== */

// Use the deployed API on the live website and localhost during local development.

const API_BASE_URL = window.TALERANG_API_BASE_URL ||

    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"

        ? "http\://127.0.0.1:8000"

        : "https\://main-project-f0fd.onrender.com");

const TOKEN_KEY = "talerangAccessToken";

const ANNOUNCEMENT_SEEN_KEY = "talerangLastSeenAnnouncement";

const POINT_TARGET = 1000;

const TASK_STORAGE_KEY = "talerangTaskSubmissionsDemo";

/* =====================================================

   USER

//===================================================== */

let user = JSON.parse(

    localStorage.getItem("talerangUser")

) || {

    full_name: "Avni Agarwal",

    email: "example\@email.com",

    mobile: "+91 XXXXX XXXXX",

    college: "Your College",

    linkedin_url: "https\://linkedin.com/",

    points: 110,

    rank: 12,

    role: "student"

};

/* =====================================================

   AUTH ELEMENTS

//===================================================== */

const authPage =

    document.getElementById("authPage");

const portalPage =

    document.getElementById("portalPage");

const loginForm =

    document.getElementById("loginForm");

const signupForm =

    document.getElementById("signupForm");

const loginTab =

    document.getElementById("loginTab");

const signupTab =

    document.getElementById("signupTab");

/* =====================================================

   POSITION

//===================================================== */

function getPosition(points) {

    if (points >= 6000) return "Chapter President";

    if (points >= 3000) return "Chapter Ambassador";

    return "Campus Ambassador";

}

/* =====================================================

   SAVE

//===================================================== */

function saveUser() {

    localStorage.setItem(

        "talerangUser",

        JSON.stringify(user)

    );

}

/* =====================================================

   UPDATE PORTAL

//===================================================== */

function updatePortal() {

    const points = Number(user.points) || 0;

    const position = getPosition(points);

    const percentage = Math.min((points / 3000) * 100, 100);

    const remaining = Math.max(3000 - points, 0);

    // Safely update optional elements: different portal views may not contain every ID.

    const setText = (id, value) => {

        const element = document.getElementById(id);

        if (element) element.textContent = value ?? "";

    };

    const setHref = (id, value) => {

        const element = document.getElementById(id);

        if (element) element.href = value || "#";

    };

    const setWidth = (id, value) => {

        const element = document.getElementById(id);

        if (element) element.style.width = value;

    };

    // Name

    setText("sidebarName", user.full_name);

    setText("welcomeName", user.full_name);

    setText("homeName", String(user.full_name || "Ambassador").split(" ")[0]);

    // Avatar

    const firstLetter = user.full_name ? user.full_name.charAt(0).toUpperCase() : "A";

    setText("sidebarAvatar", firstLetter);

    setText("topAvatar", firstLetter);

    setText("profileAvatar", firstLetter);

    // Position

    setText("sidebarPosition", position);

    setText("homePosition", position);

    setText("currentPosition", position);

    setText("dashboardPosition", position);

    setText("profileCurrentPosition", position);

    setText("rankingUserPosition", position);

    // Points

    setText("homeScore", points);

    setText("dashboardPoints", points);

    setText("dashboardScore", points);

    setText("profilePoints", points);

    setText("rankingPoints", points);

    // Rank

   const rank = Number(user.rank) > 0

    ? Number(user.rank)

    : "—";

    setText("homeRank", rank);

    setText("dashboardRank", rank);

    setText("rankingPosition", rank);

    setText("profileRank", rank);

    // Profile and highlighted ranking row details

    setText("profileName", user.full_name);

    setText("profileFullName", user.full_name);

    setText("profileEmail", user.email);

    setText("profileMobile", user.mobile);

    setText("profileCollege", user.college);

    setText("profileCollegeDetail", user.college);

    setText("rankingName", user.full_name);

    setText("rankingCollege", user.college);

    // Progress

    setText("progressPercentage", percentage.toFixed(1));

    setText("progressPoints", points);

    setText("pointsRemaining", remaining);

    setWidth("dashboardProgress", percentage + "%");

    // LinkedIn profile

    setHref("profileLinkedin", user.linkedin_url);

}

function showPortal() {

    authPage.classList.add("hidden");

    portalPage.classList.remove("hidden");

    // Load this student's saved activity submissions from FastAPI/PostgreSQL.

    if (user.role === "student") {

        loadBackendTaskSubmissions();

    }

    syncTaskPointsForCurrentUser();

    renderRepeatableTaskCards();

    updatePortal();

    loadRankingsFromBackend();

    updateTaskCompletionCount();

    renderActivityTracker();

    configureRoleView();

    renderRewardViews();

    refreshRewardPoints();

    loadStudentRewardRequests();

    loadStudentAnnouncements();

    checkAnnouncementNotification();

    openPage("dashboard");

}

/* =====================================================

   LOGIN / SIGNUP TABS

//===================================================== */

function showLogin() {

    loginForm.classList.remove("hidden");

    signupForm.classList.add("hidden");

    loginTab.classList.add("active");

    signupTab.classList.remove("active");

    document.getElementById("authTitle")

        .textContent = "Welcome back";

    document.getElementById("authSubtitle")

        .textContent =

        "Sign in to continue to your portal.";

}

function showSignup() {

    loginForm.classList.add("hidden");

    signupForm.classList.remove("hidden");

    loginTab.classList.remove("active");

    signupTab.classList.add("active");

    document.getElementById("authTitle")

        .textContent =

        "Create your account";

    document.getElementById("authSubtitle")

        .textContent =

        "Join Talerang as a Campus Ambassador.";

}

loginTab.addEventListener(

    "click",

    showLogin

);

signupTab.addEventListener(

    "click",

    showSignup

);

document.getElementById("goSignup")

    .addEventListener(

        "click",

        showSignup

    );

document.getElementById("goLogin")

    .addEventListener(

        "click",

        showLogin

    );

/* =====================================================

   LOGIN

//===================================================== */

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const identity = document

        .getElementById("loginIdentity").value.trim();

    const password = document

        .getElementById("loginPassword").value;

    try {

        const response = await fetch(`${API_BASE_URL}/user/login`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({ identity, password })

        });

        const data = await response.json();

        if (!response.ok) {

            const message = typeof data.detail === "string"

                ? data.detail

                : "Login failed. Check your email/mobile and password.";

            throw new Error(message);

        }

        localStorage.setItem(TOKEN_KEY, data.access_token);

        user = {

            ...data.user,

            points: 0,

            rank: 0,

            linkedin_url: data.user.linkedin_url || ""

        };

        saveUser();

        showPortal();

        showToast("Login successful!");

    } catch (error) {

        console.error("Login error:", error);

        showToast(error.message || "Unable to connect to FastAPI.");

    }

});

/* =====================================================

   SIGNUP

//===================================================== */

signupForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const full_name = document

        .getElementById("signupName").value.trim();

    const mobile = document

        .getElementById("signupMobile").value.trim();

    const email = document

        .getElementById("signupEmail").value.trim();

    const college = document

        .getElementById("signupCollege").value.trim();

    const linkedin_url = document

        .getElementById("signupLinkedin").value.trim();

    const password = document

        .getElementById("signupPassword").value;

    const confirm_password = document

        .getElementById("signupConfirmPassword").value;

    if (!linkedin_url) {

        showToast("Please enter your LinkedIn profile URL.");

        return;

    }

    if (password !== confirm_password) {

        showToast("Passwords do not match.");

        return;

    }

    try {

        const response = await fetch(`${API_BASE_URL}/user/signup`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                full_name,

                mobile,

                email,

                college,

                linkedin_url,

                password,

                confirm_password

            })

        });

        const data = await response.json();

        if (!response.ok) {

            const message = typeof data.detail === "string"

                ? data.detail

                : Array.isArray(data.detail)

                    ? data.detail.map(item => item.msg).join(", ")

                    : "Signup failed.";

            throw new Error(message);

        }

        showToast("Signup successful! Please log in.");

        document.getElementById("loginIdentity").value = email;

        document.getElementById("loginPassword").value = "";

        signupForm.reset();

        showLogin();

    } catch (error) {

        console.error("Signup error:", error);

        showToast(error.message || "Unable to connect to FastAPI.");

    }

});

/* =====================================================

   NAVIGATION

//===================================================== */

document.querySelectorAll(".nav-item")

    .forEach(function(item) {

        item.addEventListener(

            "click",

            function() {

                openPage(

                    item.dataset.page

                );

            }

        );

    });

document.querySelectorAll("[data-go]")

    .forEach(function(button) {

        button.addEventListener(

            "click",

            function() {

                openPage(

                    button.dataset.go

                );

            }

        );

    });

function openPage(page) {

    checkAnnouncementNotification(page === "announcements");

    /* Hide every section */

    document

        .querySelectorAll(".portal-section")

        .forEach(function(section) {

            section.classList.remove(

                "active-section"

            );

        });

    /* Show selected */

    const selected =

        document.getElementById(page);

    if (selected) {

        selected.classList.add(

            "active-section"

        );

    }

    /* Active sidebar */

    document

        .querySelectorAll(".nav-item")

        .forEach(function(item) {

            item.classList.remove(

                "active"

            );

            if (

                item.dataset.page === page

            ) {

                item.classList.add(

                    "active"

                );

            }

        });

    /* Page title */

    const titles = {

        home: "Home",

        dashboard: "Dashboard",

        tasks: "Tasks",

        rankings: "Rankings",

        announcements: "Announcements",

        rewards: "My Rewards",

        profile: "Profile"

    };

    document.getElementById(

        "pageTitle"

    ).textContent =

        titles[page] || "Home";

window.scrollTo({

    top: 0,

    behavior: "smooth"

});

if (page === "announcements") {

    loadStudentAnnouncements();

}

/* Refresh live rankings on Home and Rankings */

if (page === "home" || page === "rankings") {

    loadRankingsFromBackend();

}

}

/* =====================================================

   REPEATABLE TASK ACTIVITIES + PROOF TRACKER

   Frontend-only storage. Authentication and signup/login handlers remain unchanged.

//===================================================== */

let taskSubmissions = JSON.parse(localStorage.getItem(TASK_STORAGE_KEY) || "[]");

if (!Array.isArray(taskSubmissions)) taskSubmissions = [];

function saveTaskSubmissions() {

    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(taskSubmissions));

}

function isTaskCompleted(item) {

    return item && ["Completed", "Approved"].includes(item.status) && item.pointsAwarded !== false;

}

function getEarnedTaskPoints(email = user.email) {

    return taskSubmissions

        .filter(item => item.studentEmail === email && isTaskCompleted(item))

        .reduce((total, item) => total + (Number(item.points) || 0), 0);

}

async function syncTaskPointsForCurrentUser() {

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {

        return;

    }

    try {

        const response = await fetch(`${API_BASE_URL}/tasks/summary`, {

            method: "GET",

            headers: {

                "Authorization": `Bearer ${token}`

            }

        });

        if (!response.ok) {

            throw new Error("Could not load points from the backend.");

        }

        const data = await response.json();

        // Use PostgreSQL-backed values returned by FastAPI.

        user.points = Number(data.total_points) || 0;

        user.completedTasks = Number(data.completed_tasks) || 0;

        saveUser();

        updatePortal();

        updateTaskCompletionCount();

        renderRewardViews();

    } catch (error) {

        console.error("Points sync error:", error);

        showToast("Could not refresh points from the backend.");

    }

}

async function loadRankingsFromBackend() {

    const token = localStorage.getItem(TOKEN_KEY);

    const tableBody = document.getElementById("rankingsTableBody");

    if (!tableBody) return;

    if (!token) {

        tableBody.innerHTML = `

            <tr><td colspan="5">Please log in to view rankings.</td></tr>

        `;

        return;

    }

    try {

        const response = await fetch(`${API_BASE_URL}/tasks/rankings`, {

            method: "GET",

            headers: {

                "Authorization": `Bearer ${token}`

            }

        });

        if (!response.ok) {

            throw new Error(`Rankings request failed: ${response.status}`);

        }

        const rankings = await response.json();

        const currentStudent = rankings.find(

            student => Number(student.student_id) === Number(user.id)

        );

        if (currentStudent) {

            user.rank = Number(currentStudent.rank);

            user.points = Number(currentStudent.total_points) || 0;

            saveUser();

            updatePortal();

        }

        if (!rankings.length) {

            tableBody.innerHTML = `

                <tr><td colspan="5">No rankings available yet.</td></tr>

            `;

            return;

        }

        tableBody.innerHTML = rankings.map(student => {

            const isCurrentStudent = currentStudent &&

                Number(student.student_id) === Number(currentStudent.student_id);

            return `

                <tr class="${isCurrentStudent ? "my-row" : ""}">

                    <td>${Number(student.rank)}</td>

                    <td>${escapeHTML(student.full_name)}</td>

                    <td>${escapeHTML(student.college || "—")}</td>

                    <td>${Number(student.total_points) || 0}</td>

                    <td>Campus Ambassador</td>

                </tr>

            `;

        }).join("");

    } catch (error) {

        console.error("Rankings error:", error);

        tableBody.innerHTML = `

            <tr><td colspan="5">Unable to load rankings. Please try again.</td></tr>

        `;

    }

}

const TASK_DEFINITIONS = [

    { name: "Referral", points: 200 },

    { name: "Team Call / Add Value", points: 100 },

    { name: "Put Up Posters", points: 100 },

    { name: "Brochures", points: 100 },

    { name: "Workshop", points: 500 }

];

function getCurrentUserTasks() {

    return taskSubmissions.filter(item => item.studentEmail === user.email && item.activityKey);

}

function nextActivityNumber(taskName) {

    const entries = getCurrentUserTasks().filter(item => item.task === taskName);

    return entries.reduce((max, item) => Math.max(max, Number(item.activityNumber) || 0), 0) + 1;

}

function getActivityLabel(item) {

    return `${item.task} ${Number(item.activityNumber) || 1}`;

}

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

}

/* =====================================================

   STUDENT ANNOUNCEMENTS - LIVE API

\===================================================== */

function formatAnnouncementDate(value) {

    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

async function loadStudentAnnouncements() {

    const container = document.getElementById("studentAnnouncementsList");

    if (!container) return;

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {

        container.innerHTML =

            '<p class="announcement-empty">Please log in to view announcements.</p>';

        return;

    }

    container.innerHTML =

        '<p class="announcement-empty">Loading announcements...</p>';

    try {

        const response = await fetch(`${API_BASE_URL}/announcements`, {

            method: "GET",

            headers: {

                "Authorization": `Bearer ${token}`

            }

        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {

            throw new Error(

                typeof data.detail === "string"

                    ? data.detail

                    : `Announcements request failed (${response.status})`

            );

        }

        const announcements = Array.isArray(data)

            ? data

            : (data.announcements || data.items || []);

        renderStudentAnnouncements(announcements);

    } catch (error) {

        console.error("Announcements error:", error);

        container.innerHTML = `

            <div class="announcement-empty">

                ${escapeHTML(error.message)}

                <button type="button" class="simple-link"

                        id="retryStudentAnnouncements">

                    Try again

                </button>

            </div>

        `;

        document.getElementById("retryStudentAnnouncements")

            ?.addEventListener("click", loadStudentAnnouncements);

    }

}

function renderStudentAnnouncements(announcements) {
    const container = document.getElementById("studentAnnouncementsList");
    if (!container) return;

    const published = (Array.isArray(announcements) ? announcements : [])
        .filter(item => item && item.is_published === true);

    const homeTitle = document.getElementById("homeAnnouncementTitle");
    const homeDescription = document.getElementById("homeAnnouncementDescription");

    const sorted = [...published].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

    if (!sorted.length) {
        container.innerHTML = `
            <div class="announcement-empty-state">
                <div class="announcement-empty-icon" aria-hidden="true">!</div>
                <h3>No announcements yet</h3>
                <p>There are no published updates at the moment. Please check again later.</p>
            </div>
        `;
        if (homeTitle) homeTitle.textContent = "No new announcements";
        if (homeDescription) {
            homeDescription.textContent = "There are no published updates right now.";
        }
        return;
    }

    // Keep the existing Home page's latest-update text in sync.
    const latest = sorted[0];
    if (homeTitle) homeTitle.textContent = latest.title || "Latest announcement";
    if (homeDescription) homeDescription.textContent = latest.description || "";

    // Render published announcements only. Images are optional for older announcements.
    container.innerHTML = sorted.map(item => {
        const whatsapp = String(item.whatsapp_link || "").trim();
        const validWhatsapp = /^https:\/\/(chat.whatsapp.com|wa.me)\//i.test(whatsapp);

        const imageUrl = String(item.image_url || "").trim();
        const safeImageUrl = /^https:\/\/res.cloudinary.com\//i.test(imageUrl)
            ? imageUrl
            : "";

        const dateText = formatAnnouncementDate(item.created_at);
        const imageMarkup = safeImageUrl ? `
            <div class="student-announcement-image-wrap">
                <img
                    class="student-announcement-image"
                    src="${escapeHTML(safeImageUrl)}"
                    alt="${escapeHTML(item.title || "Talerang announcement")}"
                    loading="lazy"
                    decoding="async"
                >
            </div>
        ` : "";

        const whatsappMarkup = validWhatsapp ? `
            <div class="student-announcement-actions">
                <a
                    class="student-announcement-whatsapp"
                    href="${escapeHTML(whatsapp)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Join WhatsApp Group <span aria-hidden="true">→</span>
                </a>
            </div>
        ` : "";

        return `
            <article class="announcement-card student-announcement-card">
                <div class="student-announcement-accent"></div>
                <div class="student-announcement-heading">
                    <div class="student-announcement-icon" aria-hidden="true">!</div>
                    <div class="student-announcement-heading-copy">
                        <div class="student-announcement-kicker">
                            <span class="student-announcement-label">TALERANG ANNOUNCEMENT</span>
                            <span class="student-announcement-date">${escapeHTML(dateText || "Latest update")}</span>
                        </div>
                        <h2>${escapeHTML(item.title || "Talerang Update")}</h2>
                    </div>
                </div>
                ${imageMarkup}
                <div class="student-announcement-content">
                    <p class="student-announcement-description">${escapeHTML(item.description || "")}</p>
                    ${whatsappMarkup}
                </div>
            </article>
        `;
    }).join("");
}

function renderRepeatableTaskCards() {

    document.querySelectorAll("#tasks .task-card").forEach(card => {

        const baseButton = card.querySelector(".task-button");

        const taskName = (baseButton && baseButton.dataset.task) || card.dataset.baseTask;

        if (!taskName) return;

        const points = Number((baseButton && baseButton.dataset.points) || card.dataset.basePoints) || 0;

        card.dataset.baseTask = taskName;

        card.dataset.basePoints = String(points);

        const definition = TASK_DEFINITIONS.find(item => item.name === taskName);

        if (!definition) return;

        const originalFooter = baseButton ? baseButton.closest(".task-footer") : card.querySelector(".task-footer");

        if (originalFooter && !originalFooter.querySelector(".add-task-button")) {

            const addButton = document.createElement("button");

            addButton.type = "button";

            addButton.className = "add-task-button";

            addButton.textContent = "+ Add another";

            addButton.setAttribute("aria-label", `Add another ${taskName} activity`);

            addButton.addEventListener("click", () => addTaskEntry(taskName, points));

            originalFooter.appendChild(addButton);

        }

        const original = taskSubmissions.find(item => item.studentEmail === user.email && item.task === taskName && !item.activityKey);

        if (original && !original.activityKey) {

            original.activityKey = `${taskName.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-legacy-${original.id || Date.now()}`;

            original.activityNumber = 1;

            original.points = Number(original.points) || points;

        }

        const entries = getCurrentUserTasks().filter(item => item.task === taskName);

        if (!entries.some(item => item.activityNumber === 1)) {

            const legacy = taskSubmissions.find(item => item.studentEmail === user.email && item.task === taskName && !item.activityKey);

            if (legacy) {

                legacy.activityKey = `${taskName.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-legacy-${legacy.id || Date.now()}`;

                legacy.activityNumber = 1;

            } else {

                taskSubmissions.push({

                    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,

                    activityKey: `${taskName.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-1`,

                    activityNumber: 1, task: taskName, points, status: "Available",

                    pointsAwarded: false, studentName: user.full_name, studentEmail: user.email,

                    createdAt: new Date().toISOString(), completedAt: null, caption: "", photoData: ""

                });

            }

        }

        if (baseButton) baseButton.remove();

        const oldList = card.querySelector(".task-entry-list");

        if (oldList) oldList.remove();

        const list = document.createElement("div");

        list.className = "task-entry-list";

        const sorted = getCurrentUserTasks().filter(item => item.task === taskName).sort((a,b) => (Number(a.activityNumber)||1)-(Number(b.activityNumber)||1));

        sorted.forEach(item => {

            const row = document.createElement("div");

            row.className = "task-entry-row";

            const label = document.createElement("strong");

            label.textContent = `${taskName} ${item.activityNumber || 1}`;

            const status = document.createElement("span");

            status.className = "task-entry-status";

            status.textContent = isTaskCompleted(item) ? "Completed" : "Available";

            const done = document.createElement("button");

            done.type = "button";

            done.className = "task-button task-entry-done";

            done.textContent = isTaskCompleted(item) ? "Completed" : "Done";

            done.disabled = isTaskCompleted(item) || item.status === "Reversed";

done.addEventListener("click", () =>

    submitActivityToBackend(item.activityKey, done)

);            row.append(label, status, done);

            list.appendChild(row);

        });

        card.appendChild(list);

    });

    saveTaskSubmissions();

    updateTaskButtonStates();

}

function addTaskEntry(taskName, points) {

    const activityNumber = nextActivityNumber(taskName);

    const slug = taskName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    taskSubmissions.push({

        id: `activity-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,

        activityKey: `${slug}-${activityNumber}-${Date.now()}`,

        activityNumber, task: taskName, points, status: "Available", pointsAwarded: false,

        studentName: user.full_name, studentEmail: user.email,

        createdAt: new Date().toISOString(), completedAt: null, caption: "", photoData: ""

    });

    saveTaskSubmissions();

    renderRepeatableTaskCards();

    renderActivityTracker();

    updateTaskCompletionCount();

    showToast(`${taskName} ${activityNumber} added. Complete it when the activity is done.`);

}

function completeTaskEntry(activityKey) {

    const item = taskSubmissions.find(

        entry =>

            entry.activityKey === activityKey &&

            entry.studentEmail === user.email

    );

    if (!item || isTaskCompleted(item)) return;

    const button = document.querySelector(

        `[data-submit-backend="${CSS.escape(activityKey)}"]`

    );

    if (button) {

        submitActivityToBackend(activityKey, button);

    } else {

        showToast(

            "Upload a photo and caption, then submit the activity."

        );

    }

}

function updateTaskPointLabels() {

    const taskIntro = document.querySelector("#tasks .page-heading p");

    if (taskIntro) taskIntro.textContent = "Add separate entries for every referral, workshop and other activity. Mark each one Done when completed.";

    document.querySelectorAll("#dashboard .stat-card small").forEach(element => {

        if (element.textContent.toLowerCase().includes("approved points")) element.textContent = "Points earned";

    });

}

function updateTaskCompletionCount() {

    const completed = Number(user.completedTasks) || 0;

    ["homeCompleted", "dashboardCompleted"].forEach(id => {

        const element = document.getElementById(id);

        if (element) {

            element.textContent = completed;

        }

    });

}

function updateTaskButtonStates() {

    document.querySelectorAll(".task-entry-done").forEach(button => {

        const row = button.closest(".task-entry-row");

        if (!row) return;

        const label = row.querySelector("strong")?.textContent || "";

        const item = getCurrentUserTasks().find(entry => getActivityLabel(entry) === label);

        if (!item) return;

        button.disabled = isTaskCompleted(item) || item.status === "Reversed";

        button.textContent = item.status === "Reversed" ? "Points reversed" : isTaskCompleted(item) ? "Completed" : "Done";

    });

}

const TASK_API_IDS = {

    "Referral": 2,

    "Team Call / Add Value": 6,

    "Put Up Posters": 1,

    "Brochures": 3,

    "Workshop": 5,

    "Social Media Post": 4,

    "Weekly Team Call": 7

};

// Load the logged-in student's saved submissions from FastAPI and merge them

// into the existing tracker entries. PostgreSQL is authoritative for submitted rows.

async function loadBackendTaskSubmissions() {

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token || !user || !user.email) return;

    const taskNamesById = Object.fromEntries(

        Object.entries(TASK_API_IDS).map(([name, id]) => [Number(id), name])

    );

    try {

        const response = await fetch(`${API_BASE_URL}/tasks/submissions`, {

            method: "GET",

            headers: { "Authorization": `Bearer ${token}` }

        });

        if (!response.ok) {

            throw new Error(`Submissions request failed (HTTP ${response.status}).`);

        }

        const records = await response.json();

        if (!Array.isArray(records)) throw new Error("Unexpected submissions response format.");

        records.forEach(record => {

            const backendId = Number(record.id);

            if (!backendId) return;

            const taskName = record.task_title || taskNamesById[Number(record.task_id)] || `Task ${record.task_id}`;

            const existing = taskSubmissions.find(entry =>

                entry.studentEmail === user.email && Number(entry.backendSubmissionId) === backendId

            );

            const activityNumber = records

                .filter(candidate => Number(candidate.task_id) === Number(record.task_id))

                .sort((a, b) => Number(a.id) - Number(b.id))

                .findIndex(candidate => Number(candidate.id) === backendId) + 1;

            const backendStatus = String(record.status || "pending").toLowerCase();

            const displayStatus = backendStatus === "completed" || backendStatus === "approved"

                ? "Completed"

                : backendStatus === "reversed" ? "Reversed" : "Pending approval";

            const photoUrl = record.photo_url || record.photo_path || "";

            const points = Number(record.approved_points) || 0;

            if (existing) {

                existing.task = taskName;

                existing.activityNumber = activityNumber || existing.activityNumber || 1;

                existing.points = points;

                existing.approvedPoints = points;

                existing.status = displayStatus;

                existing.backendStatus = backendStatus;

                existing.pointsAwarded = backendStatus === "completed" || backendStatus === "approved";

                existing.caption = record.caption || existing.caption || "";

                existing.uploadedPhotoUrl = photoUrl;

                existing.photoPath = photoUrl;

                existing.submittedAt = record.submitted_at || existing.submittedAt || "";

                existing.completedAt = existing.pointsAwarded ? (record.reviewed_at || record.submitted_at || existing.completedAt) : null;

                existing.adminRemarks = record.admin_remarks || "";

            } else {

                taskSubmissions.push({

                    id: `backend-submission-${backendId}`,

                    backendSubmissionId: backendId,

                    activityKey: `backend-${backendId}`,

                    activityNumber: activityNumber || 1,

                    task: taskName,

                    points,

                    approvedPoints: points,

                    status: displayStatus,

                    backendStatus,

                    pointsAwarded: backendStatus === "completed" || backendStatus === "approved",

                    studentName: user.full_name,

                    studentEmail: user.email,

                    createdAt: record.submitted_at || new Date().toISOString(),

                    submittedAt: record.submitted_at || "",

                    completedAt: (backendStatus === "completed" || backendStatus === "approved")

                        ? (record.reviewed_at || record.submitted_at || null) : null,

                    caption: record.caption || "",

                    photoData: "",

                    uploadedPhotoUrl: photoUrl,

                    photoPath: photoUrl,

                    adminRemarks: record.admin_remarks || ""

                });

            }

        });

        saveTaskSubmissions();

        renderRepeatableTaskCards();

        renderActivityTracker();

        updateTaskButtonStates();

    } catch (error) {

        console.error("Task submissions sync error:", error);

        showToast("Could not load saved activity submissions from the backend.");

    }

}

async function checkAnnouncementNotification(markAsSeen = false) {

    const dot = document.getElementById("announcementNotificationDot");

    if (!dot) return;

    try {

        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/announcements`, {

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        if (!response.ok) {

            console.error("Could not fetch announcements:", response.status);

            return;

        }

        const data = await response.json();

        const announcements = Array.isArray(data)

            ? data

            : data.announcements || data.items || [];

        const published = announcements.filter(

            item => item.is_published === true

        );

        if (published.length === 0) {

            dot.hidden = true;

            return;

        }

        const latestAnnouncement = published.reduce((latest, item) =>

            Number(item.id) > Number(latest.id) ? item : latest

        );

        const latestId = String(latestAnnouncement.id);

        const lastSeenId = localStorage.getItem(ANNOUNCEMENT_SEEN_KEY);

        if (markAsSeen) {

            localStorage.setItem(ANNOUNCEMENT_SEEN_KEY, latestId);

            dot.hidden = true;

        } else {

            dot.hidden = latestId === lastSeenId;

        }

    } catch (error) {

        console.error("Announcement notification error:", error);

    }

}

async function submitActivityToBackend(activityKey, button) {

    const item = taskSubmissions.find(entry =>

        entry.activityKey === activityKey && entry.studentEmail === user.email

    );

    if (!item) {

        showToast("Activity entry not found. Refresh the page and try again.");

        return;

    }

    if (item.backendSubmissionId) {

        showToast(`This activity was already submitted (submission #${item.backendSubmissionId}).`);

        return;

    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {

        showToast("Please log in again before submitting an activity.");

        return;

    }

    const captionInput = document.querySelector(`[data-caption-key="${CSS.escape(item.activityKey)}"]`);

    if (captionInput) item.caption = captionInput.value.trim();

    if (!item.caption) {

        showToast("Please write a caption before submitting.");

        if (captionInput) captionInput.focus();

        return;

    }

    if (!item.photoData || !item.photoData.startsWith("data:image/")) {

        showToast("Please upload a photo for this activity first.");

        return;

    }

    const taskId = TASK_API_IDS[item.task];

    if (!taskId) {

        showToast(`No backend task ID is configured for ${item.task}.`);

        return;

    }

    let photoBlob;

    try {

        const photoResponse = await fetch(item.photoData);

        photoBlob = await photoResponse.blob();

    } catch (error) {

        showToast("Could not read the selected photo. Please upload it again.");

        return;

    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(photoBlob.type)) {

        showToast("Please use a JPG, PNG, or WebP image.");

        return;

    }

    if (photoBlob.size > 2 * 1024 * 1024) {

        showToast("Please use an image smaller than 2 MB.");

        return;

    }

    const formData = new FormData();

    formData.append("task_id", String(taskId));

    formData.append("caption", item.caption);

    const extension = photoBlob.type === "image/png" ? "png" : photoBlob.type === "image/webp" ? "webp" : "jpg";

    formData.append("photo", photoBlob, `activity-proof-${Date.now()}.${extension}`);

    const oldText = button.textContent;

    button.disabled = true;

    button.textContent = "Submitting...";

    try {

        const response = await fetch(`${API_BASE_URL}/tasks/submissions`, {

            method: "POST",

            headers: { "Authorization": `Bearer ${token}` },

            body: formData

        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {

            const detail = Array.isArray(data.detail)

                ? data.detail.map(error => error.msg || error.message || "Invalid input").join(", ")

                : (data.detail || data.message || `Submission failed (HTTP ${response.status}).`);

            throw new Error(detail);

        }

item.backendSubmissionId = data.id;

item.backendStatus = data.status || "completed";

item.approvedPoints = Number(data.approved_points) || 0;

// Use the points returned by FastAPI, not the browser's estimate.

item.points = item.approvedPoints;

item.photoPath = data.photo_path || "";

item.uploadedPhotoUrl = item.photoPath

    ? (

        item.photoPath.startsWith("http\://") ||

        item.photoPath.startsWith("https\://")

            ? item.photoPath

            : `${API_BASE_URL}/${item.photoPath.replace(/^\/+/, "")}`

      )

    : "";

item.submittedAt = data.submitted_at || new Date().toISOString();

item.status = "Completed";

item.pointsAwarded = true;

item.completedAt = item.submittedAt;

renderRepeatableTaskCards();

updatePortal();

updateTaskCompletionCount();

syncTaskPointsForCurrentUser();

renderRepeatableTaskCards();

renderActivityTracker();

renderRewardViews();

showToast(`Activity completed! ${item.approvedPoints} points awarded.`);

    } catch (error) {

        console.error("Activity submission error:", error);

        showToast(error.message || "Could not connect to FastAPI.");

        button.disabled = false;

        button.textContent = oldText;

    }

}

function renderActivityTracker() {

    const tbody = document.getElementById("studentActivityTrackerRows");

    if (!tbody) return;

    const entries = getCurrentUserTasks().slice().sort((a,b) => new Date(b.submittedAt || b.completedAt || b.createdAt || 0) - new Date(a.submittedAt || a.completedAt || a.createdAt || 0));

    if (!entries.length) {

        tbody.innerHTML = '<tr><td colspan="6">No activities yet. Add an activity from the Tasks section.</td></tr>';

        return;

    }

    tbody.innerHTML = entries.map(item => {

        const status = item.status === "Available" ? "Not completed yet" : item.status === "Reversed" ? "Points reversed" : item.status === "Completed" || String(item.backendStatus || "").toLowerCase() === "completed" ? "Completed" : item.status === "Pending" || item.status === "pending" || item.status === "Pending approval" ? "Pending approval" : item.status;

        const photoUrl = item.uploadedPhotoUrl || item.photoPath || item.photoData;

        const photo = photoUrl ? `<a class="proof-thumbnail-link" href="${escapeHTML(photoUrl)}" target="//\\\\\\\\\\\\\\\\_blank" rel="noopener">${item.uploadedPhotoUrl ? "View uploaded photo" : "View photo (local)"}</a>` : "No photo";

        return `<tr>

            <td><strong>${escapeHTML(getActivityLabel(item))}</strong><small class="tracker-date">${escapeHTML((item.submittedAt || item.completedAt) ? new Date(item.submittedAt || item.completedAt).toLocaleDateString() : "Not completed yet")}</small></td>

            <td>${Number(item.points)||0} pts</td><td><span class="tracker-status ${isTaskCompleted(item)?"is-complete":"is-pending"}">${escapeHTML(status)}</span></td>

            <td>${photo}<label class="proof-upload-label" for="proof-${escapeHTML(String(item.activityKey))}">Upload / change<input id="proof-${escapeHTML(String(item.activityKey))}" class="proof-upload" type="file" accept="image/*" data-proof-key="${escapeHTML(String(item.activityKey))}"></label></td>

            <td><textarea class="proof-caption" data-caption-key="${escapeHTML(String(item.activityKey))}" rows="2" maxlength="500" placeholder="Write a short caption...">${escapeHTML(item.caption||"")}</textarea></td>

            <td>

                <button class="save-proof-button" type="button" data-save-proof="${escapeHTML(String(item.activityKey))}">Save proof</button>

                <button class="save-proof-button" type="button" data-submit-backend="${escapeHTML(String(item.activityKey))}">${item.backendSubmissionId ? "Submitted" : "Submit to Backend"}</button>

                ${item.backendSubmissionId ? `<small class="google-submit-note">Backend submission #${Number(item.backendSubmissionId)}</small>` : ""}

            </td>

        </tr>`;

    }).join("");

}

// Photos are previewed locally until submitted. Submit to Backend uploads the image to FastAPI.

document.addEventListener("change", function(event) {

    const input = event.target.closest(".proof-upload");

    if (!input || !input.files || !input.files[0]) return;

    const file = input.files[0];

    if (!file.type.startsWith("image/")) { showToast("Please choose an image file."); input.value = ""; return; }

    if (file.size > 2 * 1024 * 1024) { showToast("Please choose an image smaller than 2 MB."); input.value = ""; return; }

    const reader = new FileReader();

    reader.onload = () => {

        const item = taskSubmissions.find(entry => entry.activityKey === input.dataset.proofKey && entry.studentEmail === user.email);

        if (!item) return;

        item.photoData = String(reader.result || "");

        saveTaskSubmissions();

        renderActivityTracker();

        showToast("Photo preview saved in this browser. Click Submit to Backend to upload it to the server.");

    };

    reader.readAsDataURL(file);

});

document.addEventListener("input", function(event) {

    const caption = event.target.closest(".proof-caption");

    if (!caption) return;

    const item = taskSubmissions.find(entry => entry.activityKey === caption.dataset.captionKey && entry.studentEmail === user.email);

    if (item) { item.caption = caption.value; saveTaskSubmissions(); }

});

document.addEventListener("click", function(event) {

    const button = event.target.closest("[data-save-proof]");

    if (!button) return;

    const item = taskSubmissions.find(entry => entry.activityKey === button.dataset.saveProof && entry.studentEmail === user.email);

    if (!item) return;

    const caption = document.querySelector(`[data-caption-key="${CSS.escape(item.activityKey)}"]`);

    if (caption) item.caption = caption.value;

    saveTaskSubmissions();

    showToast("Caption and proof details saved for this activity.");

});

document.addEventListener("click", function(event) {

    const button = event.target.closest("[data-submit-backend]");

    if (!button) return;

    submitActivityToBackend(button.dataset.submitBackend, button);

});

/* =====================================================

   EDIT PROFILE

//===================================================== */

const editProfileBtn =

    document.getElementById(

        "editProfileBtn"

    );

const editProfileForm =

    document.getElementById(

        "editProfileForm"

    );

editProfileBtn.addEventListener(

    "click",

    function() {

        editProfileForm

            .classList

            .remove("hidden");

        document.getElementById(

            "editFullName"

        ).value =

            user.full_name;

        document.getElementById(

            "editMobile"

        ).value =

            user.mobile;

        document.getElementById(

            "editCollege"

        ).value =

            user.college;

        document.getElementById(

            "editLinkedin"

        ).value =

            user.linkedin_url;

    }

);

editProfileForm.addEventListener("submit", async function(event) {

    event.preventDefault();

console.log("MY PROFILE HANDLER STARTED");

    const full_name = document.getElementById("editFullName").value.trim();

    const mobile = document.getElementById("editMobile").value.trim();

    const college = document.getElementById("editCollege").value.trim();

    const linkedin_url = document.getElementById("editLinkedin").value.trim();

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {

        showToast("Please log in again.");

        return;

    }

    try {

        const response = await fetch(`${API_BASE_URL}/user/profile`, {

    method: "PUT",

    headers: {

        "Content-Type": "application/json",

        "Authorization": `Bearer ${token}`

    },

    body: JSON.stringify({

        full_name,

        mobile,

        college,

        linkedin_url

    })

});

console.log("HTTP STATUS:", response.status);

const data = await response.json();

console.log("SERVER RESPONSE:", data);

        if (!response.ok) {

            const message = typeof data.detail === "string"

                ? data.detail

                : "Profile update failed.";

            throw new Error(message);

        }

        user = {

            ...user,

            ...data,

            linkedin_url: data.linkedin_url || ""

        };

        saveUser();

        updatePortal();

        editProfileForm.classList.add("hidden");

        showToast("Profile updated successfully!");

    } catch (error) {

        console.error("Profile update error:", error);

        showToast(error.message || "Unable to update profile.");

    }

});

document.getElementById(

    "cancelProfileBtn"

).addEventListener(

    "click",

    function() {

        editProfileForm

            .classList

            .add("hidden");

    }

);

/* =====================================================

   LOGOUT

//===================================================== */

document.getElementById(

    "logoutBtn"

).addEventListener(

    "click",

    function() {

        portalPage

            .classList

            .add("hidden");

        authPage

            .classList

            .remove("hidden");

        showLogin();

    }

);

/* =====================================================

   FORGOT PASSWORD

//===================================================== */

document.getElementById(

    "forgotPassword"

).addEventListener(

    "click",

    function() {

        showToast(

            "Password reset will be connected to FastAPI."

        );

    }

);

/* =====================================================

   REWARDS - ROADMAP + BACKEND REQUESTS

   The roadmap is frontend-only. Requests use the existing FastAPI reward endpoints.

\\===================================================== */

function safeText(value) {

    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));

}

function configureRoleView() {

    // This is the student portal: no admin-only navigation or management UI is rendered here.

    updateTaskButtonStates();

    updateTaskCompletionCount();

    updateTaskPointLabels();

}

// Reward milestones are informational only. Students may request any reward,

// regardless of their current points; the admin reviews each request.

const rewardMilestones = [250, 500, 750, 1000, 1500, 2000];



function setRewardPointsDisplay(points) {

    const value = Math.max(0, Number(points) || 0);

    const display = document.getElementById("studentRewardPoints");

    const formDisplay = document.getElementById("requestCurrentPoints");



    if (display) display.textContent = value.toLocaleString("en-IN");

    if (formDisplay) formDisplay.value = value.toLocaleString("en-IN") + " points";



    const next = rewardMilestones.find(milestone => value < milestone);

    const nextLabel = document.getElementById("rewardNextMilestone");

    const remaining = document.getElementById("rewardPointsToNext");

    const fill = document.getElementById("rewardProgressFill");

    const progressText = document.getElementById("rewardProgressText");

    const progressTrack = document.querySelector(".reward-progress-track[role='progressbar']");



    if (nextLabel) {

        nextLabel.textContent = next

            ? next.toLocaleString("en-IN") + " points"

            : "All rewards reached";

    }

    if (remaining) {

        remaining.textContent = next

            ? (next - value).toLocaleString("en-IN") + " points to your next milestone"

            : "You've reached all listed reward milestones!";

    }



    const progress = Math.min(100, (value / 2000) * 100);

    if (fill) fill.style.width = progress + "%";

    if (progressText) {

        progressText.textContent = Math.min(value, 2000).toLocaleString("en-IN") +

            " / 2,000 points (" + progress.toFixed(0) + "%)";

    }

    if (progressTrack) {

        progressTrack.setAttribute("aria-valuenow", String(Math.min(value, 2000)));

    }



    document.querySelectorAll("#rewardRoadmap .roadmap-stop[data-points]").forEach(stop => {

        const target = Number(stop.dataset.points);

        const state = stop.querySelector(".roadmap-state");

        stop.classList.remove("is-reached", "is-next");



        if (value >= target) {

            stop.classList.add("is-reached");

            if (state) state.textContent = "✓ Unlocked";

        } else {

            // No reward is locked: this is only a progress indicator.

            if (target === next) stop.classList.add("is-next");

            if (state) state.textContent = "Upcoming";

        }

    });

}



function renderRewardViews() {

    if (!document.getElementById("studentRewardRequests")) return;

    setRewardPointsDisplay(user.points);

}



async function loadStudentRewardRequests() {

    const list = document.getElementById("studentRewardRequests");

    if (!list) return;



    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {

        list.innerHTML = '<p class="empty-state">Please log in to view your reward requests.</p>';

        return;

    }



    list.innerHTML = '<p class="empty-state">Loading your requests...</p>';



    try {

        const response = await fetch(`${API_BASE_URL}/rewards/requests/me`, {

            headers: { Authorization: `Bearer ${token}` }

        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {

            throw new Error(typeof data.detail === "string" ? data.detail : "Unable to load reward requests.");

        }



        const requests = Array.isArray(data)

            ? data

            : (data.requests || data.items || []);



        if (!requests.length) {

            list.innerHTML = '<p class="empty-state">You have not submitted a reward request yet.</p>';

            return;

        }



        list.innerHTML = requests.slice().reverse().map(request => {

            const rawStatus = String(request.status || "pending").toLowerCase();

            const allowedStatuses = ["pending", "approved", "rejected", "issued"];

            const status = allowedStatuses.includes(rawStatus) ? rawStatus : "pending";

            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

            const issuedDetails = request.voucher_code || request.delivery_details ||

                request.reward_details || "";

            const issuedDate = request.issued_at

                ? `<span>Issued ${safeText(formatRewardDate(request.issued_at))}</span>`

                : "";



            return `<article class="student-reward-request-row">

                <div class="student-reward-request-top">

                    <div>

                        <strong>${safeText(request.reward_name || "Reward request")}</strong>

                        <span>Requested ${safeText(formatRewardDate(request.requested_at))}</span>

                        ${issuedDate}

                    </div>

                    <span class="reward-status-pill ${status}">${statusLabel}</span>

                </div>

                ${request.student_note ? `<p class="student-reward-note">${safeText(request.student_note)}</p>` : ""}

                ${request.admin_remarks ? `<p class="student-reward-admin-note"><strong>Admin note:</strong> ${safeText(request.admin_remarks)}</p>` : ""}

                ${issuedDetails ? `<div class="student-reward-issued"><strong>Reward details</strong><span>${safeText(issuedDetails)}</span></div>` : ""}

            </article>`;

        }).join("");

    } catch (error) {

        list.innerHTML = `<p class="empty-state">${safeText(error.message || "Unable to load reward requests.")} Please refresh to try again.</p>`;

    }

}



function formatRewardDate(value) {

    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())

        ? String(value)

        : date.toLocaleDateString("en-IN", {

            day: "2-digit",

            month: "short",

            year: "numeric"

        });

}



const studentRewardRequestForm = document.getElementById("studentRewardRequestForm");

if (studentRewardRequestForm) {

    studentRewardRequestForm.addEventListener("submit", async function(event) {

        event.preventDefault();



        const token = localStorage.getItem(TOKEN_KEY);

        const message = document.getElementById("rewardRequestMessage");

        const submitButton = document.getElementById("submitStudentRewardRequest");

        const rewardNameInput = document.getElementById("requestedRewardName");

        const noteInput = document.getElementById("studentRewardNote");

        const rewardName = rewardNameInput ? rewardNameInput.value.trim() : "";

        const studentNote = noteInput ? noteInput.value.trim() : "";



        if (!token) {

            if (message) message.textContent = "Please log in again before submitting a request.";

            return;

        }

        if (!rewardName) {

            if (message) message.textContent = "Please enter a reward name.";

            if (rewardNameInput) rewardNameInput.focus();

            return;

        }



        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent = "Submitting...";

        }

        if (message) message.textContent = "";



        try {

            const response = await fetch(`${API_BASE_URL}/rewards/requests`, {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                // Intentionally do not send points_required or check eligibility.

                body: JSON.stringify({

                    reward_name: rewardName,

                    student_note: studentNote

                })

            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {

                throw new Error(typeof data.detail === "string"

                    ? data.detail

                    : "Unable to submit your reward request.");

            }



            studentRewardRequestForm.reset();

            if (message) message.textContent = "Your reward request has been submitted successfully.";

            await loadStudentRewardRequests();

        } catch (error) {

            if (message) {

                message.textContent = error.message || "Unable to submit your request. Please try again.";

            }

        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent = "Submit Reward Request";

            }

        }

    });

}



// Refresh points from the authenticated student summary before showing the request form.

async function refreshRewardPoints() {

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) return;

    try {

        const response = await fetch(`${API_BASE_URL}/tasks/summary`, { headers: { Authorization: `Bearer ${token}` } });

        if (!response.ok) throw new Error("Could not load your current points.");

        const data = await response.json();

        const summary = data.summary && typeof data.summary === "object" ? data.summary : data;

        const pointsValue = summary.total_points ?? summary.totalPoints ?? summary.current_points ?? summary.currentPoints ?? summary.points ?? summary.earned_points;

        if (pointsValue === undefined || pointsValue === null || Number.isNaN(Number(pointsValue))) throw new Error("The points summary did not include a valid points total.");

        user.points = Number(pointsValue);

        saveUser();

        setRewardPointsDisplay(user.points);

        updatePortal();

    } catch (error) {

        console.warn("Could not refresh reward points:", error);

    }

}

// Load the reward request history whenever the Rewards page is opened.

document.querySelectorAll('.nav-item[data-page="rewards"], [data-go="rewards"]').forEach(button => {

    button.addEventListener("click", () => {

        refreshRewardPoints();

        loadStudentRewardRequests();

    });

});

/* =====================================================

   TOAST

//===================================================== */

function showToast(message) {

    const toast =

        document.getElementById(

            "toast"

        );

    const toastMessage =

        document.getElementById(

            "toastMessage"

        );

    toastMessage.textContent =

        message;

    toast.classList.add(

        "show"

    );

    setTimeout(

        function() {

            toast.classList.remove(

                "show"

            );

        },

        2800

    );

}

document.addEventListener("DOMContentLoaded", function () {

    const refreshButton =

        document.getElementById("refreshStudentAnnouncements");

    if (refreshButton) {

        refreshButton.addEventListener(

            "click",

            loadStudentAnnouncements

        );

    }

});
