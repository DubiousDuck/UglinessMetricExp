//image list
var entries;
function loadImgData(){
    return new Promise(function(resolve, reject){
        $.ajax({ //remember, AJAX request is asynchronous
            url: 'image_list_AVA.csv',
            dataType: 'text',
            success: function(data) {
                entries = parseCSV(data);
                console.log(entries.length);
                resolve(entries);
            },
            error: function() {
                reject('Error loading CSV file.');
            }
        });
    });
}

function parseCSV(csv) {
    var lines = csv.split('\n');
    var result = [];

    for (var i = 1; i < lines.length-1; i++) {
        var currentLine = lines[i].split(',');
        var filename = currentLine[0]+'.jpg'; //extract only the index
        result.push(filename);
    }

    return result;
}  
loadImgData(); //somehow it doesn't work...
//img paths
const BLOCK_N = 1;
const IMG_FOLDER = "images/";
const IMG_FILES = [
    "221480.jpg",
    "12896.jpg",
    "214675.jpg"
];
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
        hide_instr_img,
        enter_fullscreen,
        "This study has 8 short parts. I will walk you through the first part now and explain the rest later."
    ],
    [
        show_placeHolder,
        false,
        "You will view " +
            TRIAL_NUM +
            " images, one at a time, as in the example below."
    ],
    [
        hide_placeHolder,
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
        startTask,
        false,
        "Great! You have completed the practice trials. Press ENTER to start for real!"
    ]
]; //the attributes are: pre_function, post_function, display text

function show_maximize_window(){
    $("#fullScreenImg").css("display", "block");
}

function hide_instr_img(){
    $("#fullScreenImg").css("display", "none");
}
function hide_placeHolder() {
    $("#displayImg").css("display", "none");
}

function show_placeHolder() {
    $("#displayImg").attr("src", IMG_FOLDER + "/Utility/Bubble 2.jpg");
    $("#displayImg").css("display", "block");
}

function show_mock_scale(){
    $("#mockRating").css("display", "flex");
}

function hide_mock_scale(){
    $("#mockRating").css("display", "none");
}
function show_consent() {
    $("#nextButton").css("display", "none");
    $("#consentBox").css("display", "block");
    $("#consentResponse").css("display", "block");
    $(document).keyup(function (e) {
        console.log("keypressed!");
        if (e.key == "Enter") {
            $(document).off("keyup");
            instr.next();
            $("#instrBox").css("display", "none");
            $("#consentBox").css("display", "none");
            console.log("it's me, Mario!");
        }
    });
}

let instr_options = {
    textBox: $("#instrBox"),
    textElement: $("#instrText"),
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

function startTask() {
    //task_options['subj'] = subj;
    $("#promptAdj").text(RANDOM_ADJ[part_num - 1]);
    task = new Task(task_options);
    $("#taskBox").show();
    //subj.detectVisibilityStart();
    task.trialList = shuffle_array(task.trialList);
    task.run(); //central function call for task to run
}

//the functions below are provided as member functions to be passed to the Task class
function taskUpdate(formal_trial, last, this_trial, next_trial, path) {
    //use formal_trial parameter to determine whether the trial is practice or formal
    task.stimName = this_trial;
    // $('#progressBar').text(task.progress);
    $("#taskImg").attr("src", path + this_trial);
    console.log(this_trial);
    if (formal_trial) {
        //the first time switched to formal, remind the participants that we are now switiching
        if (task.pracTrialN != 0 && task.trialNum == 1) {
            formalTrialNotice();
        }
    }
    if (!last) {
        $("#buffer-img").attr("src", path + next_trial);
    }
}

function formalTrialNotice() {
    instr.startTimer();
    listenToStartFormal();
    $("#taskBox").css("display", "none");
    $("#instrBox").css("display", "block");
}

function listenToStartFormal() {
    $(document).keyup(function (e) {
        if (e.key == "Enter") {
            $(document).off("keyup");
            $("#instrBox").css("display", "none");
            instr.next();
            $("#taskBox").css("display", "block");
            task.startTime = Date.now();
            console.log("it's me, Luigi!");
        }
    });
}

function rating() {
    $("#taskImg").show();
    $(".ratingButton").mouseup(function (event) {
        $(".ratingButton").unbind("mouseup");
        task.inView = check_fully_in_view($("#taskImg"));
        $("#taskImg").hide();
        let target = $(event.target).closest(".rating-button"); //choose the closest button to the pointer
        task.end(target.attr("value"));
    });
}

function endTask() {
    //subj.detectVisibilityEnd();
    if (part_num < BLOCK_N) interBlockRest();
    else endOfTrial();
    //task.save();
}

function interBlockRest() {
    $("#taskBox").css("display", "none");
    $("#instrBox").css("display", "block");
    $("#instrText").html(
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
            $("#instrBox").css("display", "none");
            startNextPart();
        }
    });
}
function startNextPart() {
    //increase block count and restart task
    if (part_num == 1) {
        task_options.pracTrialN = 0;
    }
    part_num += 1;
    startTask();
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
    updateFunc: taskUpdate,
    trialFunc: rating,
    endExptFunc: endTask,
    progressInfo: true
};

function endOfTrial() {
    //pull up question box
    $("#taskBox").hide();
    $("#questionBox").show();
}
//  ######  ##     ## ########        ## ########  ######  ########
// ##    ## ##     ## ##     ##       ## ##       ##    ##    ##
// ##       ##     ## ##     ##       ## ##       ##          ##
//  ######  ##     ## ########        ## ######   ##          ##
//       ## ##     ## ##     ## ##    ## ##       ##          ##
// ##    ## ##     ## ##     ## ##    ## ##       ##    ##    ##
//  ######   #######  ########   ######  ########  ######     ##

function submitQuestion() {
    const openQueNames = ["age", "problems"];
    const choiceNames = ["serious", "gender"];
    if (checkAnswered(openQueNames, choiceNames)) {
        $("#questionBox").css("display", "none");
        $("#debriefBox").css("display", "flex");
        $("#endingShortcut").hide();
    }
}

function checkAnswered(openEndedQue, choiceQue) {
    let allResponded = true;
    for (let q of openEndedQue) {
        let value = $("input[name=" + q + "]").val();
        if (value == "") {
            $("#" + q + "Warning").css("display", "block");
            allResponded = false;
        } else $("#" + q + "Warning").css("display", "none");
    }
    for (let q of choiceQue) {
        let value = $("input[name=" + q + "]:checked").val();
        if (value === undefined) {
            $("#" + q + "Warning").css("display", "block");
            allResponded = false;
        } else $("#" + q + "Warning").css("display", "none");
    }
    if ($("#problems").val() == ""){
        $("#problemsWarning").show();
        allResponded = false;
    }else $("#problemsWarning").hide();
    return allResponded;
}

function go_to_top(){
    $('html, body').animate({ scrollTop: 0 }, 'slow');
}

function go_to_completion_page(){
    exit_fullscreen();
}

function go_to_ending(){
    $("#instrBox").hide();
    $("#debriefBox").show();
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