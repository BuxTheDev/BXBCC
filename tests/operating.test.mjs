import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { coziiVog, listings, nextBoardActions, pendingDecisions, signedPolicies, statusLabels } from "../src/operating/cozii-vog.ts";

test("generated browser data matches the typed snapshot", () => {
  const source = readFileSync("public/os/cozii-vog-data.js", "utf8");
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  assert.deepEqual(JSON.parse(source.slice(start, end + 1)), JSON.parse(JSON.stringify(coziiVog)));
});

test("keeps the four listings and leaves Snowbook and Valley of Grace separate", () => {
  const shown = listings().map((property) => property.name);
  assert.deepEqual(shown, ["Buffalo", "Sahara", "Oro Grande", "Creekside"]);
  assert.match(listings()[0].address, /Las Vegas/);
  assert.match(listings()[1].address, /Las Vegas/);
  assert.match(listings()[2].address, /North Las Vegas/);
  assert.match(listings()[3].address, /5861 Creekside Sands Lane, North Las Vegas/);
  assert.match(listings()[3].status, /owner-confirmed/i);
  assert.match(listings()[3].footnote, /Proposed sober living/);
  const separate = coziiVog.entities.filter((entity) => entity.placement === "separate").map((entity) => entity.name);
  assert.deepEqual(separate, ["Snowbook Properties LLC", "Valley of Grace Recovery Home LLC"]);
  assert.equal("parent" in coziiVog.entities[0], false);
  assert.match(coziiVog.separationNote, /No Equitive ownership of Snowbook or VoG is established/);
  assert.match(coziiVog.entities.find((entity) => entity.id === "equitive").unresolved, /no established ownership of Snowbook or VoG/);
  assert.match(coziiVog.entities.find((entity) => entity.id === "bxb").source, /Cozii Housing Accommodations/);
});

test("policy library is 31 unsigned drafts and six decision gates stay open", () => {
  assert.equal(coziiVog.library.length, 31);
  assert.equal(signedPolicies().length, 0);
  assert.ok(coziiVog.library.every((policy) => /draft/i.test(policy.status)));
  assert.equal(coziiVog.decisions.length, 8);
  assert.equal(pendingDecisions().length, 6);
  assert.deepEqual(pendingDecisions().slice(0, 3).map((decision) => decision.title), [
    "Creekside STR transition",
    "Ownership map",
    "Policies and service scope",
  ]);
  assert.deepEqual(statusLabels(pendingDecisions()[0].status), ["Proposed", "Unresolved"]);
  assert.equal(coziiVog.questions.length, 5);
  assert.equal(coziiVog.conflicts.length, 8);
  assert.equal(coziiVog.gaps.length, 9);
});

test("next 30-day actions are the earliest proposed board tasks", () => {
  assert.equal(coziiVog.tasks.length, 21);
  assert.deepEqual(nextBoardActions().map((task) => task.title), [
    "Workspace continuity",
    "Creekside STR transition + VoG status",
    "Yale lock updates",
  ]);
  assert.equal(nextBoardActions()[0].date, "2026-11-09");
});

test("snapshot does not carry secrets, door codes, wi-fi, or resident identities", () => {
  const blob = JSON.stringify(coziiVog).toLowerCase();
  for (const term of ["password", "wifi", "wi-fi", "door code", "ssn", "social security", "date of birth"]) {
    assert.equal(blob.includes(term), false, term);
  }
  assert.match(coziiVog.financialNote, /intentionally not populated/);
  assert.equal(JSON.stringify(coziiVog).includes("residentName"), false);
});

test("operating page is wired into fronts, Today, and hash routes", () => {
  const page = readFileSync("public/os/operating.js", "utf8");
  const html = readFileSync("public/os/index.html", "utf8");
  const config = readFileSync("next.config.ts", "utf8");
  assert.match(page, /practice-preview/);
  assert.match(page, /data-page="operating"/);
  assert.match(page, /operatingFrontKind/);
  assert.match(html, /\/os\/operating\.js/);
  assert.match(config, /\/operating/);
});
