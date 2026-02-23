// Override these if you want to manually control year range
// const YOUNGEST_YEAR = 2023;
// const OLDEST_YEAR = 2007;

const BIRTHDATE_GROUPS = [
    { group: "U4", start: "2022-08-01", end: "2023-07-31" },
    { group: "U5", start: "2021-08-01", end: "2022-07-31" },
    { group: "U6", start: "2020-08-01", end: "2021-07-31" },
    { group: "U7", start: "2019-08-01", end: "2020-07-31" },
    { group: "U8", start: "2018-08-01", end: "2019-07-31" },
    { group: "U9", start: "2017-08-01", end: "2018-07-31" },
    { group: "U10", start: "2016-08-01", end: "2017-07-31" },
    { group: "U11", start: "2015-08-01", end: "2016-07-31" },
    { group: "U12", start: "2014-08-01", end: "2015-07-31" },
    { group: "U13", start: "2013-08-01", end: "2014-07-31" },
    { group: "U14", start: "2012-08-01", end: "2013-07-31" },
    { group: "U15", start: "2011-08-01", end: "2012-07-31" },
    { group: "U16", start: "2010-08-01", end: "2011-07-31" },
    { group: "U17", start: "2009-08-01", end: "2010-07-31" },
    { group: "U19", start: "2007-08-01", end: "2009-07-31" }
];

const GRADE_TO_U = {
    "Pre-K": "U5",
    "4K": "U6",
    "K": "U7",
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
    const birthDate = new Date(birthday);

    for (let range of BIRTHDATE_GROUPS) {
        const start = new Date(range.start);
        const end = new Date(range.end);

        if (birthDate >= start && birthDate <= end) {
            return range.group;
        }
    }

    return null;
}

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
        const startYear = new Date(group.start).getFullYear();
        const endYear = new Date(group.end).getFullYear();
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

    if (!birthU) {
        let message = "⚠ Please contact the club as a waiver would need to be requested. Note: Waivers are for one season only, and might not apply for tournaments, which have authority to determine their own eligibility rules. Waivers are not frequently granted for teams playing in WYSA State Leagues, the State Cup and Presidents Cup.";
        resultDiv.innerHTML = message;
        return;
    }

    // Check if birthday is in August (month = 8)
    const birthDate = new Date(birthday);
    const isAugustBirthday = birthDate.getMonth() === 7; // getMonth() returns 0-11, so 7 = August

    // Get the indices of the age groups
    const allGroups = ["U4", "U5", "U6", "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U19"];
    const birthIndex = allGroups.indexOf(birthU);

    let message = `<strong>Official Age Group (by birthdate):</strong> ${birthU}<br>`;
    message += `<strong>Expected Age Group (by grade):</strong> ${gradeU}<br><br>`;

    if (isAugustBirthday) {
        // August birthdays (cutoff month) can play in their birthdate group OR one level up
        const upperGroup = allGroups[birthIndex + 1] || birthU;
        message += `✅ August birthday (cutoff month) - eligible to play in <strong>${birthU} or ${upperGroup}</strong>.`;
    } else if (birthU === gradeU) {
        message += "✅ Grade and birthdate match.";
    } else {
        message += "⚠ Please contact the club as a waiver would need to be requested. Note: Waivers are for one season only, and might not apply for tournaments, which have authority to determine their own eligibility rules. Waivers are not frequently granted for teams playing in WYSA State Leagues, the State Cup and Presidents Cup.";
    }

    resultDiv.innerHTML = message;
}
