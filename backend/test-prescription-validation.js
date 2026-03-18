/**
 * Test script to verify prescriptionId validation logic
 * Tests that:
 * - Valid ObjectIds are accepted
 * - Invalid string IDs are rejected
 * - Empty/null values are handled properly
 */

const mongoose = require("mongoose");

// Test the validation logic
const testPrescriptionValidation = () => {
  console.log("[TEST] Testing prescriptionId Validation Logic\n");

  const testCases = [
    {
      input: "507f1f77bcf86cd799439011", // Valid ObjectId
      expectedValid: true,
      description: "Valid ObjectId",
    },
    {
      input: "PCM2024001", // Invalid format (common user mistake)
      expectedValid: false,
      description: "Invalid ID (user mistake - like display ID)",
    },
    {
      input: "123", // Too short
      expectedValid: false,
      description: "Too short to be ObjectId",
    },
    {
      input: "", // Empty string
      expectedValid: true, // Should be treated as null/absent
      description: "Empty string (optional)",
    },
    {
      input: null, // Null
      expectedValid: true, // Should be treated as absent
      description: "Null value (optional)",
    },
    {
      input: undefined, // Undefined
      expectedValid: true, // Should be treated as absent
      description: "Undefined value (optional)",
    },
    {
      input: "507f191e810c19729de860ea", // Another valid ObjectId
      expectedValid: true,
      description: "Another valid ObjectId",
    },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ input, expectedValid, description }, index) => {
    let validPrescriptionId = null;

    // This is the validation logic from the controller
    if (input && input !== "") {
      if (!mongoose.Types.ObjectId.isValid(input)) {
        // Invalid ID - would return 400 error
        if (!expectedValid) {
          console.log(`[PASS] Test ${index + 1}: ${description}`);
          console.log(`   Input: "${input}" → REJECTED (Invalid ObjectId) PASS`);
          passed++;
        } else {
          console.log(`[FAIL] Test ${index + 1}: ${description}`);
          console.log(`   Input: "${input}" → REJECTED but should be valid FAIL`);
          failed++;
        }
      } else {
        // Valid ID - would be accepted
        validPrescriptionId = input;
        if (expectedValid) {
          console.log(`[PASS] Test ${index + 1}: ${description}`);
          console.log(`   Input: "${input}" → ACCEPTED PASS`);
          passed++;
        } else {
          console.log(`[FAIL] Test ${index + 1}: ${description}`);
          console.log(`   Input: "${input}" → ACCEPTED but should be invalid FAIL`);
          failed++;
        }
      }
    } else {
      // Empty or null - treated as absent (validPrescriptionId stays null)
      if (expectedValid) {
        console.log(`[PASS] Test ${index + 1}: ${description}`);
        console.log(`   Input: ${input} → ACCEPTED as null PASS`);
        passed++;
      } else {
        console.log(`[FAIL] Test ${index + 1}: ${description}`);
        console.log(`   Input: ${input} → ACCEPTED but should be invalid FAIL`);
        failed++;
      }
    }

    console.log(`   Final value: ${validPrescriptionId || "null"}\n`);
  });

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${"=".repeat(50)}\n`);

  if (failed === 0) {
    console.log("[PASS] All validation tests passed!");
    process.exit(0);
  } else {
    console.log("[FAIL] Some tests failed!");
    process.exit(1);
  }
};

testPrescriptionValidation();
