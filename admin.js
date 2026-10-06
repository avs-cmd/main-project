/* =====================================================
   TALERANG ADMIN PORTAL
===================================================== */


/* =====================================================
   DEMO STUDENTS
===================================================== */

const students = [

    {
        id: 1,
        name: "Avni Agarwal",
        email: "avni@example.com",
        mobile: "9876543210",
        college: "ABC College",
        points: 110,
        position: "Campus Ambassador",
        linkedin: "https://linkedin.com/",
        tasks: 2
    },

    {
        id: 2,
        name: "Rahul Sharma",
        email: "rahul@example.com",
        mobile: "9876543211",
        college: "Delhi University",
        points: 340,
        position: "Chapter President",
        linkedin: "https://linkedin.com/",
        tasks: 5
    },

    {
        id: 3,
        name: "Priya Singh",
        email: "priya@example.com",
        mobile: "9876543212",
        college: "Amity University",
        points: 260,
        position: "Campus Ambassador",
        linkedin: "https://linkedin.com/",
        tasks: 4
    },

    {
        id: 4,
        name: "Ananya Verma",
        email: "ananya@example.com",
        mobile: "9876543213",
        college: "Christ University",
        points: 190,
        position: "Campus Ambassador",
        linkedin: "https://linkedin.com/",
        tasks: 3
    }

];


/* =====================================================
   DEMO TASKS
===================================================== */

let studentTasks = [

    {
        id: 1,
        student: "Avni Agarwal",
        activity: "Refer a Student",
        points: 80,
        status: "Approved",
        date: "05 Oct 2026"
    },

    {
        id: 2,
        student: "Avni Agarwal",
        activity: "Distribute Talerang Material",
        points: 30,
        status: "Approved",
        date: "04 Oct 2026"
    },

    {
        id: 3,
        student: "Priya Singh",
        activity: "Social Media Post",
        points: 50,
        status: "Pending",
        date: "05 Oct 2026"
    },

    {
        id: 4,
        student: "Rahul Sharma",
        activity: "Host a Workshop",
        points: 100,
        status: "Approved",
        date: "03 Oct 2026"
    },

    {
        id: 5,
        student: "Ananya Verma",
        activity: "Weekly Team Call",
        points: 10,
        status: "Pending",
        date: "05 Oct 2026"
    }

];


/* =====================================================
   ADMIN AUTH
===================================================== */

const adminAuth =
    document.getElementById("adminAuth");

const adminPortal =
    document.getElementById("adminPortal");

const loginTab =
    document.getElementById("loginTab");

const signupTab =
    document.getElementById("signupTab");

const loginForm =
    document.getElementById("adminLoginForm");

const signupForm =
    document.getElementById("adminSignupForm");

const authHeading =
    document.getElementById("authHeading");

const authSubtitle =
    document.getElementById("authSubtitle");

const authMessage =
    document.getElementById("authMessage");


/* =====================================================
   LOGIN / SIGNUP TABS
===================================================== */

loginTab.addEventListener("click", () => {

    loginTab.classList.add("active");

    signupTab.classList.remove("active");

    loginForm.classList.remove("hidden");

    signupForm.classList.add("hidden");

    authHeading.textContent =
        "Welcome back";

    authSubtitle.textContent =
        "Sign in to manage the Campus Ambassador program.";

    authMessage.textContent = "";

});


signupTab.addEventListener("click", () => {

    signupTab.classList.add("active");

    loginTab.classList.remove("active");

    signupForm.classList.remove("hidden");

    loginForm.classList.add("hidden");

    authHeading.textContent =
        "Create admin account";

    authSubtitle.textContent =
        "Set up your administrator access.";

    authMessage.textContent = "";

});


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const email =
            document.getElementById(
                "adminLoginEmail"
            ).value.trim();

        const password =
            document.getElementById(
                "adminLoginPassword"
            ).value.trim();


        if (!email || !password) {

            authMessage.textContent =
                "Please enter your email and password.";

            return;
        }


        /*
           TEMPORARY FRONTEND LOGIN.

           Later:

           POST /admin/login

           FastAPI will verify:
           email
           password
           role = admin
        */

        localStorage.setItem(
            "talerangAdminLoggedIn",
            "true"
        );

        showPortal();

    }
);


/* =====================================================
   SIGN UP
===================================================== */

signupForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /*
           IMPORTANT:

           This is only frontend UI for now.

           In the real application,
           admin account creation should
           be protected by the backend.

           Normal students must NEVER be
           allowed to create admin accounts.
        */

        authMessage.textContent =
            "Admin account request created. Backend authorization will be added next.";

    }
);


/* =====================================================
   SHOW PORTAL
===================================================== */

function showPortal() {

    adminAuth.classList.add("hidden");

    adminPortal.classList.remove("hidden");

    loadDashboard();

}


/* =====================================================
   LOGOUT
===================================================== */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "talerangAdminLoggedIn"
            );

            adminPortal.classList.add("hidden");

            adminAuth.classList.remove("hidden");

        }
    );


/* =====================================================
   NAVIGATION
===================================================== */

const navItems =
    document.querySelectorAll(
        ".admin-nav-item"
    );

const pages =
    document.querySelectorAll(
        ".admin-page"
    );

const pageTitle =
    document.getElementById(
        "pageTitle"
    );


navItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                openPage(
                    item.dataset.page
                );

            }
        );

    }
);


function openPage(page) {

    navItems.forEach(
        function (item) {

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

        }
    );


    pages.forEach(
        pageElement => {

            pageElement.classList.remove(
                "active"
            );

        }
    );


    const selected =
        document.getElementById(
            page + "Page"
        );


    if (selected) {

        selected.classList.add(
            "active"
        );

    }


    const titles = {

        dashboard: "Dashboard",

        students:
            "Student Information",

        tasks:
            "Student Tasks",

        rankings:
            "Rankings",

        announcements:
            "Announcements"

    };


    pageTitle.textContent =
        titles[page];


    if (page === "dashboard")
        loadDashboard();

    if (page === "students")
        loadStudents();

    if (page === "tasks")
        loadTasks();

    if (page === "rankings")
        loadRankings();

}


/* =====================================================
   DASHBOARD
===================================================== */

function loadDashboard() {

    const totalStudents =
        students.length;


    const totalActivities =
        studentTasks.filter(
            task =>
                task.status === "Approved"
        ).length;


    const presidents =
        students.filter(
            student =>
                student.points >= 300
        ).length;


    const totalPoints =
        students.reduce(
            (sum, student) =>
                sum + student.points,
            0
        );


    document.getElementById(
        "totalStudents"
    ).textContent =
        totalStudents;


    document.getElementById(
        "totalActivities"
    ).textContent =
        totalActivities;


    document.getElementById(
        "chapterPresidents"
    ).textContent =
        presidents;


    document.getElementById(
        "totalPoints"
    ).textContent =
        totalPoints;


    loadTopStudents();

    loadRecentActivity();

    loadLeadershipProgress();

}


/* =====================================================
   TOP STUDENTS
===================================================== */

function loadTopStudents() {

    const container =
        document.getElementById(
            "topStudents"
        );


    const sorted =
        [...students]
            .sort(
                (a, b) =>
                    b.points - a.points
            )
            .slice(0, 4);


    container.innerHTML = "";


    sorted.forEach(
        function (student, index) {

            container.innerHTML += `

                <div class="top-student">

                    <div class="student-rank">
                        #${index + 1}
                    </div>

                    <div class="student-avatar">
                        ${initials(student.name)}
                    </div>

                    <div class="student-name">

                        <strong>
                            ${student.name}
                        </strong>

                        <span>
                            ${student.college}
                        </span>

                    </div>

                    <div class="student-points">
                        ${student.points} pts
                    </div>

                </div>

            `;

        }
    );

}


/* =====================================================
   LEADERSHIP PROGRESS
===================================================== */

function loadLeadershipProgress() {

    const presidents =
        students.filter(
            student =>
                student.points >= 300
        ).length;


    const percentage =
        students.length
            ? Math.round(
                presidents /
                students.length *
                100
            )
            : 0;


    document.getElementById(
        "presidentPercentage"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "presidentProgress"
    ).style.width =
        percentage + "%";

}


/* =====================================================
   RECENT ACTIVITY
===================================================== */

function loadRecentActivity() {

    const container =
        document.getElementById(
            "recentActivity"
        );


    container.innerHTML = "";


    studentTasks
        .slice()
        .reverse()
        .slice(0, 4)
        .forEach(
            function (task) {

                container.innerHTML += `

                    <div class="activity-row">

                        <div class="activity-dot"></div>

                        <div class="activity-info">

                            <strong>
                                ${task.student}
                            </strong>

                            <span>
                                ${task.activity}
                                ·
                                ${task.status}
                            </span>

                        </div>

                        <div class="activity-points">
                            ${task.points} pts
                        </div>

                    </div>

                `;

            }
        );

}


/* =====================================================
   STUDENTS
===================================================== */

function loadStudents() {

    const table =
        document.getElementById(
            "studentsTable"
        );


    table.innerHTML = "";


    const sorted =
        [...students]
            .sort(
                (a, b) =>
                    b.points - a.points
            );


    sorted.forEach(
        function (student, index) {

            const positionClass =
                student.points >= 300
                    ? "position president"
                    : "position";


            table.innerHTML += `

                <tr>

                    <td>

                        <div class="student-cell">

                            <div class="table-avatar">
                                ${initials(student.name)}
                            </div>

                            <strong>
                                ${student.name}
                            </strong>

                        </div>

                    </td>


                    <td>
                        ${student.college}
                    </td>


                    <td>

                        <span class="${positionClass}">
                            ${student.position}
                        </span>

                    </td>


                    <td class="points">
                        ${student.points}
                    </td>


                    <td>
                        #${index + 1}
                    </td>


                    <td>

                        <a
                            href="${student.linkedin}"
                            target="_blank"
                            class="linkedin"
                        >
                            LinkedIn ↗
                        </a>

                    </td>


                    <td>

                        <button
                            class="view-button"
                            onclick="viewStudent(${student.id})"
                        >
                            View
                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


/* =====================================================
   STUDENT SEARCH
===================================================== */

document
    .getElementById("studentSearch")
    .addEventListener(
        "input",
        function () {

            const value =
                this.value
                    .toLowerCase()
                    .trim();


            document
                .querySelectorAll(
                    "#studentsTable tr"
                )
                .forEach(
                    row => {

                        row.style.display =
                            row.textContent
                                .toLowerCase()
                                .includes(value)
                                ? ""
                                : "none";

                    }
                );

        }
    );


/* =====================================================
   VIEW STUDENT
===================================================== */

function viewStudent(id) {

    const student =
        students.find(
            item =>
                item.id === id
        );


    if (!student) return;


    alert(

        "STUDENT PROFILE\n\n" +

        "Name: " +
        student.name +

        "\nEmail: " +
        student.email +

        "\nMobile: " +
        student.mobile +

        "\nCollege: " +
        student.college +

        "\nPosition: " +
        student.position +

        "\nPoints: " +
        student.points +

        "\nTasks Completed: " +
        student.tasks +

        "\nLinkedIn: " +
        student.linkedin

    );

}


/* =====================================================
   TASKS
===================================================== */

function loadTasks() {

    const table =
        document.getElementById(
            "tasksTable"
        );


    table.innerHTML = "";


    const pending =
        studentTasks.filter(
            task =>
                task.status === "Pending"
        ).length;


    const approved =
        studentTasks.filter(
            task =>
                task.status === "Approved"
        ).length;


    const rejected =
        studentTasks.filter(
            task =>
                task.status === "Rejected"
        ).length;


    document.getElementById(
        "pendingTasks"
    ).textContent =
        pending;


    document.getElementById(
        "approvedTasks"
    ).textContent =
        approved;


    document.getElementById(
        "rejectedTasks"
    ).textContent =
        rejected;


    studentTasks.forEach(
        function (task) {

            const statusClass =
                task.status.toLowerCase();


            let action = "";


            if (
                task.status === "Pending"
            ) {

                action = `

                    <div class="task-action">

                        <button
                            class="approve-button"
                            onclick="approveTask(${task.id})"
                        >
                            Approve
                        </button>

                        <button
                            class="reject-button"
                            onclick="rejectTask(${task.id})"
                        >
                            Reject
                        </button>

                    </div>

                `;

            } else {

                action = "-";

            }


            table.innerHTML += `

                <tr>

                    <td>
                        ${task.student}
                    </td>

                    <td>
                        ${task.activity}
                    </td>

                    <td class="points">
                        ${task.points}
                    </td>

                    <td>

                        <span class="status ${statusClass}">
                            ${task.status}
                        </span>

                    </td>

                    <td>
                        ${task.date}
                    </td>

                    <td>
                        ${action}
                    </td>

                </tr>

            `;

        }
    );

}


/* =====================================================
   APPROVE TASK
===================================================== */

function approveTask(id) {

    const task =
        studentTasks.find(
            item =>
                item.id === id
        );


    if (!task) return;


    task.status = "Approved";


    const student =
        students.find(
            item =>
                item.name === task.student
        );


    if (student) {

        student.points +=
            task.points;

        student.tasks += 1;


        if (student.points >= 300) {

            student.position =
                "Chapter President";

        }

    }


    loadTasks();

    loadDashboard();

}


/* =====================================================
   REJECT TASK
===================================================== */

function rejectTask(id) {

    const task =
        studentTasks.find(
            item =>
                item.id === id
        );


    if (!task) return;


    task.status = "Rejected";


    loadTasks();

}


/* =====================================================
   RANKINGS
===================================================== */

function loadRankings() {

    const table =
        document.getElementById(
            "rankingTable"
        );


    table.innerHTML = "";


    const sorted =
        [...students]
            .sort(
                (a, b) =>
                    b.points - a.points
            );


    sorted.forEach(
        function (student, index) {

            const progress =
                Math.min(
                    student.points /
                    300 *
                    100,
                    100
                );


            table.innerHTML += `

                <tr>

                    <td class="rank-number">
                        #${index + 1}
                    </td>

                    <td>
                        ${student.name}
                    </td>

                    <td>
                        ${student.college}
                    </td>

                    <td>

                        <span class="${
                            student.points >= 300
                                ? "position president"
                                : "position"
                        }">

                            ${student.position}

                        </span>

                    </td>

                    <td class="points">
                        ${student.points} pts
                    </td>

                    <td>

                        <div class="rank-progress">

                            <div
                                class="rank-progress-fill"
                                style="
                                    width:${progress}%
                                "
                            ></div>

                        </div>

                    </td>

                </tr>

            `;

        }
    );

}


/* =====================================================
   ANNOUNCEMENT
===================================================== */

document
    .getElementById("announcementForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const title =
                document.getElementById(
                    "announcementTitle"
                ).value.trim();


            const description =
                document.getElementById(
                    "announcementDescription"
                ).value.trim();


            const whatsapp =
                document.getElementById(
                    "announcementWhatsapp"
                ).value.trim();


            const announcement = {

                title,
                description,
                whatsapp

            };


            localStorage.setItem(
                "talerangAnnouncement",
                JSON.stringify(
                    announcement
                )
            );


            displayAnnouncement(
                announcement
            );


            this.reset();

        }
    );


/* =====================================================
   DISPLAY ANNOUNCEMENT
===================================================== */

function displayAnnouncement(
    announcement
) {

    const preview =
        document.getElementById(
            "announcementPreview"
        );


    preview.innerHTML = `

        <span class="announcement-tag">
            ANNOUNCEMENT
        </span>

        <h3>
            ${announcement.title}
        </h3>

        <p>
            ${announcement.description}
        </p>

        ${
            announcement.whatsapp
                ? `
                    <a
                        href="${announcement.whatsapp}"
                        target="_blank"
                        class="whatsapp-link"
                    >
                        Join WhatsApp ↗
                    </a>
                `
                : ""
        }

    `;

}


/* =====================================================
   LOAD SAVED ANNOUNCEMENT
===================================================== */

const savedAnnouncement =
    localStorage.getItem(
        "talerangAnnouncement"
    );


if (savedAnnouncement) {

    displayAnnouncement(
        JSON.parse(savedAnnouncement)
    );

}


/* =====================================================
   DASHBOARD QUICK LINK
===================================================== */

document
    .querySelectorAll("[data-open]")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    openPage(
                        button.dataset.open
                    );

                }
            );

        }
    );


/* =====================================================
   HELPERS
===================================================== */

function initials(name) {

    return name
        .split(" ")
        .map(
            word =>
                word.charAt(0)
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


/* =====================================================
   AUTO LOGIN - DEMO ONLY
===================================================== */

if (
    localStorage.getItem(
        "talerangAdminLoggedIn"
    ) === "true"
) {

    showPortal();

}