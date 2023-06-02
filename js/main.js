//img paths
const imgFolder = 'images/';
const imgFiles = [
    'arepas.webp', 'chocolate.webp', 'Curry.jpeg', 'falafel.jpeg', 'omurice.jpeg', 'StinkyTofu.webp'
]

const randomImgList = shuffle_array(imgFiles);
const trialNum = randomImgList.length;

let instr;

// #### ##    ##  ######  ######## ########
//  ##  ###   ## ##    ##    ##    ##     ##
//  ##  ####  ## ##          ##    ##     ##
//  ##  ## ## ##  ######     ##    ########
//  ##  ##  ####       ##    ##    ##   ##
//  ##  ##   ### ##    ##    ##    ##    ##
// #### ##    ##  ######     ##    ##     ##

const INSTRUCTIONS = [ //the text_id will determine which one to display
    [false, false, 'Thank you very much!<br /><br />This study will take about 10 minutes. Please read the instructions carefully, and avoid using the refresh or back buttons.'],
    [show_placeHolder, false, 'Throughout the study, images will be displayed on your screen like the one you are seeing now on the screen. If you can\'t see the blank image. Please contact me.'],
    [hide_placeHolder, false, 'In this study, we will show you '+trialNum+' images, one at a time. We are interested in how appetizing you think is the food presented in each image.'],
    [false, false, 'Six options will be available below the images as six buttons. Just click one of the options based on your experience.'],
    [false, false, "The next page is a quick instruction quiz. <br/> (It's very simple!)"],
    [false, show_instrQuiz, ''],
    [show_consent, false, "That's correct! <br/> You can now begin the task by pressing <b>ENTER</b>. <br/>Good luck!"]
];//the attributes are: pre_function, post_function, display text

function hide_placeHolder() {
    $('#displayImg').css('display', 'none');
}

function show_placeHolder(){
    $('#displayImg').attr('src', imgFolder+'intentionalBlank.png');
    $('#displayImg').css('display', 'block');
}

function show_instrQuiz(){
    $('#instrQuiz').css('display', 'block');
    $('#instrBox').css('display', 'none');
    $('#nextButton').css('display', 'none');
}

function show_incorrect(){
    $('#instrQuiz').css('display', 'none');
    $('#instrText').text('That is not correct! Please read through the instructions again. Thank you.');
    $('#instrBox').css('display', 'block');
    instr.index = -1;
    $('#nextButton').css('display', 'block');
}
function show_correct(){
    $('#instrQuiz').css('display', 'none');
    instr.next();
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

function startTask() {
    //task_options['subj'] = subj;
    task = new Task(task_options);
    $('#taskBox').show();
    //subj.detectVisibilityStart();
    task.run();
}

function taskUpdate(formal_trial, last, this_trial, next_trial, path) {
    task.stimName = this_trial;
    $('#progressBar').text(task.progress);
    $('#taskImg').attr('src', path + this_trial);
    if (!last) {
        //$('#buffer-img').attr('src', path + next_trial);
    }
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
    $('#taskBox').hide();
    $('#questionBox').show();
    //task.save();
}
let task_options = {
    titles: TASK_TITLES,
    //pracTrialN: RATING_PRACTICE_TRIAL_N,
    trialN: trialNum,
    //savingScript: SAVING_SCRIPT,
    //dataFile: RATING_FILE,
    stimPath: imgFolder,
    //savingDir: SAVING_DIR,
    trialList: randomImgList,
    //pracList: RATING_PRACTICE_LIST,
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
    load_img(0, imgFolder, imgFiles);
    instr = new Instructions(instr_options);
    instr.start();
    console.log("Ready!");
})