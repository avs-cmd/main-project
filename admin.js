/* TALERANG ADMIN PORTAL - DEMO DATA. For real multi-user operation, connect to FastAPI/PostgreSQL. */
const students = [
 {id:1,name:"Avni Agarwal",email:"avni@example.com",mobile:"9876543210",college:"ABC College",points:110,position:"Campus Ambassador",linkedin:"https://linkedin.com/",tasks:2},
 {id:2,name:"Rahul Sharma",email:"rahul@example.com",mobile:"9876543211",college:"Delhi University",points:340,position:"Chapter President",linkedin:"https://linkedin.com/",tasks:5},
 {id:3,name:"Priya Singh",email:"priya@example.com",mobile:"9876543212",college:"Amity University",points:260,position:"Campus Ambassador",linkedin:"https://linkedin.com/",tasks:4},
 {id:4,name:"Ananya Verma",email:"ananya@example.com",mobile:"9876543213",college:"Christ University",points:190,position:"Campus Ambassador",linkedin:"https://linkedin.com/",tasks:3}
];
let studentTasks = [
 {id:1,student:"Avni Agarwal",activity:"Refer a Student",points:80,status:"Approved",date:"05 Oct 2026"},
 {id:2,student:"Avni Agarwal",activity:"Distribute Talerang Material",points:30,status:"Approved",date:"04 Oct 2026"},
 {id:3,student:"Priya Singh",activity:"Social Media Post",points:50,status:"Pending",date:"05 Oct 2026"},
 {id:4,student:"Rahul Sharma",activity:"Host a Workshop",points:100,status:"Approved",date:"03 Oct 2026"},
 {id:5,student:"Ananya Verma",activity:"Weekly Team Call",points:10,status:"Pending",date:"05 Oct 2026"}
];

const $ = id => document.getElementById(id);
const adminAuth=$("adminAuth"), adminPortal=$("adminPortal"), loginTab=$("loginTab"), signupTab=$("signupTab");
const loginForm=$("adminLoginForm"), signupForm=$("adminSignupForm"), authHeading=$("authHeading"), authSubtitle=$("authSubtitle"), authMessage=$("authMessage");

loginTab.addEventListener("click",()=>{loginTab.classList.add("active");signupTab.classList.remove("active");loginForm.classList.remove("hidden");signupForm.classList.add("hidden");authHeading.textContent="Welcome back";authSubtitle.textContent="Sign in to manage the Campus Ambassador program.";authMessage.textContent="";});
signupTab.addEventListener("click",()=>{signupTab.classList.add("active");loginTab.classList.remove("active");signupForm.classList.remove("hidden");loginForm.classList.add("hidden");authHeading.textContent="Create admin account";authSubtitle.textContent="Set up your administrator access.";authMessage.textContent="";});
loginForm.addEventListener("submit",event=>{event.preventDefault();const email=$("adminLoginEmail").value.trim(),password=$("adminLoginPassword").value.trim();if(!email||!password){authMessage.textContent="Please enter your email and password.";return;}localStorage.setItem("talerangAdminLoggedIn","true");showPortal();});
signupForm.addEventListener("submit",event=>{event.preventDefault();authMessage.textContent="Admin account request created. Backend authorization will be added next.";});
function showPortal(){adminAuth.classList.add("hidden");adminPortal.classList.remove("hidden");loadDashboard();loadStudents();loadTasks();loadRankings();loadRewards();}
$("logoutBtn").addEventListener("click",()=>{localStorage.removeItem("talerangAdminLoggedIn");adminPortal.classList.add("hidden");adminAuth.classList.remove("hidden");});

const navItems=document.querySelectorAll(".admin-nav-item"), pages=document.querySelectorAll(".admin-page"), pageTitle=$("pageTitle");
navItems.forEach(item=>item.addEventListener("click",()=>openPage(item.dataset.page)));
function openPage(page){
 navItems.forEach(item=>item.classList.toggle("active",item.dataset.page===page));
 pages.forEach(el=>el.classList.remove("active"));
 const selected=$(page+"Page");if(selected)selected.classList.add("active");
 const titles={dashboard:"Dashboard",students:"Student Information",tasks:"Student Tasks",rankings:"Rankings",rewards:"Rewards Management",announcements:"Announcements"};
 pageTitle.textContent=titles[page]||"Dashboard";
 if(page==="dashboard")loadDashboard();if(page==="students")loadStudents();if(page==="tasks")loadTasks();if(page==="rankings")loadRankings();if(page==="rewards")loadRewards();
}
function loadDashboard(){
 $("totalStudents").textContent=students.length;
 $("totalActivities").textContent=studentTasks.filter(t=>t.status==="Approved").length;
 $("chapterPresidents").textContent=students.filter(s=>s.points>=300).length;
 loadTopStudents();loadRecentActivity();loadLeadershipProgress();
}
function loadTopStudents(){
 $("topStudents").innerHTML=[...students].sort((a,b)=>b.points-a.points).slice(0,4).map((s,i)=>`<div class="top-student"><div class="student-rank">#${i+1}</div><div class="student-avatar">${initials(s.name)}</div><div class="student-name"><strong>${escapeHTML(s.name)}</strong><span>${escapeHTML(s.college)}</span></div><div class="student-points">${s.points} pts</div></div>`).join("");
}
function loadLeadershipProgress(){const count=students.filter(s=>s.points>=300).length,percent=students.length?Math.round(count/students.length*100):0;$("presidentPercentage").textContent=percent+"%";$("presidentProgress").style.width=percent+"%";}
function loadRecentActivity(){$("recentActivity").innerHTML=studentTasks.slice().reverse().slice(0,4).map(t=>`<div class="activity-row"><div class="activity-dot"></div><div class="activity-info"><strong>${escapeHTML(t.student)}</strong><span>${escapeHTML(t.activity)} · ${escapeHTML(t.status)}</span></div><div class="activity-points">${t.points} pts</div></div>`).join("");}
function loadStudents(){
 $("studentsTable").innerHTML=[...students].sort((a,b)=>b.points-a.points).map((s,i)=>`<tr><td><div class="student-cell"><div class="table-avatar">${initials(s.name)}</div><strong>${escapeHTML(s.name)}</strong></div></td><td>${escapeHTML(s.college)}</td><td><span class="${s.points>=300?"position president":"position"}">${escapeHTML(s.position)}</span></td><td class="points">${s.points}</td><td>#${i+1}</td><td><a href="${safeURL(s.linkedin)}" target="_blank" rel="noopener noreferrer" class="linkedin">LinkedIn ↗</a></td><td><button class="view-button" onclick="viewStudent(${s.id})">View</button></td></tr>`).join("");
 filterStudents();
}
$("studentSearch").addEventListener("input",filterStudents);
function filterStudents(){const value=$("studentSearch").value.toLowerCase().trim();document.querySelectorAll("#studentsTable tr").forEach(row=>row.style.display=row.textContent.toLowerCase().includes(value)?"":"none");}
function viewStudent(id){const s=students.find(x=>x.id===id);if(!s)return;alert("STUDENT PROFILE\n\nName: "+s.name+"\nEmail: "+s.email+"\nMobile: "+s.mobile+"\nCollege: "+s.college+"\nPosition: "+s.position+"\nPoints: "+s.points+"\nTasks Completed: "+s.tasks+"\nLinkedIn: "+s.linkedin);}
function loadTasks(){
 $("pendingTasks").textContent=studentTasks.filter(t=>t.status==="Pending").length;$("approvedTasks").textContent=studentTasks.filter(t=>t.status==="Approved").length;$("rejectedTasks").textContent=studentTasks.filter(t=>t.status==="Rejected").length;
 $("tasksTable").innerHTML=studentTasks.map(t=>`<tr><td>${escapeHTML(t.student)}</td><td>${escapeHTML(t.activity)}</td><td class="points">${t.points}</td><td><span class="status ${t.status.toLowerCase()}">${t.status}</span></td><td>${escapeHTML(t.date)}</td><td>${t.status==="Pending"?`<div class="task-action"><button class="approve-button" onclick="approveTask(${t.id})">Approve</button><button class="reject-button" onclick="rejectTask(${t.id})">Reject</button></div>`:"-"}</td></tr>`).join("");
}
function approveTask(id){const t=studentTasks.find(x=>x.id===id);if(!t||t.status!=="Pending")return;t.status="Approved";const s=students.find(x=>x.name===t.student);if(s){s.points+=t.points;s.tasks+=1;refreshPosition(s);addNotification(s.email,"Task approved",`Your activity “${t.activity}” was approved and ${t.points} points were added.`);}loadTasks();loadDashboard();loadStudents();loadRankings();loadRewards();}
function rejectTask(id){const t=studentTasks.find(x=>x.id===id);if(!t||t.status!=="Pending")return;t.status="Rejected";const s=students.find(x=>x.name===t.student);if(s)addNotification(s.email,"Task update",`Your activity “${t.activity}” was rejected.`);loadTasks();loadDashboard();}
function loadRankings(){$("rankingTable").innerHTML=[...students].sort((a,b)=>b.points-a.points).map((s,i)=>{const progress=Math.min(s.points/300*100,100);return `<tr><td class="rank-number">#${i+1}</td><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.college)}</td><td><span class="${s.points>=300?"position president":"position"}">${escapeHTML(s.position)}</span></td><td class="points">${s.points} pts</td><td><div class="rank-progress"><div class="rank-progress-fill" style="width:${progress}%"></div></div></td></tr>`;}).join("");}
$("announcementForm").addEventListener("submit",event=>{event.preventDefault();const announcement={title:$("announcementTitle").value.trim(),description:$("announcementDescription").value.trim(),whatsapp:$("announcementWhatsapp").value.trim()};localStorage.setItem("talerangAnnouncement",JSON.stringify(announcement));displayAnnouncement(announcement);students.forEach(s=>addNotification(s.email,"New announcement",announcement.title+": "+announcement.description));event.target.reset();});
function displayAnnouncement(a){const preview=$("announcementPreview");preview.innerHTML=`<span class="announcement-tag">ANNOUNCEMENT</span><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.description)}</p>${a.whatsapp?`<a href="${safeURL(a.whatsapp)}" target="_blank" rel="noopener noreferrer" class="whatsapp-link">Join WhatsApp ↗</a>`:""}`;}
const savedAnnouncement=localStorage.getItem("talerangAnnouncement");if(savedAnnouncement){try{displayAnnouncement(JSON.parse(savedAnnouncement));}catch(e){localStorage.removeItem("talerangAnnouncement");}}
document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>openPage(button.dataset.open)));

/* REWARDS MANAGEMENT (DEMO / LOCAL BROWSER STORAGE) */
const REWARD_REQUESTS_KEY="talerangAdminRewardRequestsDemo";
const REWARD_NOTIFICATIONS_KEY="talerangAdminNotificationsDemo";
const BROCHURE_KEY="talerangAdminBrochureAllocationDemo";
const BROCHURE_INVENTORY_KEY="talerangAdminBrochureInventoryDemo";
const REWARD_CATALOG=[
 {id:"voucher500",name:"₹500 Voucher",points:1000},
 {id:"streaming",name:"Streaming Subscription",points:1500}
];
function readJSON(key,fallback){try{const parsed=JSON.parse(localStorage.getItem(key));return parsed??fallback;}catch(e){return fallback;}}
let rewardRequests=readJSON(REWARD_REQUESTS_KEY,[
 {id:1,studentId:1,reward:"₹500 Voucher",pointsRequired:1000,status:"Pending",voucher:""},
 {id:2,studentId:2,reward:"Streaming Subscription",pointsRequired:1500,status:"Pending",voucher:""}
]);
let brochureAllocations=readJSON(BROCHURE_KEY,{});
// Convert earlier demo allocations to the current per-brochure list format.
Object.keys(brochureAllocations).forEach(id=>{if(!Array.isArray(brochureAllocations[id]))brochureAllocations[id]=[];});
let brochureInventory=readJSON(BROCHURE_INVENTORY_KEY,[]);
let adminNotifications=readJSON(REWARD_NOTIFICATIONS_KEY,[]);
function saveRewards(){localStorage.setItem(REWARD_REQUESTS_KEY,JSON.stringify(rewardRequests));localStorage.setItem(BROCHURE_KEY,JSON.stringify(brochureAllocations));localStorage.setItem(BROCHURE_INVENTORY_KEY,JSON.stringify(brochureInventory));localStorage.setItem(REWARD_NOTIFICATIONS_KEY,JSON.stringify(adminNotifications));}
function rewardStudentById(id){return students.find(s=>s.id===Number(id));}
function eligibilityFor(s){return REWARD_CATALOG.filter(r=>s.points>=r.points).map(r=>r.name);}
function assignedForStudent(studentId){return brochureAllocations[studentId]||[];}
function inventoryAssignedCount(inventoryId){return Object.values(brochureAllocations).flat().filter(a=>a.inventoryId===Number(inventoryId)).reduce((sum,a)=>sum+(Number(a.quantity)||0),0);}
function inventoryAvailable(item){return Math.max(0,(Number(item.quantity)||0)-inventoryAssignedCount(item.id));}
$("brochureInventoryForm").addEventListener("submit",event=>{
 event.preventDefault();
 const name=$("brochureName").value.trim(),code=$("brochureCode").value.trim().toUpperCase(),quantity=Number($("brochureQuantity").value);
 if(!name||!code||!Number.isInteger(quantity)||quantity<1){alert("Enter a brochure name, unique code and a whole quantity greater than zero.");return;}
 if(brochureInventory.some(item=>item.code.toLowerCase()===code.toLowerCase())){alert("This brochure code already exists. Use a unique code to prevent duplicate inventory entries.");return;}
 brochureInventory.push({id:Date.now(),name,code,quantity,createdAt:new Date().toLocaleDateString()});saveRewards();event.target.reset();loadRewards();
});
function loadRewards(){
 $("rewardPendingCount").textContent=rewardRequests.filter(r=>r.status==="Pending").length;
 $("rewardApprovedCount").textContent=rewardRequests.filter(r=>r.status==="Approved").length;
 $("brochureAllocatedCount").textContent=Object.values(brochureAllocations).flat().reduce((sum,a)=>sum+(Number(a.quantity)||0),0);
 $("voucherIssuedCount").textContent=rewardRequests.filter(r=>r.status==="Issued").length;
 $("brochureInventoryTable").innerHTML=brochureInventory.map(item=>`<tr><td>${escapeHTML(item.name)}</td><td><span class="reward-pill issued">${escapeHTML(item.code)}</span></td><td>${Number(item.quantity)||0}</td><td>${inventoryAssignedCount(item.id)}</td><td><strong class="${inventoryAvailable(item)===0?"stock-empty":"stock-available"}">${inventoryAvailable(item)}</strong></td></tr>`).join("")||`<tr><td colspan="5" class="empty-state">No brochures added yet. Add a brochure name, code and stock above.</td></tr>`;
 $("rewardStudentsTable").innerHTML=students.map(s=>{
  const eligible=eligibilityFor(s),allocations=assignedForStudent(s.id);
  const assignedLabel=allocations.length?allocations.map(a=>{const item=brochureInventory.find(i=>i.id===a.inventoryId);return `${item?escapeHTML(item.name):"Brochure"} (${item?escapeHTML(item.code):"code unavailable"}) × ${Number(a.quantity)||0}`;}).join("<br>"):`<span class="reward-pill not-eligible">None assigned</span>`;
  const options=brochureInventory.filter(item=>inventoryAvailable(item)>0&&!allocations.some(a=>a.inventoryId===item.id)).map(item=>`<option value="${item.id}">${escapeHTML(item.name)} · ${escapeHTML(item.code)} · ${inventoryAvailable(item)} available</option>`).join("");
  return `<tr><td><div class="student-cell"><div class="table-avatar">${initials(s.name)}</div><strong>${escapeHTML(s.name)}</strong></div></td><td>${escapeHTML(s.email)}</td><td class="points">${s.points} pts</td><td>${eligible.length?`<span class="reward-pill eligible">${eligible.join(", ")}</span>`:`<span class="reward-pill not-eligible">Not yet eligible</span>`}</td><td>${assignedLabel}</td><td>${options?`<div class="brochure-assign-controls"><select id="brochure-select-${s.id}" aria-label="Brochure for ${escapeHTML(s.name)}"><option value="">Select brochure</option>${options}</select><input id="brochure-qty-${s.id}" type="number" min="1" step="1" value="1" aria-label="Quantity for ${escapeHTML(s.name)}"><button class="mini-button primary" onclick="assignBrochure(${s.id})">Assign</button></div>`:`<span class="empty-state">${brochureInventory.length?"No available new brochure codes":"Add inventory first"}</span>`}</td></tr>`;
 }).join("");
 $("rewardRequestsTable").innerHTML=rewardRequests.map(r=>{
  const s=rewardStudentById(r.studentId),statusClass=r.status.toLowerCase();
  return `<tr><td>${s?escapeHTML(s.name):"Unknown student"}</td><td>${escapeHTML(r.reward)}</td><td>${Number(r.pointsRequired)||0} pts</td><td><span class="status ${statusClass==="issued"?"approved":statusClass}">${escapeHTML(r.status)}</span></td><td>${r.voucher?escapeHTML(r.voucher):"—"}</td><td>${r.status==="Pending"?`<div class="button-row"><button class="mini-button success" onclick="decideReward(${r.id},'Approved')">Approve</button><button class="mini-button danger" onclick="decideReward(${r.id},'Rejected')">Reject</button></div>`:r.status==="Approved"?`<div class="button-row"><input class="voucher-input" id="voucher-${r.id}" placeholder="Voucher / code"><button class="mini-button primary" onclick="issueVoucher(${r.id})">Issue reward</button></div>`:"—"}</td></tr>`;
 }).join("")||`<tr><td colspan="6" class="empty-state">No reward requests.</td></tr>`;
 renderAdminNotifications();
}
function assignBrochure(studentId){
 const s=rewardStudentById(studentId);if(!s)return;
 const selectedId=Number($(`brochure-select-${studentId}`).value),quantity=Number($(`brochure-qty-${studentId}`).value);
 const item=brochureInventory.find(i=>i.id===selectedId);if(!item){alert("Select a brochure first.");return;}
 if(!Number.isInteger(quantity)||quantity<1){alert("Enter a whole number greater than zero.");return;}
 const allocations=assignedForStudent(studentId);
 if(allocations.some(a=>a.inventoryId===item.id)){alert(`The brochure code ${item.code} is already assigned to ${s.name}. Duplicate assignment is blocked.`);return;}
 if(quantity>inventoryAvailable(item)){alert(`Only ${inventoryAvailable(item)} brochure(s) remain for ${item.name} (${item.code}).`);return;}
 allocations.push({inventoryId:item.id,quantity,date:new Date().toLocaleDateString()});brochureAllocations[studentId]=allocations;
 addNotification(s.email,"Brochures allocated",`${quantity} copy/copies of “${item.name}” (code ${item.code}) have been allocated to you.`);saveRewards();loadRewards();
}
function decideReward(requestId,decision){
 const request=rewardRequests.find(r=>r.id===requestId);if(!request||request.status!=="Pending")return;
 const s=rewardStudentById(request.studentId);if(!s)return;
 if(decision==="Approved"&&s.points<request.pointsRequired){alert(`${s.name} does not currently have enough points for this reward.`);return;}
 request.status=decision;
 addNotification(s.email,decision==="Approved"?"Reward request approved":"Reward request rejected",decision==="Approved"?`Your request for ${request.reward} has been approved. The administrator will record the voucher details when it is issued.`:`Your request for ${request.reward} was not approved. Please contact the program administrator if you need clarification.`);
 saveRewards();loadRewards();
}
function issueVoucher(requestId){
 const request=rewardRequests.find(r=>r.id===requestId);if(!request||request.status!=="Approved")return;
 const input=$(`voucher-${requestId}`);const voucher=input?input.value.trim():"";
 if(!voucher){alert("Enter a voucher code or reward fulfilment detail before issuing.");return;}
 const s=rewardStudentById(request.studentId);request.status="Issued";request.voucher=voucher;request.issuedAt=new Date().toLocaleString();
 if(s)addNotification(s.email,"Reward issued",`Your ${request.reward} has been issued. Details: ${voucher}`);
 saveRewards();loadRewards();
}
function addNotification(email,title,message){
 adminNotifications.unshift({id:Date.now()+Math.random(),email,title,message,date:new Date().toLocaleString()});
 adminNotifications=adminNotifications.slice(0,100);saveRewards();
}
function renderAdminNotifications(){
 $("adminNotificationList").innerHTML=adminNotifications.slice(0,10).map(n=>`<div class="admin-notification"><strong>${escapeHTML(n.title)} · ${escapeHTML(n.email)}</strong><p>${escapeHTML(n.message)}</p><time>${escapeHTML(n.date)}</time></div>`).join("")||`<p class="empty-state">No notifications yet. Approve a task, allocate brochures or update a reward request to create one.</p>`;
}
function refreshPosition(s){s.position=s.points>=300?"Chapter President":"Campus Ambassador";}
function initials(name){return String(name||"").split(" ").map(word=>word.charAt(0)).join("").substring(0,2).toUpperCase();}
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
function safeURL(value){try{const url=new URL(value,window.location.href);return ["http:","https:"].includes(url.protocol)?url.href:"#";}catch(e){return "#";}}
if(localStorage.getItem("talerangAdminLoggedIn")==="true")showPortal();
