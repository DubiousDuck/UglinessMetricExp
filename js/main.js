//img paths
const BLOCK_NUM = 3;
const IMG_FOLDER = 'images/';
const IMG_FILES = [
    'arepas.webp', 'chocolate.webp', 'Curry.jpeg', 'falafel.jpeg', 'omurice.jpeg', 'StinkyTofu.webp'
]
const PRAC_IMG = [
    '/Utility/Bottle 1.jpg', '/Utility/Bricks 1.jpg', 'Utility/Bubble 2.jpg', 'Utility/Building 2.jpg', 'Utility/Candle 1.jpg'
]

const TRIAL_NUM = IMG_FILES.length;
const RATING_PRACTICE_TRIAL_N = 5;
const RATING_PRACTICE_LIST = shuffle_array(PRAC_IMG);

let instr;

// #### ##    ##  ######  ######## ########
//  ##  ###   ## ##    ##    ##    ##     ##
//  ##  ####  ## ##          ##    ##     ##
//  ##  ## ## ##  ######     ##    ########
//  ##  ##  ####       ##    ##    ##   ##
//  ##  ##   ### ##    ##    ##    ##    ##
// #### ##    ##  ######     ##    ##     ##

const INSTRUCTIONS = [ //the text_id will determine which one to display
    [false, false, 'Thank you very much!<br /><br />This study will take about 60 minutes. Please read the instructions carefully, and avoid using the refresh or back buttons.'],
    [show_placeHolder, false, 'Throughout the study, images will be displayed on your screen like the one you are seeing now on the screen. If you can\'t see the blank image. Please contact me.'],
    [hide_placeHolder, false, 'In this study, we will show you '+TRIAL_NUM+' images, one at a time, along with an adjective. We are interested in how fitting you think the displayed adjective is to the image.'],
    [false, false, 'Seven options will be available below the images as seven buttons. Just click one of the options based on your experience.'],
    [show_consent, false, "You have finished reading the instruction. <br/> Press ENTER to continue."],
    [false, false, "We will start with some practice trials first. Please try your best completing them."],
    [false, show_practiceTrial, "Great! You have completed all the practice trials. Now we will start with formal trials. Press the button to start. Good luck!"],
    [false, resume_trial, '']
];//the attributes are: pre_function, post_function, display text

function hide_placeHolder() {
    $('#displayImg').css('display', 'none');
}

function show_placeHolder(){
    $('#displayImg').attr('src', IMG_FOLDER+'/Utility/intentionalBlank.png');
    $('#displayImg').css('display', 'block');
}

function show_consent(){
    $('#nextButton').css('display', 'none');
    $('#consentBox').css('display', 'block');
    $('#consentResponse').css('display', 'block');
    $(document).keyup(function(e){
        console.log('keypressed!');
        var keyNum = e.which;
        if(keyNum == 13){
            $(document).off("keyup");
            instr.next();
            $('#consentBox').css('display', 'none');
            $('#nextButton').css('display', 'block');
            //startTask();
        }
    })
}

function submit_quiz(){
    const ANSWER = $('input[name="quiz"]:checked').val();
    if (typeof(ANSWER)=='undefined'){
        $('#quizWarn').css("display", "block");
    }else if (ANSWER == "option2(correct)"){
        show_correct();
    }else{
        show_incorrect();
        console.log('incorrect!');
    }
}

let instr_options = {
    textBox: $('#instrBox'),
    textElement: $('#instrText'),
    arr: INSTRUCTIONS,
    quizConditions: ['onlyQ']
};

let block_cnt = 1;
function show_practiceTrial(){
    //startTask();
    $('#instrBox').css('display', 'none');
    $('#nextButton').css('display', 'none');
    console.log('checkpoint!');
    startTask(block_cnt);
}

function resume_trial(){
    $('#instrBox').css('display', 'none');
    $('#nextButton').css('display', 'none');
    $('#taskBox').css('display', 'block');
    //task.run();
}
// ########    ###     ######  ##    ##
//    ##      ## ##   ##    ## ##   ##
//    ##     ##   ##  ##       ##  ##
//    ##    ##     ##  ######  #####
//    ##    #########       ## ##  ##
//    ##    ##     ## ##    ## ##   ##
//    ##    ##     ##  ######  ##    ##

const TASK_TITLES = [
    'num',
    'date',
    'subjStartTime',
    'trialNum',
    'stimName',
    'inView',
    'response',
    'rt'
];

const TASK_PROMPTS = [ //for easy transition of prompts between blocks
    "How <em>cool</em> do you think this image is?",
    "How <em>gross</em> do you think this image is?",
    "How <em>ugly</em> do you think this image is?",
    "How <em>boring</em> do you think this image is?",
    "How <em>weird</em> do you think this image is?",
    "How <em>sad</em> do you think this image is?",
    "How <em>scary</em> do you think this image is?",
    "How <em>bad</em> do you think this image is?",
    "How <em>aesthetically pleasing</em> do you think this image is?"
]

function startTask(blockNum) {
    //task_options['subj'] = subj;
    generateTaskOption(blockNum);
    task = new Task(task_options);
    $('#taskBox').show();
    //subj.detectVisibilityStart();
    practiceOver = false;
    task.run(); //central function call for task to run
    console.log(blockNum);
}

//the functions below are provided as member functions to be passed to the Task class
function taskUpdate(formal_trial, last, this_trial, next_trial, path) {
    //use formal_trial parameter to determine whether the trial is practice or formal
    task.stimName = this_trial;
   // $('#progressBar').text(task.progress);
    $('#taskImg').attr('src', path + this_trial);
    console.log(this_trial);
    if (!formal_trial) 
        //if not formal trial, display practice trial prompt
        $('#trialPrompt').html("<h2>"+TASK_PROMPTS[0]+"</h2>") //.html will preserve the original tag
    else{
        //the first time switched to formal, remind the participants that we are now switiching
        if (!practiceOver && task.pracTrialN != 0){
            practiceOver = true;
            formalTrialNotice();
        }
        $('#trialPrompt').html("<h2>"+TASK_PROMPTS[block_cnt]+"</h2>")
        //display the appropriate prompt
    }
    if (!last) {
        $('#buffer-img').attr('src', path + next_trial);
    }
}

let practiceOver = false;

function formalTrialNotice(){
    $('#taskBox').css('display', 'none');
    $('#instrBox').css('display', 'block');
    $('#nextButton').css('display', 'block');
}

function rating() {
    $('#taskImg').show();
    $('.ratingButton').mouseup(
        function(event) {
            $('.ratingButton').unbind('mouseup');
            task.inView = check_fully_in_view($('#taskImg'));
            $('#taskImg').hide();
            let target = $(event.target).closest('.rating-button'); //choose the closest button to the pointer
            task.end(target.attr('value'));
        }
    );
}

function endTask(){
    //subj.detectVisibilityEnd();
    repeatTrial();
    //task.save();
}

function repeatTrial(){
    if (block_cnt < BLOCK_NUM){ //increase block count and restart task
        block_cnt+=1;
        startTask(block_cnt);
    }else endOfTrial();
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

function generateTaskOption(blockNum){ //redefining task_options every time
    task_options.pracTrialN = blockNum == 1? RATING_PRACTICE_TRIAL_N:0;
    let RANDOM_STIM_LIST = shuffle_array(IMG_FILES);
    task_options.trialList = RANDOM_STIM_LIST;
    task_options.pracList = blockNum == 1? RATING_PRACTICE_LIST:[];
}

function endOfTrial(){ //pull up question box
    $('#taskBox').hide();
    $('#questionBox').show();
}
//  ######  ##     ## ########        ## ########  ######  ########
// ##    ## ##     ## ##     ##       ## ##       ##    ##    ##
// ##       ##     ## ##     ##       ## ##       ##          ##
//  ######  ##     ## ########        ## ######   ##          ##
//       ## ##     ## ##     ## ##    ## ##       ##          ##
// ##    ## ##     ## ##     ## ##    ## ##       ##    ##    ##
//  ######   #######  ########   ######  ########  ######     ##

function submitQuestion(){
    const openQueNames=['age'];
    const choiceNames=['serious', 'easy', 'gender'];
    if(checkAnswered(openQueNames, choiceNames)){
        $('#questionBox').css('display', 'none');
        $('#debriefBox').css('display', 'block');
    }
}

function checkAnswered(openEndedQue, choiceQue){
    let allResponded = true;
    for(let q of openEndedQue){
        let value = $('input[name='+q+']').val();
        if(value==''){
            $('#'+q+'Warning').css('display', 'block');
            allResponded = false;
        }else $('#'+q+'Warning').css('display', 'none');
    }
    for(let q of choiceQue){
        let value = $('input[name='+q+']:checked').val();
        if(value=== undefined){
            $('#'+q+'Warning').css('display', 'block');
            allResponded = false;
        }else $('#'+q+'Warning').css('display', 'none');
    }
    return allResponded;
}
// ########  ########    ###    ########  ##    ##
// ##     ## ##         ## ##   ##     ##  ##  ##
// ##     ## ##        ##   ##  ##     ##   ####
// ########  ######   ##     ## ##     ##    ##
// ##   ##   ##       ######### ##     ##    ##
// ##    ##  ##       ##     ## ##     ##    ##
// ##     ## ######## ##     ## ########     ##

$(document).ready(function(){
    load_img(0, IMG_FOLDER, IMG_FILES);
    instr = new Instructions(instr_options);
    instr.start();
    console.log("Ready!");
})