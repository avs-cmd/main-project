/* =====================================================
   TALERANG CAMPUS AMBASSADOR
===================================================== */

const POINT_TARGET = 300;


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

    if (points >= 600) {
        return "City Chapter President";
    }

    if (points >= 300) {
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

    openPage("home");

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
   TASKS
===================================================== */

document
    .querySelectorAll(".task-button")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const points =
                    Number(
                        button.dataset.points
                    );

                const task =
                    button.dataset.task;


                user.points += points;

                saveUser();

                updatePortal();


                button.textContent =
                    "Completed";

                button.disabled = true;

                button.style.opacity =
                    "0.55";


                showToast(
                    `${task} completed · +${points} points`
                );

            }
        );

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