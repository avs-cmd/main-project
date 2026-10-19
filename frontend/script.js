/* =====================================================

   TALERANG CAMPUS AMBASSADOR

\===================================================== */

const API_BASE_URL = "http://127.0.0.1:8000";

const TOKEN_KEY = "talerangAccessToken";

const POINT_TARGET = 1000;

const REWARD_STORAGE_KEY = "talerangRewardsDemo";

const TASK_STORAGE_KEY = "talerangTaskSubmissionsDemo";





/* =====================================================

   USER

\===================================================== */



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

\===================================================== */



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

\===================================================== */



function getPosition(points) {

    if (points >= 6000) return "Chapter President";

    if (points >= 3000) return "Chapter Ambassador";

    return "Campus Ambassador";

}





/* =====================================================

   SAVE

\===================================================== */



function saveUser() {



    localStorage.setItem(

        "talerangUser",

        JSON.stringify(user)

    );



}





/* =====================================================

   UPDATE PORTAL

\===================================================== */



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
    const rank = Number(user.rank) || 12;
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



    syncTaskPointsForCurrentUser();

    renderRepeatableTaskCards();

    updatePortal();

    updateTaskCompletionCount();

    renderActivityTracker();

    configureRoleView();

    renderRewardViews();

    openPage(user.role === "admin" ? "adminRewards" : "rewards");



}





/* =====================================================

   LOGIN / SIGNUP TABS

\===================================================== */



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

\===================================================== */





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

\===================================================== */





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

\===================================================== */



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



/* Load live leaderboard when Rankings is opened */

if (page === "rankings") {

    loadRankingsFromBackend();

}







}





/* =====================================================

   REPEATABLE TASK ACTIVITIES + PROOF TRACKER

   Frontend-only storage. Authentication and signup/login handlers remain unchanged.

\===================================================== */



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

    "Referral": 1,

    "Team Call / Add Value": 2,

    "Put Up Posters": 3,

    "Brochures": 4,

    "Workshop": 5,

    "Social Media Post": 6,

    "Weekly Team Call": 7

};



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

        item.photoPath.startsWith("http://") ||

        item.photoPath.startsWith("https://")

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

    const entries = getCurrentUserTasks().slice().sort((a,b) => new Date(b.completedAt || b.createdAt || 0) - new Date(a.completedAt || a.createdAt || 0));

    if (!entries.length) {

        tbody.innerHTML = '<tr><td colspan="6">No activities yet. Add an activity from the Tasks section.</td></tr>';

        return;

    }

    tbody.innerHTML = entries.map(item => {

        const status = item.status === "Available" ? "Not completed" : item.status === "Reversed" ? "Points reversed" : item.status;

        const photoUrl = item.uploadedPhotoUrl || item.photoData;

        const photo = photoUrl ? `<a class="proof-thumbnail-link" href="${escapeHTML(photoUrl)}" target="\_blank" rel="noopener">${item.uploadedPhotoUrl ? "View uploaded photo" : "View photo (local)"}</a>` : "No photo";

        return `<tr>

            <td><strong>${escapeHTML(getActivityLabel(item))}</strong><small class="tracker-date">${escapeHTML(item.completedAt ? new Date(item.completedAt).toLocaleDateString() : "Not completed yet")}</small></td>

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

\===================================================== */



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

\===================================================== */



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

\===================================================== */



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

\===================================================== */



const DEFAULT_REWARDS = [

    { id: 1, name: "₹500 Voucher", description: "Voucher reward supplied by Talerang.", points: 1000, quantity: 10, active: true },

    { id: 2, name: "Spotify Subscription", description: "Subscription reward subject to availability.", points: 1000, quantity: 5, active: true },

    { id: 3, name: "Netflix Subscription", description: "Subscription reward subject to availability.", points: 1500, quantity: 3, active: true },

    { id: 4, name: "Talerang Brochure Pack", description: "Physical materials issued by the Talerang team.", points: 1000, quantity: 20, active: true }

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

    updateTaskButtonStates();

    updateTaskCompletionCount();

    updateTaskPointLabels();

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

    document.getElementById("rewardEligibilityText").textContent = points >= POINT_TARGET ? "You have reached the 1,000-point milestone. You may request an available reward." : "You need " + (POINT_TARGET - points) + " more points to reach the first milestone.";



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

        const completedTasks = taskSubmissions.filter(item => ["Completed", "Approved", "Reversed"].includes(item.status));

        adminTasks.innerHTML = completedTasks.length ? completedTasks.slice().reverse().map(item => `<article class="admin-request-row"><div class="admin-request-top"><div><strong>${safeText(item.task)}</strong><span>${safeText(item.studentName)} · ${safeText(item.studentEmail)}</span></div><span class="status-pill status-${item.status === "Reversed" ? "rejected" : "approved"}">${safeText(item.status === "Approved" ? "Completed" : item.status)}</span></div><p>${Number(item.points)} points ${item.status === "Reversed" ? "reversed" : "awarded"}</p></article>`).join("") : '<div class="empty-state">No completed activities yet. Points are awarded immediately when a student clicks Done.</div>';

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



// Task points are no longer approval-based. This area is informational only for now.

document.getElementById("adminTaskSubmissions").addEventListener("click", function(event) {

    if (event.target.closest("[data-approve-task], [data-reject-task]")) {

        showToast("Task approval is disabled. Points are awarded when the student clicks Done.");

    }

});



/* =====================================================

   TOAST

\===================================================== */



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