// ######## ##     ## ########  ########
// ##        ##   ##  ##     ##    ##
// ##         ## ##   ##     ##    ##
// ######      ###    ########     ##
// ##         ## ##   ##           ##
// ##        ##   ##  ##           ##
// ######## ##     ## ##           ##

// data saving
const FORMAL = false; // XXX

const EXPERIMENT_NAME = "rating";
const SUBJ_NUM_SCRIPT = "php/subjNum.php";
const SAVING_SCRIPT = "php/save.php";
const VISIT_FILE = "visit_" + EXPERIMENT_NAME + ".txt";
const SUBJ_NUM_FILE = "subjNum_" + EXPERIMENT_NAME + ".txt";
const ATTRITION_FILE = "attrition_" + EXPERIMENT_NAME + ".txt";
const RATING_FILE = "rating_" + EXPERIMENT_NAME + ".txt";
const SUBJ_FILE = "subj_" + EXPERIMENT_NAME + ".txt";
const SAVING_DIR = FORMAL
    ? "/var/www-data-experiments/cvlstudy_data/OS/" +
      EXPERIMENT_NAME +
      "/formal"
    : "/var/www-data-experiments/cvlstudy_data/OS/" +
      EXPERIMENT_NAME +
      "/testing";
const ID_VARIABLE_NAME = "id";
const COMPLETION_URL = "XXX"; //XXX to be changed

// parameters
const BLOCK_N = 2; // XXX 8
const NEG_ADJECTIVES = [
    "gross",
    "ugly",
    "boring",
    "weird",
    "sad",
    "scary",
    "bad"
];
const RANDOM_ADJ = shuffle_array(NEG_ADJECTIVES);
RANDOM_ADJ.push("aesthetically pleasing");

// stimuli
const IMG_FOLDER = "cropped_images/";
const PRAC_IMG = [
    "Utility/Bottle 1.jpg",
    "Utility/Bricks 1.jpg",
    "Utility/Bubble 2.jpg",
    "Utility/Building 2.jpg",
    "Utility/Candle 1.jpg"
];
const RATING_PRACTICE_LIST = shuffle_array(PRAC_IMG);
const RATING_PRACTICE_TRIAL_N = RATING_PRACTICE_LIST.length;
const TRIAL_NUM = IMG_FILES.length;
const ALL_IMG_LIST = PRAC_IMG.concat(IMG_FILES);
const INTERTRIAL_INTERVAL = 0.5;

// criteria
const VIEWPORT_MIN_W = 800; // XXX
const VIEWPORT_MIN_H = 600; // XXX
const INSTR_READING_TIME_MIN = 0.3;
// object variables
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
        hide_instr_img,
        enter_fullscreen,
        "This study has 8 short parts. I will walk you through the first part now and explain the rest later."
    ],
    [
        show_example_img,
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
            "</strong> you find each image to be. You will rate the image using a scale, as in the example below."
    ],
    [
        hide_mock_scale,
        false,
        "In the later part, you will rate images based on different aspects of your impressions. But let's worry about it when it happens."
    ],
    [
        show_consent,
        false,
        "Now, you are ready for the first part.<br/><br/>Press ENTER to start a few pratice!"
    ],
    [
        false,
        false,
        "Great! You have completed the practice.<br/> Press ENTER to start for real!"
    ]
]; //the attributes are: pre_function, post_function, display text

function show_maximize_window() {
    $("#display-img").css("display", "block");
}

function hide_instr_img() {
    $("#display-img").hide();
}

function show_example_img() {
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
    listen_to_start_task();
}

function listen_to_start_task() {
    $(document).keyup(function (e) {
        if (e.key == "Enter") {
            $(document).off("keyup");
            instr.next();
            $("#instr-box").hide();
            $("#consent-box").hide();
            subj.saveAttrition();
            subj.detectVisibilityStart();
            task_options["subj"] = subj;
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
    task = new Task(task_options);
    $("#prompt-adj").text(RANDOM_ADJ[subj.partNum - 1]);
    $("#part-num").text(subj.partNum);
    $("#task-box").show();
    task.trialList = shuffle_array(task.trialList);
    task.run(); //central function call for task to run
}

//the functions below are provided as member functions to be passed to the Task class
function task_update(formal_trial, last, this_trial, next_trial, path) {
    //use formal_trial parameter to determine whether the trial is practice or formal
    task.stimName = this_trial;
    $("#progress-bar").text(task.progress);
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
    $("#task-box").hide();
    $("#instr-box").show();
    listen_to_start_formal();
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

function end_part() {
    task.save();
    if (subj.partNum < BLOCK_N) inter_block_rest();
    else end_task();
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
            "</em> you find each image to be.<br/><br/> When you are ready, press ENTER to continue."
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

function end_task() {
    //pull up question box
    subj.detectVisibilityEnd();
    $("#task-box").hide();
    $("#question-box").show();
}

let task_options = {
    titles: TASK_TITLES,
    pracTrialN: RATING_PRACTICE_TRIAL_N,
    trialN: TRIAL_NUM,
    savingScript: SAVING_SCRIPT,
    dataFile: RATING_FILE,
    stimPath: IMG_FOLDER,
    savingDir: SAVING_DIR,
    trialList: IMG_FILES,
    pracList: RATING_PRACTICE_LIST,
    intertrialInterval: INTERTRIAL_INTERVAL,
    updateFunc: task_update,
    trialFunc: rating,
    endExptFunc: end_part,
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

function update_task_object_subj_num() {
    if (typeof task !== "undefined") {
        task.num = subj.num;
    }
}

function submit_question() {
    let open_que_names = ["age"];
    let choice_names = ["serious", "gender", "maximized"];
    let non_input_names = ["problems"];
    if (check_answered(open_que_names, choice_names, non_input_names)) {
        $("#question-box").hide();
        exit_fullscreen();
        allow_selection();
        $("#debrief-box").css("display", "flex");
        go_to_top();

        for (let q of open_que_names) {
            subj[q] = $("input[name=" + q + "]")
                .val()
                .replace(/(?:\r\n|\r|\n)/g, "<br />");
        }
        for (let q of non_input_names) {
            subj[q] = $("#" + q)
                .val()
                .replace(/(?:\r\n|\r|\n)/g, "<br />");
        }
        subj.instrReadingTimes = JSON.stringify(instr.readingTimes);
        subj.quickReadingPageN = Object.values(instr.readingTimes).filter(
            (d) => d < INSTR_READING_TIME_MIN
        ).length;
        subj.submitAnswers();
    }
}

function check_answered(open_ended_que, choice_que, non_input_que) {
    let all_responded = true;
    for (let q of open_ended_que) {
        let value = $("input[name=" + q + "]").val();
        if (value == "") {
            $("#" + q + "-warning").css("display", "block");
            all_responded = false;
        } else {
            $("#" + q + "-warning").hide();
        }
    }
    for (let q of choice_que) {
        let value = $("input[name=" + q + "]:checked").val();
        if (value === undefined) {
            $("#" + q + "-warning").css("display", "block");
            all_responded = false;
        } else $("#" + q + "-warning").hide();
    }
    for (let q of non_input_que) {
        let val = $("#" + q).val();
        if (val == "") {
            $("#" + q + "-warning").css("display", "block");
            all_responded = false;
        } else $("#" + q + "-warning").hide();
    }

    return all_responded;
}

function allow_selection() {
    $("body").css({
        "-webkit-user-select": "text",
        "-moz-user-select": "text",
        "-ms-user-select": "text",
        "user-select": "text"
    });
}

function go_to_top() {
    $("html, body").animate({ scrollTop: 0 }, "fast");
}

function go_to_completion_page() {
    window.location.href = COMPLETION_URL + subj.id;
}

let subj_options = {
    titles: SUBJ_TITLES,
    viewportMinW: VIEWPORT_MIN_W,
    viewportMinH: VIEWPORT_MIN_H,
    subjNumCallback: update_task_object_subj_num,
    subjNumScript: SUBJ_NUM_SCRIPT,
    savingScript: SAVING_SCRIPT,
    subjNumFile: SUBJ_NUM_FILE,
    visitFile: VISIT_FILE,
    attritionFile: ATTRITION_FILE,
    subjFile: SUBJ_FILE,
    savingDir: SAVING_DIR
};

// ########  ########    ###    ########  ##    ##
// ##     ## ##         ## ##   ##     ##  ##  ##
// ##     ## ##        ##   ##  ##     ##   ####
// ########  ######   ##     ## ##     ##    ##
// ##   ##   ##       ######### ##     ##    ##
// ##    ##  ##       ##     ## ##     ##    ##
// ##     ## ######## ##     ## ########     ##

$(document).ready(function () {
    load_img(0, IMG_FOLDER, ALL_IMG_LIST);
    subj = new Subject(subj_options);
    subj.id = subj.getID(ID_VARIABLE_NAME);
    subj.partNum = 1;
    subj.saveVisit();
    if (subj.validID) {
        instr = new Instructions(instr_options);
        instr.start();
    } else {
        allow_selection();
        $("#instr-text").html(
            'ID ERROR: Please visit the experiment page again from the link provided on the website you signed up for the experiment. If you believe you have received this message in error, please contact the experimenter at oscar517730@g.ucla.edu with the message "ID-ERROR" .'
        );
        $("#next-button").hide();
    }
});
