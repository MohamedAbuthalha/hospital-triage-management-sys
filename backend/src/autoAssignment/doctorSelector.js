/**
 * DOCTOR SELECTOR
 * ─────────────────────────────────────────────────────────────────────────────
 * Given an ordered list of candidate specializations, finds the best available
 * doctor using a multi-criteria selection strategy:
 *
 *   1. Try the top-ranked specialization first.
 *   2. If none available, walk down the candidate list (fallback chain).
 *   3. If still nothing, fall back to "general".
 *   4. If absolutely nothing, return null (case queued as "waiting").
 *
 * Selection criteria within a specialization (in order):
 *   a. Least active cases (workload balancing)
 *   b. Most experience (tie-breaker)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DoctorProfile = require("../models/DoctorProfile");

/**
 * Query MongoDB for the best available doctor of a given specialization.
 * Returns a DoctorProfile document or null.
 *
 * Selection criteria (in priority order):
 *   1. Specialization matches (case-insensitive, already normalized to lowercase)
 *   2. Must be on duty (isOnDuty: true)
 *   3. Must have available capacity (activeCases < maxCases)
 *   4. Fewest active cases (workload balancing)
 *   5. Most experience (tie-breaker)
 */
async function findBestDoctorForSpecialization(specialization) {
  try {
    // [OK] Fixed: Properly query for doctors with matching specialization and on-duty status
    const doctors = await DoctorProfile.find({
      specialization: specialization.toLowerCase().trim(),
      isOnDuty: true,
    }).lean(false); // Need non-lean docs for potential later persistence

    if (doctors.length === 0) {
      console.log(`[DocSelector] No doctors found for specialization: ${specialization}`);
      return null;
    }

    // [OK] Validate and filter by capacity
    const eligible = doctors.filter((doctor) => {
      // Ensure required fields exist
      if (
        typeof doctor.activeCases !== "number" ||
        typeof doctor.maxCases !== "number"
      ) {
        console.warn(
          `[DocSelector] Doctor ${doctor._id} has invalid activeCases or maxCases:`,
          {
            activeCases: doctor.activeCases,
            maxCases: doctor.maxCases,
          }
        );
        return false;
      }

      // Check capacity
      if (doctor.activeCases >= doctor.maxCases) {
        console.log(
          `[DocSelector] Doctor ${doctor._id} (${doctor.name}) is at capacity: ${doctor.activeCases}/${doctor.maxCases}`
        );
        return false;
      }

      return true;
    });

    if (eligible.length === 0) {
      console.log(
        `[DocSelector] No eligible doctors for specialization: ${specialization} (found ${doctors.length}, but all at capacity)`
      );
      return null;
    }

    // Sort: fewest active cases first, then most experience
    eligible.sort((a, b) => {
      if (a.activeCases !== b.activeCases) {
        return a.activeCases - b.activeCases;
      }
      return b.experience - a.experience;
    });

    const selectedDoctor = eligible[0];
    console.log(
      `[DocSelector] Selected doctor ${selectedDoctor._id} (${selectedDoctor.name}) for ${specialization} - capacity: ${selectedDoctor.activeCases}/${selectedDoctor.maxCases}`
    );

    return selectedDoctor;
  } catch (error) {
    console.error(
      `[DocSelector] Error finding doctor for specialization ${specialization}:`,
      error.message
    );
    return null;
  }
}

/**
 * Main selector - tries to find the best available doctor.
 *
 * @param {Array<{ specialization: string, score: number }>} candidates
 *   Ordered list from specializationEngine.analyzeCase()
 * @param {{ fallback: boolean }} engineResult
 *
 * @returns {Promise<{
 *   doctor: DoctorProfile | null,
 *   selectedSpecialization: string,
 *   selectionReason: string,
 * }>}
 */
async function selectDoctor(candidates, { fallback } = {}) {
  // Build probe list: top candidates + "general" as final fallback
  const probeList = [...candidates.map((c) => c.specialization)];
  if (!probeList.includes("general")) probeList.push("general");

  console.log(`[DocSelector] Probing specializations in order:`, probeList);

  for (const specialization of probeList) {
    const doctor = await findBestDoctorForSpecialization(specialization);

    if (doctor) {
      const isOriginalTop = specialization === candidates[0]?.specialization;
      const isFallbackSpec = specialization === "general" && !isOriginalTop;

      const reason = fallback
        ? "no clear specialization matched — defaulted to general"
        : isFallbackSpec
        ? `no ${candidates[0]?.specialization} doctor available — reassigned to general`
        : `matched specialization: ${specialization}`;

      console.log(`[DocSelector] [OK] Assignment successful:`, {
        doctorId: doctor._id,
        doctorName: doctor.name,
        specialization,
        reason,
      });

      return { doctor, selectedSpecialization: specialization, selectionReason: reason };
    }
  }

  console.warn(
    `[DocSelector] [ERR] No available doctor found. Exhausted all specialization candidates:`,
    probeList
  );

  return {
    doctor: null,
    selectedSpecialization: candidates[0]?.specialization || "general",
    selectionReason: "no available doctor found in any matching specialization",
  };
}

module.exports = { selectDoctor };
