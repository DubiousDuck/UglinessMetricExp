//img paths
const BLOCK_NUM = 8;
const IMG_FOLDER = 'images/';
const IMG_FILES = [
    'arepas.webp', 'chocolate.webp', 'Curry.jpeg', 'falafel.jpeg', 'omurice.jpeg', 'StinkyTofu.webp'
]
const PRAC_IMG = [
    'Bottle 1.jpg', 'Bricks 1.jpg', 'Bubble 2.jpg', 'Building 2.jpg', 'Candle 1.jpg'
]

const RANDOM_TRIAL_LIST = shuffle_array(IMG_FILES);
const TOTAL_TRIAL_LIST = concat_duplicated_array(RANDOM_TRIAL_LIST, 8);
const TRIAL_NUM = TOTAL_TRIAL_LIST.length;
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
    [false, false, "We will start with some practice trials first. Please try your best completing them."],
    [false, show_practiceTrial, "Great! You have completed all the practice trials. Now we will start with formal trials. Press the button to start. Good luck!"],
    [false, resume_trial, '']
];//the attributes are: pre_function, post_function, display text

function hide_placeHolder() {
    $('#displayImg').css('display', 'none');
}

function show_placeHolder(){
    $('#displayImg').attr('src', IMG_FOLDER+'intentionalBlank.png');
    $('#displayImg').css('display', 'block');
}

function show_consent(){
    $('#consentBox').css('display', 'block');
    $('#consentResponse').css('display', 'block');
    $(document).keyup(function(e){
        console.log('keypressed!');
        var keyNum = e.which;
        if(keyNum == 13){
            $(document).off("keyup");
            $('#instrBox').css('display', 'none');
            //why does the instrBox only contain one other block element?
            $('#consentBox').css('display', 'none');
            startTask();
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

function show_practiceTrial(){
    //startTask();
    $('#instrBox').css('display', 'none');
    $('#nextButton').css('display', 'none');
    console.log('checkpoint!');
    startTask();
}

function resume_trial(){
    $('#instrBox').css('display', 'none');
    $('#nextButton').css('display', 'none');
    $('#taskBox').css('display', 'block');
    task.run();
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
    "How cool do you think this image is?",
    "How \'adjective #1\' do you think this image is?",
    "How adjective #2 do you think this image is?",
    "How adjective #3 do you think this image is?",
    "How adjective #4 do you think this image is?",
    "How adjective #5 do you think this image is?",
    "How adjective #6 do you think this image is?",
    "How adjective #7 do you think this image is?",
    "How aesthetically pleasing do you think this image is?"
]

function startTask() {
    //task_options['subj'] = subj;
    task = new Task(task_options);
    $('#taskBox').show();
    //subj.detectVisibilityStart();
    practiceOver = false;
    task.run(); //central function call for task to run
    console.log(task.trialN);
}

//the functions below are provided as member functions to be passed to the Task class
function taskUpdate(formal_trial, last, this_trial, next_trial, path) {
    //use formal_trial parameter to determine whether the trial is practice or formal
    task.stimName = this_trial;
   // $('#progressBar').text(task.progress);
    $('#taskImg').attr('src', path + this_trial);

    if (!formal_trial) 
        //if not formal trial, display practice trial prompt
        $('#trialPrompt').html("<h2>"+TASK_PROMPTS[0]+"</h2>") //.html will preserve the original tag
    else{
        //the first time switched to formal, remind the participants that we are now switiching
        if (!practiceOver){
            practiceOver = true;
            formalTrialNotice();
        }
        $('#trialPrompt').html("<h2>"+TASK_PROMPTS[8]+"</h2>")
    }
    if (!last) {
        //$('#buffer-img').attr('src', path + next_trial);
    }
}

let practiceOver = false;

function formalTrialNotice(){
    console.log("now we begin the formal trial");
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
    //
    $('#taskBox').hide();
    $('#questionBox').show();
    //task.save();
}
let task_options = {
    titles: TASK_TITLES,
    pracTrialN: RATING_PRACTICE_TRIAL_N,
    trialN: TRIAL_NUM,
    // savingScript: SAVING_SCRIPT,
    // dataFile: RATING_FILE,
    stimPath: IMG_FOLDER,
    // savingDir: SAVING_DIR,
    trialList: TOTAL_TRIAL_LIST,
    pracList: RATING_PRACTICE_LIST,
    //intertrialInterval: INTERTRIAL_INTERVAL,
    updateFunc: taskUpdate,
    trialFunc: rating,
    endExptFunc: endTask,
    progressInfo: true
};

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