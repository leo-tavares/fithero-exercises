const fs = require('fs');

const everkineticJson = require('./everkinetic-exercises.json');

const base = `${__dirname}/dist`;
if (!fs.existsSync(base)) {
  fs.mkdirSync(base);
}

/**
 * Ensure ids will be unique
 */
const hasDuplicates = arr => new Set(arr).size !== arr.length;
const exerciseList = everkineticJson.map(e => e.name);
if (hasDuplicates(exerciseList)) {
  throw Error('Found duplicated exercises!');
}

/**
 * Parse all muscles (primary and secondary) into muscles.json
 */

const muscleList = everkineticJson.reduce(
  (acc, e) => acc.concat(e.primary.concat(e.secondary)),
  []
);

const muscleSet = [...new Set(muscleList)];
const muscles = {};
muscleSet.sort().forEach(m => {
  muscles[`muscle__${m.split(' ').join('-')}`] = '';
});

fs.writeFileSync(`${base}/muscles.json`, JSON.stringify(muscles, null, 2));

/**
 * Parse id (we use everkinetic name) with titles (for english language file)
 */

// Parse name as id and title
const exerciseTitles = {};
everkineticJson.sort((a, b) => (a.name < b.name ? -1 : 1)).forEach(e => {
  exerciseTitles[`exercise__${e.name}`] = e.title;
});

fs.writeFileSync(
  `${base}/exerciseTitles.json`,
  JSON.stringify(exerciseTitles, null, 2)
);

/**
 * Generate the exercises.json we will use in the app
 */

const exercises = everkineticJson
  .sort(
    (a, b) =>
      exerciseTitles[`exercise__${a.name}`] <
      exerciseTitles[`exercise__${b.name}`]
        ? -1
        : 1
  )
  .map(e => ({
    id: e.name,
    primary: e.primary.map(m => m.split(' ').join('-')),
    secondary: e.secondary.map(m => m.split(' ').join('-')),
  }));

fs.writeFileSync(`${base}/exercises.json`, JSON.stringify(exercises, null, 2));
