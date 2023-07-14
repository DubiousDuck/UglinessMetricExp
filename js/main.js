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
const NEG_ADJECTIVES = [
    "gross",
    "ugly",
    "boring",
    "weird",
    "sad",
    "scary",
    "bad"
];
let random_adj = shuffle_array(NEG_ADJECTIVES);
random_adj[random_adj.length] = "aesthetically pleasing";
const RANDOM_ADJ = random_adj;
const INSTR_READING_TIME_MIN = 0.5;

let subj, instr, practice_task, task;

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
            RANDOM_ADJ[0] +
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
        false,
        false,
        "Great! You have completed the practice trials. Press ENTER to start for real!"
    ]
]; //the attributes are: pre_function, post_function, display text

function show_maximize_window() {
    $("#full-screen-img").css("display", "block");
}

function hide_maximize_window() {
    $("#full-screen-img").hide();
}
function hide_instr_img() {
    $("#display-img").hide();
}

function show_instr_img() {
    $("#display-img").attr("src", IMG_FOLDER + "/Utility/Bubble 2.jpg");
    $("#display-img").css("display", "block");
}

function show_mock_scale() {
    $("#mock-rating").css("display", "flex");
}

function hide_mock_scale() {
    $("#mock-rating").hide();
}
function show_consent() {
    $("#next-button").hide();
    $("#consent-box").show();
    $(document).keyup(function (e) {
        if (e.key == "Enter") {
            $(document).off("keyup");
            instr.next();
            $("#instr-box").hide();
            $("#consent-box").hide();
            start_task();
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

function start_task() {
    $("#prompt-adj").text(RANDOM_ADJ[subj.partNum - 1]);
    task_options["subj"] = subj;
    task = new Task(task_options);
    $("#task-box").show();
    subj.detectVisibilityStart();
    task.trialList = shuffle_array(task.trialList);
    task.run(); //central function call for task to run
}

//the functions below are provided as member functions to be passed to the Task class
function task_update(formal_trial, last, this_trial, next_trial, path) {
    //use formal_trial parameter to determine whether the trial is practice or formal
    task.stimName = this_trial;
    $("#part-num").text(subj.partNum);
    $("#progressBar").text(task.progress);
    $("#task-img").attr("src", path + this_trial);
    if (formal_trial) {
        //the first time switched to formal, remind the participants that we are now switching
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
    $("#task-box").hide();
    $("#instr-box").show();
}

function listen_to_start_formal() {
    $(document).keyup(function (e) {
        if (e.key == "Enter") {
            $(document).off("keyup");
            $("#instr-box").hide();
            $("#task-box").show();
            task.startTime = Date.now();
        }
    });
}

function rating() {
    $("#task-img").show();
    $(".rating-button").mouseup(function (event) {
        $(".rating-button").unbind("mouseup");
        task.inView = check_fully_in_view($("#task-img"));
        $("#task-img").hide();
        let target = $(event.target).closest(".rating-button"); //choose the closest button to the pointer
        task.end(target.attr("value"));
    });
}

function end_task() {
    task.save();
    if (subj.partNum < BLOCK_N) inter_block_rest();
    else end_of_task();
}

function inter_block_rest() {
    $("#task-box").hide();
    $("#instr-text").html(
        "You have completed " +
            subj.partNum +
            " out of " +
            BLOCK_N +
            " parts. Take a brief break if you wish.<br/><br/> Next, I am interested in how <em>" +
            RANDOM_ADJ[subj.partNum] +
            "</em> you find each image is.<br/><br/> When you are ready, press ENTER to continue."
    );
    $("#instr-box").show();
    $(document).keyup(function (e) {
        if (e.key == "Enter") {
            $(document).off("keyup");
            $("#instr-box").hide();
            start_next_part();
        }
    });
}
function start_next_part() {
    //increase block count and restart task
    subj.partNum += 1;
    if (subj.partNum == 2) {
        task_options.pracTrialN = 0;
    }
    start_task();
}

function end_of_task() {
    //pull up question box
    subj.detectVisibilityEnd();
    $("#task-box").hide();
    $("#question-box").show();
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

//  ######  ##     ## ########        ## ########  ######  ########
// ##    ## ##     ## ##     ##       ## ##       ##    ##    ##
// ##       ##     ## ##     ##       ## ##       ##          ##
//  ######  ##     ## ########        ## ######   ##          ##
//       ## ##     ## ##     ## ##    ## ##       ##          ##
// ##    ## ##     ## ##     ## ##    ## ##       ##    ##    ##
//  ######   #######  ########   ######  ########  ######     ##

const SUBJ_TITLES = [
    "subjNum",
    "startDate",
    "startTime",
    "id",
    "endTime",
    "duration",
    "instrReadingTimes",
    "quickReadingPageN",
    "hiddenCount",
    "hiddenDurations",
    "inView",
    "viewportW",
    "viewportH",
    "serious",
    "maximized",
    "problems",
    "age",
    "gender"
];

function submit_question() {
    let open_que_names = ["age", "problems"];
    let choice_names = ["serious", "gender"];
    if (check_answered(open_que_names, choice_names)) {
        $("#question-box").hide();
        for (let q of open_que_names) {
            subj[q] = $("#" + q)
                .val()
                .replace(/(?:\r\n|\r|\n)/g, "<br />");
        }
        subj.instrReadingTimes = JSON.stringify(instr.readingTimes);
        subj.quickReadingPageN = Object.values(instr.readingTimes).filter(
            (d) => d < INSTR_READING_TIME_MIN
        ).length;
        subj.submitAnswers();
        $("#debrief-box").css("display", "flex");
        $("#ending-shortcut").hide();
    }
}

function check_answered(open_ended_que, choice_que) {
    let all_responded = true;
    for (let q of open_ended_que) {
        let value = $("input[name=" + q + "]").val();
        if (value == "") {
            $("#" + q + "-warning").css("display", "block");
            all_responded = false;
        } else $("#" + q + "-warning").hide();
    }
    for (let q of choice_que) {
        let value = $("input[name=" + q + "]:checked").val();
        if (value === undefined) {
            $("#" + q + "-warning").css("display", "block");
            all_responded = false;
        } else $("#" + q + "-warning").hide();
    }
    if ($("#problems").val() == "") {
        $("#problems-warming").show();
        all_responded = false;
    } else $("#problems-warming").hide();
    return all_responded;
}

function go_to_top() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
}

function go_to_completion_page() {
    exit_fullscreen();
}

function go_to_ending() {
    $("#instr-box").hide();
    $("#debrief-box").show();
    $("#ending-shortcut").hide();
    $("#ending-shortcut").hide();
}

let subj_options = {
    subjNumScript: "", // XXX
    savingScript: "", // XXX
    subjNumFile: "", // XXX
    visitFile: "visit.txt", // XXX
    attritionFile: "attrition.txt", // XXX
    subjFile: "subj.txt", // XXX
    savingDir: "data/testing", // XXX
    titles: [""],
    viewportMinW: 0,
    viewportMinH: 0
};

// ########  ########    ###    ########  ##    ##
// ##     ## ##         ## ##   ##     ##  ##  ##
// ##     ## ##        ##   ##  ##     ##   ####
// ########  ######   ##     ## ##     ##    ##
// ##   ##   ##       ######### ##     ##    ##
// ##    ##  ##       ##     ## ##     ##    ##
// ##     ## ######## ##     ## ########     ##

$(document).ready(function () {
    load_img(0, IMG_FOLDER, IMG_FILES);
    subj = new Subject(subj_options);
    subj.partNum = 0;
    instr = new Instructions(instr_options);
    instr.start();
});
