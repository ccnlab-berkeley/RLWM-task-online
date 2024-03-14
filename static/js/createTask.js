/* This file hosts different functions used to create the structure of your task.
These functions will ultimately call createTrial(), which actually pushes the trial
object to the timeline; additionally, they also set different parameters needed for
your trials. You can also push other trial objects to the timeline for introducing
a new block, or displaying how many points were earned. */

/*If you are importing a CSV, make sure this function takes an argument and returns
the updated timeline object. The argument is needed for promise chaining, and
the return statement is needed for the next then statement in your promise chain
when you run jsPsych.init.*/
const createPhase = function(csv) { // create a phase (e.g. training phase) of your task
  csv = csv.data;
  let seqs = {}; // convert 2D array into object
  seqs.allStims = csv[0];   // sequence of all stimuli across blocks
  seqs.corKey = csv[1];     // sequence of all correct key responses across blocks
  seqs.setSizes = csv[2];    // sequence of all set sizes across blocks
  seqs.allBlocks = csv[3];   // sequence of all block numbers across blocks
  seqs.imgFolders = csv[4]; // sequence of all image folders across blocks
  csv = [];

  for (b = 1; b < NUM_BLOCKS + 1; b++) { // to index starting at 1
    createBlock(b,seqs); // create each block based on condition, set size, and stim image set
  }

  /*This trial comes after the end of the last block, and serves as buffer to
  give the server time to save the final data file. At the end of the predetermined time,
  e.g. 5 seconds, you can call a callback function to then mail off the data.*/
  timeline.push({
    type: "html-keyboard-response",
    stimulus: "<div class='center'><p>Saving data... please do not close this window. This will take a few seconds. </p></div>",
    choices: jsPsych.NO_KEYS,
    trial_duration: 5000, // change this depending on how large your file is. you can also make this timeline.push part of a promise chain dependent on the outcome of a save function that returns a promise
    // on_finish: data => {yourDataUploadFn();},
  });

  /*This trial comes at the very end, where you direct your participant back to
  Sona, or the next part of the experiment. Make sure your redirect link has
  "id=${subjID}" appended at the very end.*/
  timeline.push({
    type: "html-keyboard-response",
    stimulus: `<div class='center'><p>Data saved. Click <a href='${END_LINK}?id=${subjID}'>here</a> to proceed to the next task.</p></div>`,
    choices: jsPsych.ALL_KEYS,
  });

  return timeline;
}

/*Create an experiment block. At the end of each block you will usually give
feedback to your participant, so you'll need to push a trial object containing
points or further instructions. This is a good place to save your data.*/

const createBlock = function(b,seqs) {
  // stimmap = dict where keys are stimuli and values are either the correct keys or the correct labels
  let bStart = seqs.allBlocks.indexOf(b);
  let setSize = seqs.setSizes[bStart];
  let folder = seqs.imgFolders[bStart];
  let numTrials = setSize * NUM_STIM_REPS;

  const setStim = function(trial) {
    let stim = "<div class='exp'><p>Take some time to identify the images below:</p><table class='center'>";
    for (s=1; s < setSize+1; s++) {
      if (s%3 == 1) stim += '<tr>'
      stim += `<td><img class="disp" src="${imgP}images${folder}/image${s}.png"></td>`;
      if (s%3 == 0) stim += '</tr>'
    }
    trial.stimulus = `${stim}</table></div>`+CONTINUE;
    return trial;
  }
  timeline.push({
    on_start: setStim,
    type: "html-keyboard-response",
    choices: [32],
    // you may want to make this timed so participants can't stay on this trial forever
  });

  for (t = 0; t < numTrials; t++) {
    timeline.push(fixation);
    let stim = seqs.allStims[bStart+t];
    let cor = seqs.corKey[bStart+t];
    createTrial(b,t,folder,stim,cor,bStart);
  }

  /*A helper function that updates points earned for that block. It also saves all of the
  data if it's the last block, or data for just that block if it's not the last block.*/
  const setPoints = function(trial) {
    if (b == d3.max(seqs.allBlocks)+1) { // if end of last block
      let toSave = jsPsych.data.get(); // save all of the data
      save_data_csv(file_name,allData); // call save function
    }
    else { // if not last block, just save data for that block
      let toSave = jsPsych.data.get().filter({block: b});
      let blockFileName = `${file_name}_block_${b}`;
      save_data_csv(blockFileName, toSave);
    }
    let pts = jsPsych.data.get().filter({block: b, correct: true}).count();
    console.log(pts);
    trial.stimulus = `<div class="center"><p>Total number of earned points: ${pts} out of ${numTrials}.</p>\
    <br><p>End of block - Please take a break!</p><br><p>Press space when \
    you're ready to move to the next block.</p></div>`;
  }

  // push block end points and instructions
  timeline.push({
    on_start: setPoints,
    type: "html-keyboard-response",
    choices: [32],
    // you may want to make this timed so participants can't wait on this trial forever
  });
}

/* createTrial() pushes your trial object to the timeline every time it'sc called.
Inside createTrial are two helper functions: setTrial(trial), which sets up the stimuli,
key_answer, and other parameters of your trial before the trial is presented, and
setData(data), which lets you adjust other parameters of your data upon the end of the trial.
You can also call your save function in setData.

Note: I don't advise saving per trial, especially not saving cumulative data: it
costs memory allocation and storage space on the server. */

const createTrial = function(b,t,folder,stim,cor,bStart) {

  const setTrial = function(trial) {
    console.log(folder);
    trial.stimulus = `<div class="exp"><img class="stim center" src="${imgP}images${folder}/image${stim}.png"></div>`;
    trial.key_answer = KEYS[cor];
    return trial;
  }
  const setData = function(data) {
    let answer = data.key_press;
    data.stimulus = stim;
    data.key_answer = cor;
    data.key_press = KEYS.indexOf(answer);
    return data;
  }

  let trial = {
    type: "categorize-html",
    correct_text: COR_FB,
    incorrect_text: INCOR_FB,
    on_start: setTrial,
    choices: KEYS,
    timeout_message: TO_MSG,
    trial_duration: TRIAL_DUR,
    feedback_duration: FB_DUR,
    on_finish: setData,
    show_stim_with_feedback: false,
    data: {
      set: folder,
      block: b,
      trial: t+1,
    }
  };
  timeline.push(trial);
}
