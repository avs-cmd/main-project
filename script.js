/* =====================================================
   TALERANG CAMPUS AMBASSADOR
===================================================== */

const POINT_TARGET = 1000;
const REWARD_STORAGE_KEY = "talerangRewardsDemo";
const TASK_STORAGE_KEY = "talerangTaskSubmissionsDemo";


/* =====================================================
   USER
===================================================== */

let user = JSON.parse(
    localStorage.getItem("talerangUser")
) || {

    full_name: "Avni Agarwal",

    email: "example@email.com",

    mobile: "+91 XXXXX XXXXX",

    college: "Your College",

    linkedin_url: "https://linkedin.com/",

    points: 110,

    rank: 12,

    role: "student"

};


/* =====================================================
   AUTH ELEMENTS
===================================================== */

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
===================================================== */

function getPosition(points) {

    if (points >= 1500) {
        return "City Chapter President";
    }

    if (points >= 1000) {
        return "Chapter President";
    }

    return "Campus Ambassador";
}


/* =====================================================
   SAVE
===================================================== */

function saveUser() {

    localStorage.setItem(
        "talerangUser",
        JSON.stringify(user)
    );

}


/* =====================================================
   UPDATE PORTAL
===================================================== */

function updatePortal() {

    const points =
        Number(user.points) || 0;

    const position =
        getPosition(points);

    const percentage =
        Math.min(
            (points / POINT_TARGET) * 100,
            100
        );

    const remaining =
        Math.max(
            POINT_TARGET - points,
            0
        );


    /* NAME */

    document.getElementById("sidebarName")
        .textContent = user.full_name;

    document.getElementById("welcomeName")
        .textContent = user.full_name;

    document.getElementById("homeName")
        .textContent =
        user.full_name.split(" ")[0];


    /* AVATAR */

    const firstLetter =
        user.full_name
            ? user.full_name.charAt(0).toUpperCase()
            : "A";

    document.getElementById("sidebarAvatar")
        .textContent = firstLetter;

    document.getElementById("topAvatar")
        .textContent = firstLetter;

    document.getElementById("profileAvatar")
        .textContent = firstLetter;


    /* POSITION */

    document.getElementById("sidebarPosition")
        .textContent = position;

    document.getElementById("homePosition")
        .textContent = position;

    document.getElementById("currentPosition")
        .textContent = position;

    document.getElementById("dashboardPosition")
        .textContent = position;

    document.getElementById("profileCurrentPosition")
        .textContent = position;


    /* POINTS */

    document.getElementById("homeScore")
        .textContent = points;

    document.getElementById("dashboardPoints")
        .textContent = points;

    document.getElementById("dashboardScore")
        .textContent = points;

    document.getElementById("profilePoints")
        .textContent = points;

    document.getElementById("rankingPoints")
        .textContent = points;


    /* RANK */

    const rank =
        user.rank || 12;

    document.getElementById("homeRank")
        .textContent = rank;

    document.getElementById("dashboardRank")
        .textContent = rank;

    document.getElementById("rankingPosition")
        .textContent = rank;

    document.getElementById("profileRank")
        .textContent = rank;


    /* PROGRESS */

    document.getElementById("progressPercentage")
        .textContent =
        percentage.toFixed(1);

    document.getElementById("progressPoints")
        .textContent = points;

    document.getElementById("pointsRemaining")
        .textContent = remaining;

    document.getElementById("dashboardProgress")
        .style.width =
        percentage + "%";


    /* PROFILE */

    document.getElementById("profileName")
        .textContent = user.full_name;

    document.getElementById("profileFullName")
        .textContent = user.full_name;

    document.getElementById("profileEmail")
        .textContent = user.email;

    document.getElementById("profileMobile")
        .textContent = user.mobile;

    document.getElementById("profileCollege")
        .textContent = user.college;

    document.getElementById("profileCollegeDetail")
        .textContent = user.college;

    document.getElementById("rankingName")
        .textContent = user.full_name;

    document.getElementById("rankingCollege")
        .textContent = user.college;


    /* LINKEDIN */

    document.getElementById("profileLinkedin")
        .href =
        user.linkedin_url || "#";

}


/* =====================================================
   SHOW PORTAL
===================================================== */

function showPortal() {

    authPage.classList.add("hidden");

    portalPage.classList.remove("hidden");

    updatePortal();
    configureRoleView();
    renderRewardViews();
    openPage(user.role === "admin" ? "adminRewards" : "rewards");

}


/* =====================================================
   LOGIN / SIGNUP TABS
===================================================== */

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
===================================================== */

loginForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        // Frontend preview only: use admin@talerang.com to preview admin controls.
        // Real role verification must be done by FastAPI, never by this browser check.
        const identity = document.getElementById("loginIdentity").value.trim().toLowerCase();
        if (identity === "admin@talerang.com") {
            user = { ...user, full_name: "Talerang Admin", email: identity, role: "admin" };
            saveUser();
        } else {
            user = { ...user, role: "student" };
            saveUser();
        }
        showPortal();

    }
);


/* =====================================================
   SIGNUP
===================================================== */

signupForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const password =
            document.getElementById(
                "signupPassword"
            ).value;


        const confirmPassword =
            document.getElementById(
                "signupConfirmPassword"
            ).value;


        if (password !== confirmPassword) {

            showToast(
                "Passwords do not match."
            );

            return;
        }


        user = {

            full_name:
                document.getElementById(
                    "signupName"
                ).value,

            mobile:
                document.getElementById(
                    "signupMobile"
                ).value,

            email:
                document.getElementById(
                    "signupEmail"
                ).value,

            college:
                document.getElementById(
                    "signupCollege"
                ).value,

            linkedin_url:
                document.getElementById(
                    "signupLinkedin"
                ).value,

            points: 0,

            rank: 0,

            role: "student"

        };


        saveUser();

        showPortal();

        showToast(
            "Account created successfully."
        );

    }
);


/* =====================================================
   NAVIGATION
===================================================== */

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

        adminRewards: "Admin Rewards",

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

}


/* =====================================================
   TASK SUBMISSIONS (DEMO ONLY)
   Points are added only when an admin approves a submission.
===================================================== */

let taskSubmissions = JSON.parse(localStorage.getItem(TASK_STORAGE_KEY) || "[]");

function saveTaskSubmissions() {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(taskSubmissions));
}

document.querySelectorAll(".task-button").forEach(function(button) {
    button.addEventListener("click", function() {
        const task = button.dataset.task;
        const alreadyPending = taskSubmissions.some(item => item.task === task && item.status === "Pending" && item.studentEmail === user.email);
        const alreadyApproved = taskSubmissions.some(item => item.task === task && item.status === "Approved" && item.studentEmail === user.email);
        if (alreadyPending || alreadyApproved) {
            showToast(alreadyApproved ? "This activity has already been approved." : "This activity is already awaiting admin approval.");
            return;
        }
        taskSubmissions.push({ id: Date.now(), task, points: Number(button.dataset.points), status: "Pending", studentName: user.full_name, studentEmail: user.email });
        saveTaskSubmissions();
        button.textContent = "Submitted for approval";
        button.disabled = true;
        renderRewardViews();
        showToast("Activity submitted. Points are added after admin approval.");
    });
});

/* =====================================================
   EDIT PROFILE
===================================================== */

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


editProfileForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        user.full_name =
            document.getElementById(
                "editFullName"
            ).value;


        user.mobile =
            document.getElementById(
                "editMobile"
            ).value;


        user.college =
            document.getElementById(
                "editCollege"
            ).value;


        user.linkedin_url =
            document.getElementById(
                "editLinkedin"
            ).value;


        saveUser();

        updatePortal();

        editProfileForm
            .classList
            .add("hidden");


        showToast(
            "Profile updated successfully."
        );

    }
);


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
===================================================== */

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
===================================================== */

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
   REWARDS SYSTEM (LOCAL FRONTEND DEMO)
   Replace localStorage operations with authenticated FastAPI endpoints later.
===================================================== */

const DEFAULT_REWARDS = [
    { id: 1, name: "₹500 Voucher", description: "Unlocks at 1,000 approved points. Submit a request and wait for admin approval before the ₹500 voucher is issued.", points: 1000, quantity: 10, active: true },
    { id: 2, name: "Spotify Subscription", description: "Unlocks at 1,000 approved points, subject to availability and admin approval.", points: 1000, quantity: 5, active: true },
    { id: 3, name: "Netflix Subscription", description: "Unlocks at 1,500 approved points, subject to availability and admin approval.", points: 1500, quantity: 3, active: true },
    { id: 4, name: "Talerang Brochure Pack", description: "Brochure pack provided by the Talerang team after eligibility and admin approval.", points: 1000, quantity: 20, active: true }
];
let rewardData = JSON.parse(localStorage.getItem(REWARD_STORAGE_KEY) || "null") || { catalogue: DEFAULT_REWARDS.map(item => ({ ...item })), requests: [] };
// Preserve existing admin edits, but restore any standard reward that is missing from older browser data.
if (!Array.isArray(rewardData.catalogue)) rewardData.catalogue = [];
DEFAULT_REWARDS.forEach(defaultReward => {
    const exists = rewardData.catalogue.some(item => String(item.name).trim().toLowerCase() === defaultReward.name.toLowerCase());
    if (!exists) rewardData.catalogue.push({ ...defaultReward });
});
if (!Array.isArray(rewardData.requests)) rewardData.requests = [];
function saveRewardData() { localStorage.setItem(REWARD_STORAGE_KEY, JSON.stringify(rewardData)); }
function safeText(value) { return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch])); }
function configureRoleView() {
    const admin = user.role === "admin";
    const adminNav = document.getElementById("adminRewardsNav");
    if (adminNav) adminNav.classList.toggle("hidden", !admin);
    document.querySelectorAll(".task-button").forEach(button => {
        const task = button.dataset.task;
        const mine = taskSubmissions.find(item => item.task === task && item.studentEmail === user.email && ["Pending", "Approved"].includes(item.status));
        if (mine) { button.disabled = true; button.textContent = mine.status === "Approved" ? "Approved" : "Pending approval"; }
        else { button.disabled = false; button.textContent = "Submit for approval"; }
    });
}
function renderRewardViews() {
    if (!document.getElementById("studentAvailableRewards")) return;
    const points = Number(user.points) || 0;
    const percent = Math.min(100, Math.round(points / POINT_TARGET * 100));
    document.getElementById("studentRewardPoints").textContent = points;
    document.getElementById("rewardProgressPercent").textContent = percent;
    document.getElementById("rewardPointsRemaining").textContent = Math.max(0, POINT_TARGET - points);
    document.getElementById("rewardProgressBar").style.width = percent + "%";
    const rewardValue = document.getElementById("rewardValue");
    if (rewardValue) rewardValue.textContent = points;
    document.getElementById("rewardEligibilityText").textContent = points >= POINT_TARGET ? "You have reached the 1,000-point milestone. You may request an available reward." : "You need " + (POINT_TARGET - points) + " more approved points to reach the first milestone.";

    const available = rewardData.catalogue.filter(reward => reward.active && reward.quantity > 0);
    document.getElementById("studentAvailableRewards").innerHTML = available.map(reward => {
        const eligible = points >= Number(reward.points);
        const requested = rewardData.requests.some(req => req.rewardId === reward.id && req.studentEmail === user.email && ["Pending", "Approved", "Issued"].includes(req.status));
        return `<article class="reward-card"><span class="reward-icon">🎁</span><h3>${safeText(reward.name)}</h3><p>${safeText(reward.description)}</p><div class="reward-card-meta"><strong>${Number(reward.points)} points</strong><span>${Number(reward.quantity)} available</span></div><button class="primary-btn reward-request-btn" data-request-reward="${reward.id}" ${(!eligible || requested) ? "disabled" : ""}>${requested ? "Already requested" : eligible ? "Request reward" : `Need ${Number(reward.points)} points`}</button></article>`;
    }).join("") || '<div class="empty-state">No rewards are currently available. Please check again later.</div>';

    const myRequests = rewardData.requests.filter(req => req.studentEmail === user.email).slice().reverse();
    document.getElementById("studentRewardRequests").innerHTML = myRequests.length ? myRequests.map(req => `<article class="request-row"><div class="request-row-main"><strong>${safeText(req.rewardName)}</strong><span>Requested ${safeText(req.requestedAt || "")}</span><p>${safeText(req.adminNote || "")}</p>${req.status === "Issued" ? `<div class="issued-code"><span>${req.rewardType === "physical" ? "Issue / delivery details" : "Your reward code"}</span><strong>${safeText(req.code || req.deliveryDetails || "Issued by admin")}</strong></div>` : ""}</div><span class="status-pill status-${req.status.toLowerCase()}">${safeText(req.status)}</span></article>`).join("") : '<div class="empty-state">You have not requested a reward yet.</div>';

    const catalogue = document.getElementById("adminRewardCatalogue");
    if (catalogue) catalogue.innerHTML = rewardData.catalogue.map(reward => `<article class="catalogue-row"><div><strong>${safeText(reward.name)}</strong><span>${Number(reward.points)} points · ${Number(reward.quantity)} available</span></div><button class="small-outline-btn" data-toggle-reward="${reward.id}">${reward.active ? "Disable" : "Enable"}</button></article>`).join("") || '<div class="empty-state">No rewards added.</div>';

    const adminRequests = document.getElementById("adminRewardRequests");
    if (adminRequests) adminRequests.innerHTML = rewardData.requests.length ? rewardData.requests.slice().reverse().map(req => `<article class="admin-request-row"><div class="admin-request-top"><div><strong>${safeText(req.rewardName)}</strong><span>${safeText(req.studentName)} · ${safeText(req.studentEmail)}</span></div><span class="status-pill status-${req.status.toLowerCase()}">${safeText(req.status)}</span></div><p>Points required: ${Number(req.pointsRequired)} · Requested: ${safeText(req.requestedAt || "")}</p>${req.status === "Pending" ? `<div class="admin-action-row"><button class="small-outline-btn" data-approve-request="${req.id}">Approve</button><button class="small-danger-btn" data-reject-request="${req.id}">Reject</button></div>` : ""}${req.status === "Approved" ? `<form class="issue-reward-form" data-issue-form="${req.id}"><label>Reward type</label><select name="rewardType"><option value="voucher">Digital voucher/code</option><option value="physical">Physical reward</option></select><label>Code or issue/delivery details</label><input name="issueDetails" placeholder="Enter real code or handover details" required><label>Admin note (optional)</label><input name="adminNote" placeholder="Note for student"><button class="primary-btn" type="submit">Mark as issued</button></form>` : ""}${req.status === "Rejected" ? `<p class="admin-help-text">Reason: ${safeText(req.adminNote || "Not provided")}</p>` : ""}</article>`).join("") : '<div class="empty-state">No reward requests yet.</div>';

    const adminTasks = document.getElementById("adminTaskSubmissions");
    if (adminTasks) {
        const pendingTasks = taskSubmissions.filter(item => item.status === "Pending");
        adminTasks.innerHTML = pendingTasks.length ? pendingTasks.map(item => `<article class="admin-request-row"><div class="admin-request-top"><div><strong>${safeText(item.task)}</strong><span>${safeText(item.studentName)} · ${safeText(item.studentEmail)}</span></div><span class="status-pill status-pending">Pending</span></div><p>Points on approval: ${Number(item.points)}</p><div class="admin-action-row"><button class="small-outline-btn" data-approve-task="${item.id}">Approve & add points</button><button class="small-danger-btn" data-reject-task="${item.id}">Reject</button></div></article>`).join("") : '<div class="empty-state">No pending activity submissions.</div>';
    }

    const count = id => document.getElementById(id);
    if (count("adminRewardCount")) count("adminRewardCount").textContent = rewardData.catalogue.length;
    if (count("adminPendingCount")) count("adminPendingCount").textContent = rewardData.requests.filter(req => req.status === "Pending").length;
    if (count("adminIssuedCount")) count("adminIssuedCount").textContent = rewardData.requests.filter(req => req.status === "Issued").length;
}

document.getElementById("studentAvailableRewards").addEventListener("click", function(event) {
    const button = event.target.closest("[data-request-reward]");
    if (!button) return;
    const reward = rewardData.catalogue.find(item => item.id === Number(button.dataset.requestReward));
    if (!reward || Number(user.points) < Number(reward.points)) { showToast("You do not have enough approved points for this reward."); return; }
    const duplicate = rewardData.requests.some(req => req.rewardId === reward.id && req.studentEmail === user.email && ["Pending", "Approved", "Issued"].includes(req.status));
    if (duplicate) { showToast("You already have a request for this reward."); return; }
    rewardData.requests.push({ id: Date.now(), rewardId: reward.id, rewardName: reward.name, pointsRequired: Number(reward.points), studentName: user.full_name, studentEmail: user.email, status: "Pending", requestedAt: new Date().toLocaleDateString(), code: "", deliveryDetails: "", adminNote: "" });
    saveRewardData(); renderRewardViews(); showToast("Reward request sent to the admin.");
});

const addRewardForm = document.getElementById("addRewardForm");
addRewardForm.addEventListener("submit", function(event) {
    event.preventDefault();
    if (user.role !== "admin") { showToast("Only an admin can add rewards."); return; }
    rewardData.catalogue.push({ id: Date.now(), name: document.getElementById("newRewardName").value.trim(), description: document.getElementById("newRewardDescription").value.trim(), points: Number(document.getElementById("newRewardPoints").value), quantity: Number(document.getElementById("newRewardQuantity").value), active: true });
    saveRewardData(); addRewardForm.reset(); document.getElementById("newRewardPoints").value = 1000; document.getElementById("newRewardQuantity").value = 10; renderRewardViews(); showToast("Reward option added.");
});

document.getElementById("adminRewardCatalogue").addEventListener("click", function(event) {
    const button = event.target.closest("[data-toggle-reward]"); if (!button) return;
    if (user.role !== "admin") { showToast("Admin access required."); return; }
    const reward = rewardData.catalogue.find(item => item.id === Number(button.dataset.toggleReward)); if (reward) reward.active = !reward.active;
    saveRewardData(); renderRewardViews();
});

document.getElementById("adminRewardRequests").addEventListener("click", function(event) {
    if (user.role !== "admin") { showToast("Admin access required."); return; }
    const approve = event.target.closest("[data-approve-request]");
    const reject = event.target.closest("[data-reject-request]");
    if (approve) { const req = rewardData.requests.find(item => item.id === Number(approve.dataset.approveRequest)); if (req) req.status = "Approved"; saveRewardData(); renderRewardViews(); showToast("Request approved. Enter the reward code/details to issue it."); }
    if (reject) { const req = rewardData.requests.find(item => item.id === Number(reject.dataset.rejectRequest)); if (req) { req.status = "Rejected"; req.adminNote = prompt("Optional rejection reason:") || "Request rejected by admin."; } saveRewardData(); renderRewardViews(); }
});

document.getElementById("adminRewardRequests").addEventListener("submit", function(event) {
    const form = event.target.closest("[data-issue-form]"); if (!form) return;
    event.preventDefault();
    if (user.role !== "admin") { showToast("Admin access required."); return; }
    const req = rewardData.requests.find(item => item.id === Number(form.dataset.issueForm));
    const formData = new FormData(form); const details = String(formData.get("issueDetails") || "").trim();
    if (!req || !details) return;
    req.rewardType = formData.get("rewardType");
    if (req.rewardType === "physical") req.deliveryDetails = details; else req.code = details;
    req.adminNote = String(formData.get("adminNote") || "").trim(); req.status = "Issued";
    const reward = rewardData.catalogue.find(item => item.id === req.rewardId); if (reward && reward.quantity > 0) reward.quantity -= 1;
    saveRewardData(); renderRewardViews(); showToast("Reward marked as issued.");
});

document.getElementById("adminTaskSubmissions").addEventListener("click", function(event) {
    if (user.role !== "admin") { showToast("Admin access required."); return; }
    const approve = event.target.closest("[data-approve-task]");
    const reject = event.target.closest("[data-reject-task]");
    if (approve) {
        const submission = taskSubmissions.find(item => item.id === Number(approve.dataset.approveTask));
        if (submission && submission.status === "Pending") {
            submission.status = "Approved";
            // Demo limitation: the current prototype uses one active localStorage user.
            // Real multi-student point changes must happen in the backend by student ID.
            if (submission.studentEmail === user.email) user.points = (Number(user.points) || 0) + Number(submission.points);
            saveTaskSubmissions(); saveUser(); updatePortal(); renderRewardViews(); configureRoleView(); showToast("Task approved and points updated for the current demo user.");
        }
    }
    if (reject) { const submission = taskSubmissions.find(item => item.id === Number(reject.dataset.rejectTask)); if (submission) submission.status = "Rejected"; saveTaskSubmissions(); renderRewardViews(); configureRoleView(); }
});

/* =====================================================
   TOAST
===================================================== */

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