/* createInstruction builds the sequence of your instructions. each instruction slide
is an object to be pushed to the timeline. You'll mainly have to replace the value for
the stimulus property. The type will be "html-button-response" if you're using a button
or "html-keyboard-response" for keys. Check jsPsych to see more configurations. */

const createInstructions = function() {
timeline.push({
type: "html-keyboard-response",
  stimulus: "<p>Welcome to the experiment. This experiment requires your full attention. Before we begin, please maximize your browser window and turn off all notifications (Facebook, texts, etc.) on both your phone and computer.<br><br>While you take part in the experiment, please avoid switching tabs. If you leave the experiment tab multiple times, we will not be able to use your data.<br><br>When you're ready, press [space] to begin.</p>",
  choices: ['space'],
});

timeline.push({
  type: "html-keyboard-response",
  stimulus: `<div class='center'><h1>Simple RLWM task demo</h1>.<br><br><p>In this study, you will\
  see images on the screen. When you see an image appear, press the J, K, or L key to respond\
  to the image. Your goal is to learn which key corresponds to which image.</p></div>`+CONTINUE,
  choices: [32],
});
timeline.push({
  type: "html-keyboard-response",
  stimulus: `<div class='center'><p>After you press a key, you will receive feedback on whether\
  you pressed the correct key for that image. Specifically, you will receive +1 point if you were\
  correct, and 0 otherwise. There is only one correct key per image.</p></div>`+CONTINUE,
  choices: [32],
});
timeline.push({
  type: "html-keyboard-response",
  stimulus: `<div class='center'><p>You have 1 second to respond. If you don't respond in time, it \
  will be counted as a loss. Try to respond as quickly and accurately as possible!</p></div>`+CONTINUE,
  choices: [32],
});
timeline.push({
  type: "html-keyboard-response",
  stimulus: `<div class='center'><p>In this demo there are 2 blocks. You will see the images to learn\
  at the beginning of each block. Take some time to identify the images before the block begins.</p></div>`+CONTINUE,
  choices: [32],
});
}
