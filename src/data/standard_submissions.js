const stdSubDataJSON = require('./standard_submissions.json');
const ptrnSubDataJSON = require('./patreon_submissions.json');
const stdSubData = mapFromJSON(stdSubDataJSON);
const ptrnSubData = mapFromJSON(ptrnSubDataJSON);

const fs = require('fs');

class TempData {

    constructor() {
        /**@type {number[]} */
        this.postAgeMillis = [];
        this.referenceDate = new Date(Date.now());
    }

    /**
     * 
     * @param {number} millis
     */
    addPostAge(millis) {
        this.postAgeMillis.push(millis);
    }

    /**
     * 
     * @returns {number}
     */
    averageAgeMillis() {
        let total = 0;
        for (let millis of this.postAgeMillis) {
            total += millis;
        }
        let average = total / this.postAgeMillis.length;
        return average;
    }

    /**
     * 
     * @returns {number}
     */
    averageAgeDays() {
        let days = Math.floor(this.averageAgeMillis() / (1000 * 60 * 60 * 24));
        return days;
    }

    /**
     * 
     * @returns {number}
     */
    averageAgeWeeks() {
        let weeks = Math.floor(this.averageAgeMillis() / (1000 * 60 * 60 * 24 * 7));
        return weeks
    }

    /**
     * 
     */
    averageAgeDaysIntoCurrentWeek() {
        return this.averageAgeDays() % 7;
    }

    reset() {
        this.postAgeMillis = [];
    }
}

const stdTempData = new TempData();
const ptrTempData = new TempData();

/**
 * 
 * @param {number} numPosts 
 * @param {number} numEntries 
 * @param {string} type 
 */
const addSpinData = (numPosts, numEntries, type) => {
    console.log(`[Data]: Logging Standard Submission Spin`);

    if (type === 'std_vod') {
        const dateMillis = Date.now();
        const dataDate = new Date(dateMillis);
        const dateString = `${dataDate.getMonth()}/${dataDate.getDate()}/${dataDate.getFullYear()}`;
        stdSubData.set(dateString, {
            currentDateMillis: dateMillis,
            averageWeeksOld: stdTempData.averageAgeWeeks(),
            averageDaysOld: stdTempData.averageAgeDays(),
            numPosts: numPosts,
            numEntries: numEntries
        });
        fs.writeFile('./data/standard_submissions.json', mapToJSON(stdSubData), (err) => { if (err) console.error(err); });
    } else if (type === 'ptr_vod') {
        const dateMillis = Date.now();
        const dataDate = new Date(dateMillis);
        const dateString = `${dataDate.getMonth()}/${dataDate.getDate()}/${dataDate.getFullYear()}`;
        ptrnSubData.set(dateString, {
            currentDateMillis: Date.now(),
            averageWeeksOld: ptrTempData.averageAgeWeeks(),
            averageDaysOld: ptrTempData.averageAgeDays(),
            numPosts: numPosts,
            numEntries: numEntries
        });
        fs.writeFile('./data/patreon_submissions.json', mapToJSON(ptrnSubData), (err) => { if (err) console.error(err); });
    }

}

const logAllCollectedData = () => {
    const sortedStandardData = mapToSortedArray(stdSubData);
    const sortedPatreonData = mapToSortedArray(ptrnSubData);

    let buf = [];
    console.log(sortedStandardData[0]);
    buf.push('[Data]: Logging All Data');

    buf.push('[Data]: Free VoD Forum Data:')
    for (const datum of sortedStandardData) {
        const dataDate = new Date(datum[1].currentDateMillis);
        buf.push(`   [${dataDate.getMonth()
            }/${dataDate.getDate()}/${dataDate.getFullYear()
            }]:\n      Posts: ${datum.numPosts
            }\n      Entries: ${datum.numEntries
            }\n      Average Post Age: ${datum.averageWeeksOld
            } weeks, ${datum.averageDaysOld % 7
            } days`);
    }

    buf.push('[Data]: Tier 3 Patreon VoD Forum Data:')
    for (const datum of sortedPatreonData) {
        const dataDate = new Date(datum[1].currentDateMillis);
        buf.push(`   [${dataDate.getMonth()
            }/${dataDate.getDate()}/${dataDate.getFullYear()
            }]:\n      Posts: ${datum.numPosts
            }\n      Entries: ${datum.numEntries
            }\n      Average Post Age: ${datum.averageWeeksOld
            } weeks, ${datum.averageDaysOld % 7
            } days`);
    }
    return buf.join('\n');
}

/**
 * 
 * @param {Map} map 
 * @returns {string}
 */
function mapToJSON(map) {
    let str = '';
    for (const key of map) {
        const newEntry = `"${key[0]}":${JSON.stringify(map.get(key[0]))},`
        str = `${str}${newEntry}`;
    }
    str = `{${str.substring(0, str.length - 1)}}`;
    return str
}

/**
 * 
 * @param {string} json 
 * @returns {Map}
 */
function mapFromJSON(json) {
    return new Map(Object.entries(json)) || new Map();
}

function mapToSortedArray(map) {
    let buf = [];
    for (const entry of map.entries()) {
        buf.push(entry);
    }
    buf.sort((a, b) => {
        return a[1].currentDateMillis - b[1].currentDateMillis;
    });
    return buf;
}

module.exports = {
    stdTempData: stdTempData,
    ptrTempData: ptrTempData,
    addSpinData,
    logAllCollectedData,
    mapToJSON,
    mapFromJSON
}