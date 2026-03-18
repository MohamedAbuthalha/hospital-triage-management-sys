/**
 * AUTO-ASSIGNMENT MODULE — UNIT TEST / DEMO SCRIPT
 * ─────────────────────────────────────────────────────────────────────────────
 * Run: node src/autoAssignment/test.js
 *
 * This tests the specializationEngine in isolation (no DB needed).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { analyzeCase, detectSeverity } = require("./specializationEngine");

const TEST_CASES = [
  {
    label: "Classic heart attack presentation",
    input: { symptoms: "chest pain radiating to left arm", age: 55, gender: "male" },
    expectedSpecialization: "cardiology",
    expectedSeverity: "critical",
  },
  {
    label: "Stroke with neurological signs",
    input: { symptoms: "slurred speech and sudden numbness on right side", age: 63, gender: "female" },
    expectedSpecialization: "neurology",
    expectedSeverity: "high",
  },
  {
    label: "Respiratory distress",
    input: { symptoms: "difficulty breathing and wheezing", description: "known asthma patient", age: 34, gender: "male" },
    expectedSpecialization: "pulmonology",
    expectedSeverity: "high",
  },
  {
    label: "Paediatric fever",
    input: { symptoms: "high fever and cough", age: 7, gender: "male" },
    expectedSpecialization: "pediatrics",
    expectedSeverity: "high",
  },
  {
    label: "Fracture",
    input: { symptoms: "fracture in lower leg after fall", age: 28, gender: "female" },
    expectedSpecialization: "orthopedics",
    expectedSeverity: "high",
  },
  {
    label: "Abdominal pain — possible GI",
    input: { symptoms: "severe abdominal pain nausea vomiting", description: "has ibs history", age: 42, gender: "male" },
    expectedSpecialization: "gastroenterology",
    expectedSeverity: "high",
  },
  {
    label: "UTI symptoms",
    input: { symptoms: "painful urination blood in urine", age: 30, gender: "female" },
    expectedSpecialization: "urology",
    expectedSeverity: "high",
  },
  {
    label: "Gynaecological issue",
    input: { symptoms: "heavy vaginal bleeding and pelvic pain", age: 32, gender: "female" },
    expectedSpecialization: "gynecology",
    expectedSeverity: "high",
  },
  {
    label: "Mental health crisis",
    input: { symptoms: "suicidal thoughts and severe depression", age: 26, gender: "male" },
    expectedSpecialization: "psychiatry",
    expectedSeverity: "high",
  },
  {
    label: "Eye emergency",
    input: { symptoms: "sudden vision loss and severe eye pain", age: 58, gender: "female" },
    expectedSpecialization: "ophthalmology",
    expectedSeverity: "high",
  },
  {
    label: "General / unclear symptoms",
    input: { symptoms: "mild fatigue and runny nose", age: 25, gender: "male" },
    expectedSpecialization: "general",
    expectedSeverity: "low",
  },
  {
    label: "Diabetes keywords in description",
    input: { symptoms: "excessive thirst frequent urination", description: "blood sugar very high, possible diabetes", age: 44, gender: "female" },
    expectedSpecialization: "endocrinology",
    expectedSeverity: "low",
  },
];

async function runTests() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  AUTO-ASSIGNMENT ENGINE — TEST RUN");
  console.log("═══════════════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    const result = await analyzeCase(tc.input);

    const specOk  = result.topSpecialization === tc.expectedSpecialization;
    const sevOk   = result.severity === tc.expectedSeverity;
    const allOk   = specOk && sevOk;

    if (allOk) passed++;
    else failed++;

    const icon = allOk ? "[OK]" : "[ERR]";
    console.log(`${icon} ${tc.label}`);
    console.log(`   Specialization : ${result.topSpecialization}   (expected: ${tc.expectedSpecialization}) ${specOk ? "PASS" : "FAIL"}`);
    console.log(`   Severity       : ${result.severity}   (expected: ${tc.expectedSeverity}) ${sevOk ? "PASS" : "FAIL"}`);
    console.log(`   Top candidates : ${result.candidates.slice(0, 3).map(c => `${c.specialization}(${c.score.toFixed(1)})`).join(", ")}`);
    console.log(`   Fallback       : ${result.fallback}`);
    console.log();
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  RESULTS: ${passed} passed / ${failed} failed / ${TEST_CASES.length} total`);
  console.log("═══════════════════════════════════════════════════════════");

  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
