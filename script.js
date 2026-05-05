function generateBirthdateGroups() {
    const currentYear = new Date().getFullYear();
    const groups = [];

    // Build U4 through U19 from the current year using an Aug 1 to Jul 31 seasonal cutoff.
    for (let age = 4; age <= 19; age++) {
        const startYear = currentYear - age;
        const endYear = currentYear - (age - 1);

        groups.push({
            group: `U${age}`,
            start: `${startYear}-08-01`,
            end: `${endYear}-07-31`
        });
    }

    return groups;
}

const BIRTHDATE_GROUPS = generateBirthdateGroups();

function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

const GRADE_TO_U = {
    "Pre-K": ["U5", "U6"],
    "4K": ["U5", "U6"],
    "Kindergarten": "U7",
    "K": "U7",
    "5K": "U7",
    "1": "U8",
    "2": "U9",
    "3": "U10",
    "4": "U11",
    "5": "U12",
    "6": "U13",
    "7": "U14",
    "8": "U15",
    "9": "U16",
    "10": "U17",
    "11": "U18",
    "12": "U19"
};

function getUFromBirthday(birthday) {
    const birthDate = parseLocalDate(birthday);

    for (let range of BIRTHDATE_GROUPS) {
        const start = parseLocalDate(range.start);
        const end = parseLocalDate(range.end);

        if (birthDate >= start && birthDate <= end) {
            return range.group;
        }
    }

    return null;
}

const ALL_GROUPS = BIRTHDATE_GROUPS.map(range => range.group);

// Initialize dropdowns on page load
window.addEventListener('DOMContentLoaded', function() {
    // Populate days (1-31)
    const daySelect = document.getElementById('day');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }

    // Populate years dynamically from BIRTHDATE_GROUPS
    const yearSelect = document.getElementById('year');
    let oldestYear = 9999;
    let youngestYear = 0;

    // Find the range from BIRTHDATE_GROUPS
    BIRTHDATE_GROUPS.forEach(group => {
        const startYear = parseLocalDate(group.start).getFullYear();
        const endYear = parseLocalDate(group.end).getFullYear();
        oldestYear = Math.min(oldestYear, startYear, endYear);
        youngestYear = Math.max(youngestYear, startYear, endYear);
    });

    // Populate year dropdown from oldest to youngest
    for (let year = youngestYear; year >= oldestYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
});

function calculate() {
    const grade = document.getElementById("grade").value;
    const month = document.getElementById("month").value;
    let day = document.getElementById("day").value;
    const year = document.getElementById("year").value;
    const resultDiv = document.getElementById("result");

    if (!grade || !month || !day || !year) {
        resultDiv.innerHTML = "Please enter both grade and birthday.";
        return;
    }

    // Silently adjust invalid days to the last valid day of the month
    const daysInMonth = new Date(year, month, 0).getDate();
    if (parseInt(day) > daysInMonth) {
        day = daysInMonth.toString();
    }

    // Construct birthday string in YYYY-MM-DD format
    const birthday = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    const birthU = getUFromBirthday(birthday);
    const gradeU = GRADE_TO_U[grade];
    const gradeGroups = Array.isArray(gradeU) ? gradeU : [gradeU];

    if (!birthU) {
        let message = "⚠ Please contact the club as a waiver would need to be requested. Note: Waivers are for one season only, and might not apply for tournaments, which have authority to determine their own eligibility rules. Waivers are not frequently granted for teams playing in WYSA State Leagues, the State Cup and Presidents Cup.";
        resultDiv.innerHTML = message;
        return;
    }

    if (!gradeU) {
        resultDiv.innerHTML = "Please select a valid grade.";
        return;
    }

    // Check if birthday is in August (month = 8)
    const birthDate = parseLocalDate(birthday);
    const isAugustBirthday = birthDate.getMonth() === 7; // getMonth() returns 0-11, so 7 = August

    // Get the indices of the age groups
    const birthIndex = ALL_GROUPS.indexOf(birthU);

    let expectedGroupsDisplay = gradeGroups.join(" or ");
    let outcomeMessage = "";

    if (isAugustBirthday) {
        const gradeIndices = gradeGroups
            .map(group => ALL_GROUPS.indexOf(group))
            .filter(index => index !== -1);
        const differences = gradeIndices.map(index => index - birthIndex);
        const hasExactMatch = differences.includes(0);
        const hasStartedEarlyMatch = differences.includes(1);
        const hasHeldBackOneMatch = differences.includes(-1);
        const minAbsDifference = differences.length
            ? Math.min(...differences.map(diff => Math.abs(diff)))
            : Number.POSITIVE_INFINITY;

        if (hasExactMatch) {
            expectedGroupsDisplay = birthU;
            outcomeMessage = `✅ August birthday (cutoff month) - eligible to play in <strong>${birthU}</strong>.`;
        } else if (hasStartedEarlyMatch) {
            const gradePlusOneIndex = gradeIndices.find(index => index - birthIndex === 1);
            const gradePlusOneGroup = ALL_GROUPS[gradePlusOneIndex];
            expectedGroupsDisplay = `${birthU} or ${gradePlusOneGroup}`;
            outcomeMessage = `✅ August birthday (cutoff month) - eligible to play in <strong>${birthU} or ${gradePlusOneGroup}</strong>.`;
        } else if (hasHeldBackOneMatch) {
            expectedGroupsDisplay = birthU;
            outcomeMessage = `✅ August birthday (cutoff month) - eligible to play in <strong>${birthU}</strong>.`;
        } else if (minAbsDifference >= 2) {
            outcomeMessage = "⚠ Please contact the club as a waiver would need to be requested. Note: Waivers are for one season only, and might not apply for tournaments, which have authority to determine their own eligibility rules. Waivers are not frequently granted for teams playing in WYSA State Leagues, the State Cup and Presidents Cup.";
        } else {
            outcomeMessage = "⚠ Please contact the club as a waiver would need to be requested. Note: Waivers are for one season only, and might not apply for tournaments, which have authority to determine their own eligibility rules. Waivers are not frequently granted for teams playing in WYSA State Leagues, the State Cup and Presidents Cup.";
        }
    } else if (gradeGroups.includes(birthU)) {
        expectedGroupsDisplay = birthU;
        outcomeMessage = "✅ Grade and birthdate match.";
    } else {
        outcomeMessage = "⚠ Please contact the club as a waiver would need to be requested. Note: Waivers are for one season only, and might not apply for tournaments, which have authority to determine their own eligibility rules. Waivers are not frequently granted for teams playing in WYSA State Leagues, the State Cup and Presidents Cup.";
    }

    let message = `<strong>Official Age Group (by birthdate):</strong> ${birthU}<br>`;
    message += `<strong>Expected Age Group (by grade):</strong> ${expectedGroupsDisplay}<br><br>`;
    message += outcomeMessage;

    resultDiv.innerHTML = message;
}
