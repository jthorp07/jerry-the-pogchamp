const { mapToJSON, mapFromJSON } = require('./standard_submissions');
const stdJSON = require('./standard_submissions.json');
const std = mapFromJSON(stdJSON) || new Map();
let buf = [];
for (const entry of std.entries()) {
    buf.push(entry);
}
buf.sort((a, b) => {
    return a[1].currentDateMillis - b[1].currentDateMillis;
});

