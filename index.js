const fs = require('fs');

const everkineticJson = require('./everkinetic-exercises.json');
const customJson = require('./custom-exercises.json');

const dataJson = everkineticJson.concat(customJson);

const base = `${__dirname}/dist`;
if (!fs.existsSync(base)) {
  fs.mkdirSync(base);
}

/**
 * Ensure ids will be unique
 */
const hasDuplicates = arr => new Set(arr).size !== arr.length;
const exerciseName = dataJson.map(e => e.name);
const exerciseTitle = dataJson.map(e => e.title);
if (hasDuplicates(exerciseName) || hasDuplicates(exerciseTitle)) {
  throw Error('Found duplicated exercises!');
}

/**
 * New muscles map
 */

const musclesMap = {
  abdominals: 'abs',
  back: 'back',
  biceps: 'biceps',
  'biceps-brachii': 'biceps',
  core: 'core',
  deltoid: 'shoulders',
  'deltoideus-(clavicula)': 'shoulders',
  'erector-spinae': 'hamstrings',
  forearm: 'forearms',
  gastrocnemius: 'calves',
  'glutaeus-maximus': 'glutes',
  'hip-abductors': 'abductors',
  'ischiocrural-muscles': 'hamstrings',
  'latissimus-dorsi': 'lats',
  obliques: 'abs',
  'pectoralis-major': 'chest',
  quadriceps: 'quadriceps',
  soleus: 'calves',
  shoulders: 'shoulders',
  trapezius: 'traps',
  'triceps-brachii': 'triceps',
  triceps: 'triceps',
  'upper-back': 'back',
};

/**
 * Parse all muscles (primary and secondary) into muscles.json
 */

const muscleNames = {
  muscle__abductors: 'Abductors',
  muscle__abs: 'Abs',
  muscle__arms: 'Arms', // Custom main category
  muscle__back: 'Back',
  muscle__biceps: 'Biceps',
  muscle__calves: 'Calves',
  muscle__chest: 'Chest',
  muscle__core: 'Core',
  muscle__forearms: 'Forearms',
  muscle__glutes: 'Glutes',
  muscle__hamstrings: 'Hamstrings',
  muscle__lats: 'Lats',
  muscle__legs: 'Legs', // Custom main category
  muscle__quadriceps: 'Quadriceps',
  muscle__shoulders: 'Shoulders',
  muscle__traps: 'Traps',
  muscle__triceps: 'Triceps',
};

const muscleList = dataJson.reduce(
  (acc, e) => acc.concat(e.primary.concat(e.secondary)),
  []
);

const muscleSet = [...new Set(muscleList)];

muscleSet.forEach(m => {
  const muscle = musclesMap[m.split(' ').join('-')];
  const key = `muscle__${muscle}`;
  if (!muscleNames[key]) {
    throw Error('Cannot find muscle name');
  }
});

fs.writeFileSync(`${base}/muscles.json`, JSON.stringify(muscleNames, null, 2));

/**
 * Parse id (we use everkinetic name) with titles (for english language file)
 */

// Parse name as id and title
const exerciseTitles = {};
dataJson
  .sort((a, b) => (a.name < b.name ? -1 : 1))
  .forEach(e => {
    exerciseTitles[`exercise__${e.name}`] = e.title;
  });

fs.writeFileSync(
  `${base}/exerciseTitles.json`,
  JSON.stringify(exerciseTitles, null, 2)
);

/**
 * Generate the exercises.json we will use in the app
 */

const exercises = dataJson
  .sort((a, b) =>
    exerciseTitles[`exercise__${a.name}`] <
    exerciseTitles[`exercise__${b.name}`]
      ? -1
      : 1
  )
  .map(e => ({
    id: e.name,
    notes: e.steps ? e.steps.join(' ') : '',
    primary: [
      ...new Set(e.primary.map(m => musclesMap[m.split(' ').join('-')])),
    ],
    secondary: [
      ...new Set(e.secondary.map(m => musclesMap[m.split(' ').join('-')])),
    ],
  }));

fs.writeFileSync(`${base}/exercises.json`, JSON.stringify(exercises, null, 2));

/**
 * Generate index.js
 */

fs.writeFileSync(
  `${base}/index.js`,
  `const exercises = require('./exercises.json');
const exercisesTitles = require('./exerciseTitles.json');
const muscles = require('./muscles.json');

module.exports = {
  exercises,
  exercisesTitles,
  muscles,
};
`
);
