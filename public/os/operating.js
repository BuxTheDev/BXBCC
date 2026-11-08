/* Cozii & Valley of Grace operating picture.
   Static Nov 7, 2026 snapshot for the two primary fronts.
   Selector rules match src/operating/cozii-vog.ts. Checks stay in this browser only.
*/
const operatingStatusOrder = ["Documented", "Owner-confirmed", "Proposed", "Unresolved"];
let operatingView = "overview";
let operatingQuery = "";
let operatingPriority = "all";
let operatingPhase = "all";
let operatingDocType = "all";
let operatingFilterView = "";

function statusLabels(status) {
  const text = String(status || "").toLowerCase();
  return operatingStatusOrder.filter((label) => text.includes(label.toLowerCase()));
}
function listings(snapshot = coziiVog) {
  return snapshot.properties.filter((property) => property.group === "listing");
}
function signedPolicies(snapshot = coziiVog) {
  return snapshot.library.filter((policy) => {
    const status = policy.status.toLowerCase();
    const claimsAdoption = status.includes("signed") || status.includes("adopted");
    const stillDraft = status.includes("unsigned") || status.includes("not adopted") || status.includes("blank") || status.includes("draft");
    return claimsAdoption && !stillDraft;
  });
}
function pendingDecisions(snapshot = coziiVog) {
  return snapshot.decisions.filter((decision) => {
    const labels = statusLabels(decision.status);
    return labels.includes("Unresolved") || labels.includes("Proposed") || !labels.includes("Owner-confirmed");
  });
}
function nextBoardActions(limit = 3, snapshot = coziiVog) {
  return snapshot.tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => a.task.date.localeCompare(b.task.date) || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.task);
}
function operatingFrontKind(front) {
  if (!front) return "";
  const blob = `${front.name || ""} ${front.entity || ""}`.toLowerCase();
  if (blob.includes("valley of grace")) return "vog";
  if (blob.includes("cozii")) return "cozii";
  return "";
}
function operatingChecks() {
  try { return JSON.parse(localStorage.getItem("bxb-operating-checks-v1")) || {}; }
  catch { return {}; }
}
function setOperatingCheck(id, on) {
  const checks = operatingChecks();
  if (on) checks[id] = true;
  else delete checks[id];
  try { localStorage.setItem("bxb-operating-checks-v1", JSON.stringify(checks)); } catch { /* this session only */ }
}
function operatingChips(status) {
  const classFor = { Documented: "status-documented", "Owner-confirmed": "status-owner", Proposed: "status-proposed", Unresolved: "status-unresolved" };
  const chips = statusLabels(status).map((label) => `<span class="chip ${classFor[label]}">${esc(label)}</span>`).join("");
  const extra = String(status).replace(/documented|owner-confirmed|proposed|unresolved/gi, " ").replace(/[·/,|]/g, " ").replace(/\s+/g, " ").trim();
  const raw = extra ? `<span class="operating-status-raw">${esc(status)}</span>` : "";
  return `<span class="operating-chips">${chips}${raw}</span>`;
}
function operatingEntity(id) {
  return coziiVog.entities.find((entity) => entity.id === id);
}
function resetOperatingFilters() {
  if (operatingFilterView === operatingView) return;
  operatingQuery = "";
  operatingPriority = "all";
  operatingPhase = "all";
  operatingDocType = "all";
  operatingFilterView = operatingView;
}
function operatingSections() {
  return `<div class="segmented operating-sections" role="tablist" aria-label="Cozii and Valley of Grace sections">${coziiVog.sections.map((section) => `<button type="button" role="tab" data-operating-view="${esc(section.id)}" class="${operatingView === section.id ? "active" : ""}" aria-selected="${operatingView === section.id}">${esc(section.nav)}${section.id === "policies" ? ` · ${coziiVog.library.length}` : ""}</button>`).join("")}</div>`;
}
function operatingHeading() {
  const section = coziiVog.sections.find((item) => item.id === operatingView) || coziiVog.sections[0];
  return `<div class="page-heading"><div><div class="eyebrow">PRIMARY FRONTS · COZII & VALLEY OF GRACE</div><h1>${esc(section.title)}</h1><p>${esc(section.subtitle)}</p></div></div>${operatingSections()}`;
}
function operatingSource() {
  return `<p class="small-notice operating-source">${esc(coziiVog.asOf)} source snapshot · ${esc(coziiVog.timezone)}. Planning only. No contacts, payments, signatures, account or booking changes are authorized from this page.</p>`;
}
function operatingOverview() {
  return `<div class="stats">${[
    ["#/operating/properties", "Property snapshot", `${listings().length} <span style="font-size:14px">listings</span>`, "Documented · occupancy unverified"],
    ["#/operating/questions", "Valley of Grace", "Proposed", "Creekside purpose owner-confirmed"],
    ["#/operating/policies", "Policy library", `${coziiVog.library.length} <span style="font-size:14px">drafts · ${signedPolicies().length} signed</span>`, "Adoption not established"],
    ["#/operating/decisions", "Open decisions", `${pendingDecisions().length} <span style="font-size:14px">pending gates</span>`, "Decision-log items needing resolution"],
  ].map(([href, label, value, note]) => `<a class="stat" href="${href}"><small>${label}</small><strong>${value}</strong><span>${note}</span></a>`).join("")}</div>
  <section class="panel"><strong>${esc(coziiVog.creeksideNotice)}</strong> ${operatingChips("Owner-confirmed")}<p>${esc(coziiVog.creeksideDetail)}</p></section>
  <div class="mini-heading"><h2>Business map</h2><a class="hq-link" href="#/entities">Open in Entities ↗</a></div>
  <section class="panel"><div class="mini-heading"><h2>Next three actions</h2><span class="chip status-proposed">Proposed</span></div>
    ${coziiVog.nextThree.map((action, index) => `<div class="operating-question"><span class="operating-step">${index + 1}</span><div><h3>${esc(action.title)}</h3><p>${esc(action.detail)}</p></div></div>`).join("")}
    <div class="operating-gate"><strong>${esc(coziiVog.notLaunchReadyTitle)}</strong><p>${esc(coziiVog.notLaunchReadyDetail)}</p></div>
    <a class="hq-link" href="#/operating/board">Explore the 30-day board ↗</a>
  </section>
  <div class="mini-heading"><h2>Property snapshot</h2><a class="hq-link" href="#/operating/properties">View property register ↗</a></div>
  <div class="record-grid">${listings().map((property, index) => `<article class="object-card"><div class="eyebrow">PROPERTY ${String(index + 1).padStart(2, "0")}</div><h2>${esc(property.name)}</h2><p>${esc(property.address)}</p>${operatingChips(property.status)}<p>${esc(property.footnote)}</p></article>`).join("")}</div>
  <p class="small-notice">${esc(coziiVog.financialNote)}</p>`;
}
function operatingProperties() {
  const register = coziiVog.properties.filter((property) => property.group === "register");
  return `<div class="record-grid">${listings().map((property, index) => `<article class="object-card"><div class="eyebrow">PROPERTY ${String(index + 1).padStart(2, "0")}</div><h2>${esc(property.name)}</h2><p>${esc(property.address)}</p><p>${esc(property.source)}</p><p>${esc(property.unresolved)}</p>${operatingChips(property.status)}<p>${esc(property.footnote)}</p></article>`).join("")}</div>
  <div class="mini-heading"><h2>Property evidence and unresolved fields</h2><span class="chip status-unresolved">Unresolved</span></div>
  <section class="panel">${register.map((property) => `<article class="linked-row"><div class="row-main"><strong>${esc(property.name)}</strong><small>${esc(property.address)}</small><p>${esc(property.source)}</p><p>${esc(property.unresolved)}</p>${operatingChips(property.status)}</div></article>`).join("")}</section>
  <p class="small-notice">${esc(coziiVog.financialNote)}</p>`;
}
function operatingTaskCard(task, checks) {
  const done = checks[task.id] ? "done" : "";
  const checked = checks[task.id] ? "checked" : "";
  const priorityClass = task.priority === "P0" ? "priority-p0" : "";
  return `<article class="deal-card ${done}"><div class="operating-task"><input type="checkbox" data-operating-check="${esc(task.id)}" aria-label="${esc(task.title)}" ${checked}><div><div class="operating-task-title">${esc(task.priority)} · ${esc(task.title)}</div><p>${esc(task.action)}</p><div class="operating-meta"><span class="chip ${priorityClass}">${esc(task.priority)}</span><span>${esc(task.dateLabel)}</span></div><small>${esc(task.owner)}</small>${operatingChips(task.status)}<details><summary>Evidence to collect</summary><p>${esc(task.evidence)}</p></details></div></div></article>`;
}
function operatingBoard() {
  const checks = operatingChecks();
  const query = operatingQuery.toLowerCase();
  const tasks = coziiVog.tasks.filter((task) => {
    const blob = [task.phase, task.priority, task.title, task.owner, task.action, task.evidence, task.status].join(" ").toLowerCase();
    return blob.includes(query) && (operatingPriority === "all" || task.priority === operatingPriority) && (operatingPhase === "all" || task.phase === operatingPhase);
  });
  const phases = ["Days 1–7", "Days 8–14", "Days 15–30"].filter((phase) => operatingPhase === "all" || operatingPhase === phase);
  const columns = phases.map((phase) => {
    const rows = tasks.filter((task) => task.phase === phase);
    const windowLabel = coziiVog.tasks.find((task) => task.phase === phase)?.phaseWindow || "";
    const cards = rows.map((task) => operatingTaskCard(task, checks)).join("") || '<p class="muted">No actions in this phase.</p>';
    return `<section class="board-column"><h3>${esc(phase)} · ${esc(windowLabel)} · ${esc(coziiVog.timezone)} · ${rows.length}</h3>${cards}</section>`;
  }).join("");
  const priorityOptions = ["P0", "P1", "P2"].map((priority) => `<option value="${priority}" ${operatingPriority === priority ? "selected" : ""}>${priority}</option>`).join("");
  const phaseOptions = ["Days 1–7", "Days 8–14", "Days 15–30"].map((phase) => `<option value="${esc(phase)}" ${operatingPhase === phase ? "selected" : ""}>${esc(phase)}</option>`).join("");
  return `<section class="panel"><strong>${esc(coziiVog.boardNotice)}</strong><p>${esc(coziiVog.boardDetail)}</p></section>
  <div class="page-tools"><input id="operating-search" aria-label="Search 30-day actions" placeholder="Search actions…" value="${esc(operatingQuery)}">
    <select id="operating-priority" aria-label="Filter priority"><option value="all">All priorities</option>${priorityOptions}</select>
    <select id="operating-phase" aria-label="Filter phase"><option value="all">All phases</option>${phaseOptions}</select>
    <span class="small-notice">${tasks.length} of ${coziiVog.tasks.length} tasks · ${Object.values(checks).filter(Boolean).length} checked locally</span>
  </div>
  <div class="board">${columns}</div>`;
}
function operatingPolicies() {
  const query = operatingQuery.toLowerCase();
  const types = [...new Set(coziiVog.library.map((policy) => policy.type))].sort();
  const rows = coziiVog.library.filter((policy) => {
    const blob = [policy.number, policy.title, policy.type, policy.status, policy.points].join(" ").toLowerCase();
    return blob.includes(query) && (operatingDocType === "all" || policy.type === operatingDocType);
  });
  return `<section class="panel"><strong>${esc(coziiVog.policyNotice)}</strong> ${operatingChips("Documented")}<p>${esc(coziiVog.policyDetail)}</p></section>
  <div class="page-tools"><input id="operating-search" aria-label="Search policy library" placeholder="Search title, number, or key points…" value="${esc(operatingQuery)}">
    <select id="operating-doc-type" aria-label="Filter document type"><option value="all">All document types</option>${types.map((type) => `<option value="${esc(type)}" ${operatingDocType === type ? "selected" : ""}>${esc(type)}</option>`).join("")}</select>
    <span class="small-notice">${rows.length} of ${coziiVog.library.length} · ${signedPolicies().length} signed or adopted</span>
  </div>
  <section class="panel">${rows.map((policy) => `<article class="linked-row"><span class="rank">${esc(policy.number)}</span><div class="row-main"><strong>${esc(policy.title)}</strong><small>${esc(policy.type)}</small><p>${esc(policy.points)}</p>${operatingChips(policy.status)}</div></article>`).join("") || '<p class="muted">No documents match this view.</p>'}</section>`;
}
function operatingConflicts() {
  return `<section class="panel"><strong>${esc(coziiVog.conflictNotice)}</strong><p>${esc(coziiVog.conflictDetail)}</p></section>
  <div class="dashboard-grid"><section class="panel"><div class="mini-heading"><h2>Eight library reconciliation items</h2><span>31-document review</span></div>
    ${coziiVog.conflicts.map((conflict) => `<article class="linked-row"><div class="row-main"><strong>${esc(conflict.title)}</strong><p>${esc(conflict.detail)}</p><small>Documents ${esc(conflict.documents)}${conflict.status.toLowerCase().includes("minor") ? " · minor reconciliation" : ""}</small>${operatingChips(conflict.status)}</div></article>`).join("")}
  </section><section class="panel"><div class="mini-heading"><h2>Gaps and missing evidence</h2><span class="chip status-unresolved">Unresolved</span></div>
    ${coziiVog.gaps.map((gap) => `<article class="linked-row"><div class="row-main"><strong>${esc(gap.title)}</strong><p>${esc(gap.detail)}</p>${operatingChips(gap.status)}</div></article>`).join("")}
  </section></div>
  <section class="panel"><div class="mini-heading"><h2>Handoff conflicts carried forward</h2></div>
    ${coziiVog.legacyConflicts.map((conflict) => `<article class="linked-row"><div class="row-main"><strong>${esc(conflict.title)}</strong><p>${esc(conflict.detail)}</p><p>${esc(conflict.proposedOwner)}</p><div class="operating-gate">Evidence · ${esc(conflict.evidence)}</div>${operatingChips(conflict.status)}</div></article>`).join("")}
  </section>`;
}
function operatingDecisions() {
  return `<section class="panel"><strong>${esc(coziiVog.decisionNotice)}</strong><p>${esc(coziiVog.decisionDetail)}</p></section>
  <section class="panel">${coziiVog.decisions.map((decision, index) => `<article class="linked-row"><span class="rank">${String(index + 1).padStart(2, "0")}</span><div class="row-main"><strong>${esc(decision.title)}</strong><p>${esc(decision.record)}</p><div class="operating-gate"><strong>Gate / evidence</strong> · ${esc(decision.gate)}</div>${operatingChips(decision.status)}</div></article>`).join("")}</section>
  <p class="small-notice">${esc(coziiVog.decisionFoot)}</p>`;
}
function operatingQuestions() {
  return `<section class="panel">${coziiVog.questions.map((question, index) => `<article class="operating-question"><span class="operating-step">${index + 1}</span><div>${operatingChips("Unresolved")}<h3>${esc(question)}</h3></div></article>`).join("")}</section>
  <section class="panel"><strong>${esc(coziiVog.questionFollowupTitle)}</strong><p>${esc(coziiVog.questionFollowupDetail)}</p></section>
  <div class="mini-heading"><h2>Valley of Grace readiness register</h2></div>
  <div class="record-grid">${coziiVog.readiness.map((item) => `<article class="object-card"><div class="eyebrow">READINESS</div><h2>${esc(item.topic)}</h2><p>${esc(item.record)}</p><div class="operating-gate">To confirm · ${esc(item.toConfirm)}</div>${operatingChips(item.status)}</article>`).join("")}</div>`;
}
function operatingPage() {
  resetOperatingFilters();
  const body = { overview: operatingOverview, properties: operatingProperties, board: operatingBoard, policies: operatingPolicies, conflicts: operatingConflicts, decisions: operatingDecisions, questions: operatingQuestions }[operatingView] || operatingOverview;
  return operatingHeading() + body() + operatingSource();
}
function operatingTodayWidget() {
  const decisions = pendingDecisions().slice(0, 3);
  const actions = nextBoardActions(3);
  return `<section class="panel operating-today"><div class="mini-heading"><div><span class="eyebrow">COZII & VALLEY OF GRACE</span><h2>Open operating decisions</h2></div><a class="hq-link" href="#/operating">Operating picture ↗</a></div><p>From the ${esc(coziiVog.asOf)} snapshot for the two primary fronts. Record a workspace decision when you are ready to choose.</p><div class="dashboard-grid"><div><h3>Pending gates</h3>${decisions.map((decision) => `<div class="linked-row"><a class="operating-row-link" href="#/operating/decisions">${esc(decision.title)}<small>${esc(decision.status)}</small></a></div>`).join("")}<a class="hq-link" href="#/operating/decisions">Decision log ↗</a></div><div><h3>Next 30-day actions</h3>${actions.map((task) => `<div class="linked-row"><a class="operating-row-link" href="#/operating/board">${esc(task.priority)} · ${esc(task.title)}<small>${esc(task.dateLabel)} · ${esc(task.owner)}</small></a></div>`).join("")}<a class="hq-link" href="#/operating/board">30-day board ↗</a></div></div></section>`;
}
function operatingFrontSection(front) {
  const kind = operatingFrontKind(front);
  if (!kind) return "";
  const lead = kind === "vog"
    ? "Valley of Grace Recovery Home LLC is the proposed Creekside operator. Purpose is owner-confirmed. Approval, readiness, and adoption are still open."
    : "BXB International LLC conducts business as Cozii Housing Accommodations. The entity map is with your other entities.";
  const view = kind === "vog" ? "policies" : "properties";
  return `<section><h3>Operating picture <span class="suggestion">Nov 7 snapshot</span></h3><p>${esc(lead)}</p><a class="hq-link" href="#/operating/${view}">Open the operating picture ↗</a></section>`;
}
function operatingEntityNotes(id) {
  const entity = operatingEntity(id);
  return [entity.role, entity.source, entity.unresolved].filter(Boolean).join(" ");
}
function installOperatingEntities() {
  if (typeof prefs !== "function" || prefs().operatingMapVersion) return;
  const specs = [
    { name: "Equitive Capital Holdings, LLC", type: "Holding company", parent: "", caption: "Listed as the 100% member of BXB in the cited agreement. No established ownership of Snowbook or Valley of Grace.", notes: operatingEntityNotes("equitive") },
    { name: "BXB International LLC", aliases: ["BXB International"], type: "Operating company", parent: "Equitive Capital Holdings, LLC", caption: "Conducts business as Cozii Housing Accommodations. Documented 100% member in the cited agreement; current status unverified.", notes: operatingEntityNotes("bxb") },
    { name: "Snowbook Properties LLC", aliases: ["Snowbook Properties, LLC"], type: "Property holding company", parent: "", caption: "Separate entity. Identified as the Creekside owner in application context; title unresolved.", notes: operatingEntityNotes("snowbook") },
    { name: "Valley of Grace Recovery Home LLC", type: "Operating company", parent: "", caption: "Separate entity. Proposed Creekside operator. Purpose owner-confirmed Nov 7, 2026.", notes: operatingEntityNotes("vog") },
  ];
  specs.forEach((spec) => {
    let row = db.entities.find((entity) => entity.name === spec.name || (spec.aliases || []).includes(entity.name));
    if (row && row.name !== spec.name) {
      const previous = row.name;
      row.name = spec.name;
      fronts.forEach((front) => { if (front.entity === previous) front.entity = spec.name; });
      Object.values(db).forEach((list) => { if (Array.isArray(list)) list.forEach((item) => { if (!item) return; if (item.entity === previous) item.entity = spec.name; if (item.parent === previous) item.parent = spec.name; }); });
    }
    if (!row) {
      row = { id: uid(), name: spec.name, coOwner: "", ownership: "", structureStatus: "Current", place: "" };
      db.entities.push(row);
    }
    row.type = spec.type;
    row.parent = spec.parent;
    row.caption = spec.caption;
    row.notes = spec.notes;
    if (!row.structureStatus) row.structureStatus = "Current";
  });
  prefs().operatingMapVersion = 1;
  persist();
  if (typeof baseSave === "function") baseSave();
}

function wireOperating() {
  if (typeof document === "undefined" || !document.querySelector(".sidebar")) return;
  pages.operating = ["Cozii & VoG", coziiVog.sections[0].title, coziiVog.sections[0].subtitle];
  const frontsLink = document.querySelector('.sidebar a[data-page="fronts"]');
  if (frontsLink && !document.querySelector('.sidebar a[data-page="operating"]')) frontsLink.insertAdjacentHTML("afterend", '<a href="#/operating" data-page="operating"><span>▣</span> Cozii & VoG</a>');
  const frontsOption = document.querySelector('.mobile-nav option[value="fronts"]');
  if (frontsOption && !document.querySelector('.mobile-nav option[value="operating"]')) frontsOption.insertAdjacentHTML("afterend", '<option value="operating">Cozii & VoG</option>');
  const phoneFronts = document.querySelector('.phone-menu-links a[href="#/fronts"]');
  if (phoneFronts && !document.querySelector('.phone-menu-links a[data-phone-page="operating"]')) phoneFronts.insertAdjacentHTML("afterend", '<a href="#/operating" data-phone-page="operating">Cozii & VoG<span aria-hidden="true">↗</span></a>');

  const operatingHomeBase = ownerHome;
  ownerHome = function () {
    const html = operatingHomeBase();
    const marker = '<section class="panel practice-preview">';
    const widget = operatingTodayWidget();
    return html.includes(marker) ? html.replace(marker, widget + marker) : html + widget;
  };
  todayPage = ownerHome;

  const operatingRenderBase = renderPage;
  renderPage = function () {
    if (route === "operating") {
      main.innerHTML = `${operatingPage()}<footer>BXB OS <span>Your life, connected. Operating picture kept separate from workspace records.</span></footer>`;
      return;
    }
    operatingRenderBase();
  };

  const operatingHQBase = openHQ;
  openHQ = function (id) {
    operatingHQBase(id);
    const front = fronts.find((item) => item.id === id);
    const html = operatingFrontSection(front);
    const controls = document.querySelector("#hq .hq-controls");
    if (html && controls) controls.insertAdjacentHTML("afterend", html);
  };
  const operatingStructureBase = entityStructure;
  entityStructure = function () {
    const html = operatingStructureBase();
    if (entityExample) return html;
    return html.replace('<div class="structure-toolbar">', `<p class="small-notice">${esc(coziiVog.separationNote)}</p><div class="structure-toolbar">`);
  };
  installOperatingEntities();

  const operatingCardBase = card;
  card = function (front) {
    const html = operatingCardBase(front);
    const kind = operatingFrontKind(front);
    if (!kind) return html;
    return html.replace('<div class="card-meta">', `<a class="hq-link" href="#/operating/${kind === "vog" ? "policies" : "properties"}">Operating picture ↗</a><div class="card-meta">`);
  };

  const baseNavigate = navigate;
  window.removeEventListener("hashchange", baseNavigate);
  navigate = function () {
    const raw = location.hash.replace(/^#\//, "").split("?")[0];
    const [path, sub] = raw.split("/");
    if (path === "operating") {
      const known = coziiVog.sections.some((section) => section.id === sub);
      operatingView = known ? sub : "overview";
      if (location.hash !== "#/operating") {
        const deep = `${location.pathname}${location.search}#/operating${known ? `/${sub}` : ""}`;
        history.replaceState(null, "", `${location.pathname}${location.search}#/operating`);
        baseNavigate();
        if (known) history.replaceState(null, "", deep);
        return;
      }
    }
    baseNavigate();
  };
  window.addEventListener("hashchange", navigate);

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-operating-view]");
    if (trigger && trigger.tagName !== "A") {
      const id = trigger.dataset.operatingView;
      if (coziiVog.sections.some((section) => section.id === id)) location.hash = `/operating/${id}`;
    }
    const operatingLink = event.target.closest("a[href^='#/operating']");
    if (operatingLink) document.getElementById("hq")?.close();
  });
  document.addEventListener("input", (event) => {
    if (event.target.id !== "operating-search") return;
    const position = event.target.selectionStart;
    operatingQuery = event.target.value;
    renderPage();
    const input = document.getElementById("operating-search");
    if (!input) return;
    input.focus();
    input.setSelectionRange(position, position);
  });
  document.addEventListener("change", (event) => {
    if (event.target.id === "operating-priority") { operatingPriority = event.target.value; renderPage(); }
    if (event.target.id === "operating-phase") { operatingPhase = event.target.value; renderPage(); }
    if (event.target.id === "operating-doc-type") { operatingDocType = event.target.value; renderPage(); }
    if (event.target.dataset.operatingCheck) {
      setOperatingCheck(event.target.dataset.operatingCheck, event.target.checked);
      event.target.closest(".deal-card")?.classList.toggle("done", event.target.checked);
      const note = document.querySelector(".page-tools .small-notice");
      if (note && route === "operating" && operatingView === "board") {
        const visible = document.querySelectorAll(".board .deal-card").length;
        note.textContent = `${visible} of ${coziiVog.tasks.length} tasks · ${Object.values(operatingChecks()).filter(Boolean).length} checked locally`;
      }
    }
  });
  render();
  navigate();
}
wireOperating();
