//img paths
const BLOCK_N = 1;
const IMG_FOLDER = "images/";

const PRAC_IMG = [
    "Utility/Bottle 1.jpg",
    "Utility/Bricks 1.jpg",
    "Utility/Bubble 2.jpg",
    "Utility/Building 2.jpg",
    "Utility/Candle 1.jpg"
];

const TRIAL_NUM = IMG_FILES.length;
const RATING_PRACTICE_TRIAL_N = 5;
const RATING_PRACTICE_LIST = shuffle_array(PRAC_IMG);
let part_num = 1;

const NEG_ADJECTIVES = [
    "gross",
    "ugly",
    "boring",
    "weird",
    "sad",
    "scary",
    "bad"
]
let randomAdj = shuffle_array(NEG_ADJECTIVES);
randomAdj[randomAdj.length] = "aesthetically pleasing";
const RANDOM_ADJ = randomAdj;

let instr;

// #### ##    ##  ######  ######## ########
//  ##  ###   ## ##    ##    ##    ##     ##
//  ##  ####  ## ##          ##    ##     ##
//  ##  ## ## ##  ######     ##    ########
//  ##  ##  ####       ##    ##    ##   ##
//  ##  ##   ### ##    ##    ##    ##    ##
// #### ##    ##  ######     ##    ##     ##

const INSTRUCTIONS = [
    //the text_id will determine which one to display
    [
        false,
        false,
        "Thank you very much!<br /><br />This study will take about 60 minutes. Please read the instructions carefully, and avoid using the refresh or back button."
    ],
    [
        show_maximize_window,
        false,
        "For this study to work, the webpage will automatically switch to the full-screen view on the next page. Please stay in the full screen mode until the study automatically switches out from it."
    ],
    [
        hide_maximize_window,
        enter_fullscreen,
        "This study has 8 short parts. I will walk you through the first part now and explain the rest later."
    ],
    [
        show_instr_img,
        false,
        "You will view " +
            TRIAL_NUM +
            " images, one at a time, as in the example below."
    ],
    [
        hide_instr_img,
        show_mock_scale,
        "For the first part, I am interested in how <strong>" +
            RANDOM_ADJ[part_num - 1] +
            "</strong> you find each image is. You will rate the image using a seven-point scale, as in the example below."
    ],
    [
        hide_mock_scale,
        false,
        "In the later part, you will rate the images based on different aspects of your impression. But let's worry about it when it happens."
    ],
    [
        show_consent,
        false,
        "Now, you are ready for the first part.<br/><br/>Press ENTER to start a few pratice!"
    ],
    [
        start_practice,
        false,
        "Great! You have completed the practice trials. Press ENTER to start for real!"
    ]
]; //the attributes are: pre_function, post_function, display text

function show_maximize_window(){
    $("#full-screen-img").css("display", "block");
}

function hide_maximize_window(){
    $("#full-screen-img").css("display", "none");
}
function hide_instr_img() {
    $("#display-img").css("display", "none");
}

function show_instr_img() {
    $("#display-img").attr("src", IMG_FOLDER + "/Utility/Bubble 2.jpg");
    $("#display-img").css("display", "block");
}

function show_mock_scale(){
    $("#mock-rating").css("display", "flex");
}

function hide_mock_scale(){
    $("#mock-rating").css("display", "none");
}
function show_consent() {
    $("#next-button").css("display", "none");
    $("#consent-box").css("display", "block");
    $("#consentResponse").css("display", "block");
    $(document).keyup(function (e) {
        console.log("keypressed!");
        if (e.key == "Enter") {
            $(document).off("keyup");
            instr.next();
            $("#instr-box").css("display", "none");
            $("#consent-box").css("display", "none");
            console.log("it's me, Mario!");
        }
    });
}

let instr_options = {
    textBox: $("#instr-box"),
    textElement: $("#instr-text"),
    arr: INSTRUCTIONS,
    quizConditions: ["onlyQ"]
};

// ########    ###     ######  ##    ##
//    ##      ## ##   ##    ## ##   ##
//    ##     ##   ##  ##       ##  ##
//    ##    ##     ##  ######  #####
//    ##    #########       ## ##  ##
//    ##    ##     ## ##    ## ##   ##
//    ##    ##     ##  ######  ##    ##

const TASK_TITLES = [
    "num",
    "date",
    "subjStartTime",
    "trialNum",
    "stimName",
    "inView",
    "response",
    "rt"
];

function start_practice(){
    $("#prompt-adj").text(RANDOM_ADJ[0]);
    task = new Task(task_options);
    $("#task-box").show();
    task.trialList = shuffle_array(task.trialList);
    task.run();
}
function start_task() {
    //task_options['subj'] = subj;
    $("#prompt-adj").text(RANDOM_ADJ[part_num - 1]);
    task = new Task(task_options);
    $("#task-box").show();
    //subj.detectVisibilityStart();
    task.trialList = shuffle_array(task.trialList);
    task.run(); //central function call for task to run
}

//the functions below are provided as member functions to be passed to the Task class
function task_update(formal_trial, last, this_trial, next_trial, path) {
    //use formal_trial parameter to determine whether the trial is practice or formal
    task.stimName = this_trial;
    $('#part-num').text(part_num);
    $('#progressBar').text(task.progress);
    $("#task-img").attr("src", path + this_trial);
    console.log(this_trial);
    if (formal_trial) {
        //the first time switched to formal, remind the participants that we are now switiching
        if (task.pracTrialN != 0 && task.trialNum == 1) {
            formal_trial_notice();
        }
    }
    if (!last) {
        $("#buffer-img").attr("src", path + next_trial);
    }
}

function formal_trial_notice() {
    instr.startTimer();
    listen_to_start_formal();
    $("#task-box").css("display", "none");
    $("#instr-box").css("display", "block");
}

function listen_to_start_formal() {
    $(document).keyup(function (e) {
        if (e.key == "Enter") {
            $(document).off("keyup");
            $("#instr-box").css("display", "none");
            $("#task-box").css("display", "block");
            task.startTime = Date.now();
        }
    });
}

function rating() {
    $("#task-img").show();
    $(".ratingButton").mouseup(function (event) {
        $(".ratingButton").unbind("mouseup");
        task.inView = check_fully_in_view($("#task-img"));
        $("#task-img").hide();
        let target = $(event.target).closest(".rating-button"); //choose the closest button to the pointer
        task.end(target.attr("value"));
    });
}

function end_task() {
    //subj.detectVisibilityEnd();
    if (part_num < BLOCK_N) inter_block_rest();
    else end_of_trial();
    //task.save();
}

function inter_block_rest() {
    $("#task-box").css("display", "none");
    $("#instr-box").css("display", "block");
    $("#instr-text").html(
        "You have completed " +
            part_num +
            " out of " +
            BLOCK_N +
            " parts. Take a brief break if you wish.<br/><br/> Next, I am interested in how <em>" +
            RANDOM_ADJ[part_num] +
            "</em> you find each image is.<br/><br/> When you are ready, press ENTER to continue."
    );
    $(document).keyup(function (e) {
        console.log("keypressed!");
        if (e.key == "Enter") {
            $(document).off("keyup");
            $("#instr-box").css("display", "none");
            start_next_part();
        }
    });
}
function start_next_part() {
    //increase block count and restart task
    if (part_num == 1) {
        task_options.pracTrialN = 0;
    }
    part_num += 1;
    start_task();
}
let task_options = {
    titles: TASK_TITLES,
    pracTrialN: RATING_PRACTICE_TRIAL_N,
    trialN: TRIAL_NUM,
    // savingScript: SAVING_SCRIPT,
    // dataFile: RATING_FILE,
    stimPath: IMG_FOLDER,
    // savingDir: SAVING_DIR,
    trialList: IMG_FILES,
    pracList: RATING_PRACTICE_LIST,
    //intertrialInterval: INTERTRIAL_INTERVAL,
    updateFunc: task_update,
    trialFunc: rating,
    endExptFunc: end_task,
    progressInfo: true
};

function end_of_trial() {
    //pull up question box
    $("#task-box").hide();
    $("#question-box").show();
}
//  ######  ##     ## ########        ## ########  ######  ########
// ##    ## ##     ## ##     ##       ## ##       ##    ##    ##
// ##       ##     ## ##     ##       ## ##       ##          ##
//  ######  ##     ## ########        ## ######   ##          ##
//       ## ##     ## ##     ## ##    ## ##       ##          ##
// ##    ## ##     ## ##     ## ##    ## ##       ##    ##    ##
//  ######   #######  ########   ######  ########  ######     ##

function submit_question() {
    const openQueNames = ["age", "problems"];
    const choiceNames = ["serious", "gender"];
    if (check_answered(openQueNames, choiceNames)) {
        $("#question-box").css("display", "none");
        $("#debrief-box").css("display", "flex");
        $("#endingShortcut").hide();
    }
}

function check_answered(openEndedQue, choiceQue) {
    let allResponded = true;
    for (let q of openEndedQue) {
        let value = $("input[name=" + q + "]").val();
        if (value == "") {
            $("#" + q + "-warning").css("display", "block");
            allResponded = false;
        } else $("#" + q + "-warning").css("display", "none");
    }
    for (let q of choiceQue) {
        let value = $("input[name=" + q + "]:checked").val();
        if (value === undefined) {
            $("#" + q + "-warning").css("display", "block");
            allResponded = false;
        } else $("#" + q + "-warning").css("display", "none");
    }
    if ($("#problems").val() == ""){
        $("#problems-warming").show();
        allResponded = false;
    }else $("#problems-warming").hide();
    return allResponded;
}

function go_to_top(){
    $('html, body').animate({ scrollTop: 0 }, 'slow');
}

function go_to_completion_page(){
    exit_fullscreen();
}

function go_to_ending(){
    $("#instr-box").hide();
    $("#debrief-box").show();
    $("#endingShortcut").hide();
    $("#endingShortcut").hide();
}
// ########  ########    ###    ########  ##    ##
// ##     ## ##         ## ##   ##     ##  ##  ##
// ##     ## ##        ##   ##  ##     ##   ####
// ########  ######   ##     ## ##     ##    ##
// ##   ##   ##       ######### ##     ##    ##
// ##    ##  ##       ##     ## ##     ##    ##
// ##     ## ######## ##     ## ########     ##

$(document).ready(function () {
    load_img(0, IMG_FOLDER, IMG_FILES);
    instr = new Instructions(instr_options);
    instr.start();
});