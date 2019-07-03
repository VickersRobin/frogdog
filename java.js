// the sprite class is used mostly as a generic container for the individual type classes that we have,
// and is used to provide something of an abstraction layer to the movement and generation of the type
// objects. this class mostly contains methods to maintain a sprite in its lifecycle during the runtime
// of the game, and is responsible for moving and tracking a sprite object.

class Sprite {
  // takes in an object of the individual type class and stores a reference to it
  constructor(type) {
    this.type = type;
    this.cellsTakenUp = this.getCellElems();
    this.offBoard = false;
  }

  // this method is responsible for moving a sprite of any type by one cell, then updating the sprite's
  // properties in accordance with its movement
  move() {
    // if the sprite has no next cell and no trailing cell on the board and the sprite has already moved
    if (!this.type.$nextCell && !this.type.$trailingCell && !this.type.firstMove) {
      // then it's time to delete the sprite, so we set its offBoard property so that a later method can remove it
      this.offBoard = true;
    }
    // swapCells method does the actual moving of the sprite's divs
    this.swapCells();
    // updateObject method sets the new column numbers of the sprite, then...
    this.updateObject();
    // ...we update the cellsTakenUp array to hold the new divs
    this.cellsTakenUp = this.getCellElems();
    // also set the firstMove property to false, because the sprite just went through a move
    this.type.firstMove = false;
  }

  // simple method that just determines the new columns in which the sprite is bound
  updateObject() {
    // check for the direction that the sprite is moving in first
    if (this.type.direction == 'neg') {
      this.type.rightColNum--;
    }
    if (this.type.direction == 'pos') {
      this.type.rightColNum++;
    }
    this.type.leftColNum = this.type.rightColNum - this.type.spriteLength;
  }

  // this is where the real work of the move method takes place. this method checks for existence of
  // three important elements, and takes action appropriately
  swapCells() {
    // first we loop through the sprite's divs and check if any of them have a frogger id; i.e. frogger is 'on' them
    var $cellWithFrogger = null;
    var $nextCellForFrogger = null;
    for (var i = 0; i < this.cellsTakenUp.length; i++) {
      // checks existence of the current element, since it can be null
      var id = this.cellsTakenUp[i] ? this.cellsTakenUp[i].getAttribute('id'):null;
      // checks if the element has an id and if it contains 'frogger'
      if (id && id.includes('frogger')) {
        // if it does, store the element in a variable to be utilized later
        $cellWithFrogger = this.cellsTakenUp[i];
        // determine the next place the frogger should be moved based on the sprite's motion
        if (this.type.direction == 'neg') {
          $nextCellForFrogger = this.cellsTakenUp[i - 1];
        }
        if (this.type.direction == 'pos') {
          $nextCellForFrogger = this.cellsTakenUp[i + 1];
        }
      }
    }

   $(document).ready(function () {
                            $('#playButton').click(function () {                                
                                window.open('Player.html', "popupWindow", "width=265,height=360,scrollbars=yes");
                                $(this).attr('class', 'active');
                                $('#stopButton').attr('class', 'none');
                            });

                            $('#stopButton').click(function () {
                                $(this).attr('class', 'active');
                                $('#playButton').attr('class', 'none');                                    
                                localStorage.setItem("player", false);
                            });                                
                        });
    
    
    
    
    // nice variables to shorten the code
    var $next = this.type.$nextCell;
    var $remove = this.type.$trailingCell;
    var $leading = this.type.$leadingCell;

    // does the sprite have a target destination? does it have at least one div on the board?
    if (!$next && !$leading && !$remove) {
      // if it doesn't, then it does not exist on the playing field
      this.offBoard = true;
    // does the sprite have at least a trailing div on the board, even if it doesn't have a destination?
    } else if ((!$next && !$leading && $remove) || (!$next && $leading && $remove)) {
      // if it does, then we want to remove the trailing div, since the sprite is almost off the board
      this.offBoard = false;
      // remove the type's class from the current div
      var nextClass = $remove.getAttribute('class');
      var newClass = nextClass.replace((' ' + this.type.typeClass), '');
      $remove.setAttribute('class', newClass);
      // flip the isallowed attribute to the opposite of what it was
      $remove.dataset.isallowed = this.type.canBePlacedOn;
    // does the sprite have a destination even if it's missing a first and/or last div?
    } else if (($next && !$leading && !$remove) || ($next && $leading && !$remove)) {
      // if it does, then we want to add a new trailing div, since the sprite is just getting on the board
      this.offBoard = false;
      // add the type's class to the new div
      var nextClass = $next.getAttribute('class');
      $next.setAttribute('class', (nextClass + ' ' + this.type.typeClass));
      // set the isallowed attribute to what the type says it should be
      $next.dataset.isallowed = this.type.canHoldFrogger;
    // do all the sprites elements exist? aka is the sprite entirely on the board and not approaching the board's end?
    } else if ($next && $leading && $remove) {
      this.offBoard = false;
      // do a full move
      // get rid of remove
      var nextClass = $remove.getAttribute('class');
      var newClass = nextClass.replace((' ' + this.type.typeClass), '');
      $remove.setAttribute('class', newClass);
      $remove.dataset.isallowed = this.type.canBePlacedOn;
      // move leading to next
      var nextClass = $next.getAttribute('class');
      $next.setAttribute('class', (nextClass + ' ' + this.type.typeClass));
      $next.dataset.isallowed = this.type.canHoldFrogger;
    }

    // is the frogger on the current sprite and does it have somewhere to go?
    if ($cellWithFrogger && $nextCellForFrogger) {
      // if so, move it to the next one
      $cellWithFrogger.setAttribute('id', '');
      $nextCellForFrogger.setAttribute('id', 'frogger');
    }
    // the last if statement allows the frogger to be moved with the sprite, so that it will be moved with, for example,
    // the log that it's on. it's important to note two things here:
    // 1) if the frog reaches the end of the board while on a log, it will slip off the log into the river when the log
    //    disappears, 'killing' the frog
    // 2) if, by some miracle, the user manages to get the frog on a truck, it will still move with the truck because of
    //    the way we determined that the frog is there
  }

  // function that queries the DOM for the sprite's current bounding columns and rows and returns the appropriate cells
  // in an array. note that we don't check for existence of the cells here, because we're relying on other methods to do so.
  getCellElems() {
    // store all the elements in the row into an array to be traversed later
    var $allCells = $(('.cell-' + this.type.cellNum)).toArray();
    var toReturn = [];
    var dir = this.type.direction;
    var left = this.type.leftColNum;
    var right = this.type.rightColNum
    // loop through the aforementioned array and take only the elements within the bounding columns
    for (var i = (left); i < right; i++){
      toReturn.push($allCells[i]);
    }
    if (dir == 'neg') {
      this.type.$leadingCell = $allCells[left];
      this.type.$trailingCell = $allCells[right - 1];
      this.type.$nextCell = $allCells[left - 1];
    }
    if (dir == 'pos') {
      this.type.$leadingCell = $allCells[right - 1];
      this.type.$trailingCell = $allCells[left];
      this.type.$nextCell = $allCells[right];
    }
    return toReturn;
  }

  // utility method to get the status of the type object so that we can store it in the parent sprite's object
  isOffBoard() {
    return this.type.offBoard;
  }

}

// the truck class is designed to only store data about a truck type, and contains no methods beyond the constructor.
// the constructor accepts a creation type string so that we can generate the appropriate column numbers for the sprite
class Truck {
  constructor(randOrOrdered) {
    this.creationType = randOrOrdered;
    // canBePlacedOn indicates the type of cell that the sprite is supposed to go on, and is used to reset a div when
    // the sprite moves off of it
    this.canBePlacedOn = 'yes';
    // canHoldFrogger denotes whether or not a collision between a sprite and frogger is 'fatal' to frogger
    this.canHoldFrogger = 'no';
    // CSS class that every div a sprite rests on should have (just for styling)
    this.typeClass = 'truck';
    this.firstMove = false;
    this.spriteLength = 3;
    // generate a random number between 10 and 16 (inclusive) to denote a row number
    this.cellNum = getRandom(7, 10);
    // even row numbers move left; odds move right
    if (this.cellNum % 2 == 0) {
      this.direction = 'neg';
    } else {
      this.direction = 'pos';
    }
    if (randOrOrdered == 'rand') {
      this.rightColNum = getRandom(14, 4);
      // sprite starts off on the board
      this.offBoard = false;
    }
    if (randOrOrdered == 'ordered') {
      this.firstMove = true;
      // starts off off the board
      this.offBoard = true;
      if (this.direction == 'neg'){
        // non random, left moving sprite, so the first cell is the rightmost one on the board
        // right column number is 1 + spriteLength divs away from the board
        this.rightColNum = gridSize + 1 + this.spriteLength;
        this.$nextCell = $('.cell-' + (gridSize)).eq(this.cellNum);
      }
      if (this.direction == 'pos') {
        // non random, right moving sprite, so the first cell is the leftmost one on the board
        // right column number is 0 divs away from the board
        this.rightColNum = 0;
        this.$nextCell = $('.cell-1').eq(this.cellNum);
      }
    }
    // calculate the left column number based on the determined right column number
    this.leftColNum = this.rightColNum - this.spriteLength;
  }
}

// the log class is designed to only store data about a log type, and contains no methods beyond the constructor.
// the constructor accepts a creation type string so that we can generate the appropriate column numbers for the sprite
class Log {
  constructor(randOrOrdered) {
    this.creationType = randOrOrdered;
    // canBePlacedOn indicates the type of cell that the sprite is supposed to go on, and is used to reset a div when
    // the sprite moves off of it
    this.canBePlacedOn = 'no';
    // canHoldFrogger denotes whether or not a collision between a sprite and frogger is 'fatal' to frogger
    this.canHoldFrogger = 'yes';
    // CSS class that every div a sprite rests on should have (just for styling)
    this.typeClass = 'log';
    this.firstMove = false;
    this.spriteLength = 4;
    // generate a random number between 2 and 8 (inclusive) to denote a row number
    this.cellNum = getRandom(7, 2);
    // even row numbers move left; odds move right
    if (this.cellNum % 2 == 0) {
      this.direction = 'neg';
    } else {
      this.direction = 'pos';
    }

    if (randOrOrdered == 'rand') {
      this.rightColNum = getRandom(14, 4);
      // sprite starts off on the board
      this.offBoard = false;
    }
    if (randOrOrdered == 'ordered') {
      this.firstMove = true;
      // starts off off the board
      this.offBoard = true;
      if (this.direction == 'neg') {
        // non random, left moving sprite, so the first cell is the rightmost one on the board
        // right column number is 1 + spriteLength divs away from the board
        this.rightColNum = gridSize + 1 + this.spriteLength;
        this.$nextCell = $('.cell-' + (gridSize)).eq(this.cellNum);
      }
      if (this.direction == 'pos') {
        // non random, right moving sprite, so the first cell is the leftmost one on the board
        // right column number is 0 divs away from the board
        this.rightColNum = 0;
        this.$nextCell = $('.cell-1').eq(this.cellNum);
      }
    }
    // calculate the left column number based on the determined right column number
    this.leftColNum = this.rightColNum - this.spriteLength;
  }
}

var gridSize = 17;
var timer = 0;
var winsNeeded = 5;
var winCount = 0;
var lives = 3;
var userName = null;
var curLevel = 1;
var multiplier = 1;
var speed = 1000;

// references to important HTML elements
var $mainContainer = null;
var $body = null;
var $window = null;
var $startSquare = null;

// some less important HTML elements
var $nickname = null;
var $level = null;
var $lives = null;
var $winCount = null;
var $time = null;

// global variable to hold the current frogger element
var $frogger = null;

// variables to hold current state of trucks
var numTrucks = 0;
var maxTrucks = 10;
var allTrucks = [];

// variables to hold current state of logs
var numLogs = 0;
var maxLogs = 30;
var allLogs = [];

// ID's from setInterval calls
var timerID = null;
var moveTrucksID = null;
var checkTrucksID = null;
var moveLogsID = null;
var checkLogsID = null;
var checkFroggerID = null;
var showDataID = null;

// utility functions

// returns a random number within the given range and starting at the given offset
function getRandom(range, offset) {
  return (Math.floor((Math.random() * range) + offset));
}

// console.log('game-script.js linked!');
$(function() {
  // console.log('jQuery works!');
  // get all the parameters passed over from the index page; currently only need nickname
  getAllParameters();
  // get important elements and cache them
  $window = $(window);
  $mainContainer = $('.main-container').eq(0);
  $body = $('body').eq(0);
  $startSquare = $('.start').eq(0);

  // get and cache some more HTML elements
  $nickname = $('#nickname').eq(0);
  $level = $('#level').eq(0);
  $lives = $('#lives').eq(0);
  $winCount = $('#win-count').eq(0);
  $time = $('#time').eq(0);

  // set nickname paragraph using value gotten from the query string
  $nickname.text('nickname: ' + userName);

  // call the setupGame function
  setupGame();
  // call the playGame function
  playGame();
});

// this function simply sets the data paragraphs to the current play status
function showData() {
  $level.text('level: ' + curLevel);
  $lives.text('lives: ' + lives);
  $winCount.text('wins: ' + winCount);
  $time.text('time elapsed: ' + timer + ' seconds');
}

// this function generates the initial sprites that will be on the screen at the beginning of the round
function setupGame() {
  $window.on('keydown', checkKey);
  for (var i = 0; i < multiplier * maxTrucks; i++) {
    generateTruck('rand');
    numTrucks++;
  }
  for (var i = 0; i < multiplier * maxLogs; i++) {
    generateLog('rand');
    numLogs++;
  }
  // start a 'timer' using a setInterval call
  timerID = setInterval(function() {
    timer++;
  }, 1000);
}

// this function starts the gameplay by simply calling setInterval on important functions
function playGame() {
  moveTrucksID = setInterval(moveTrucks, speed);
  moveLogsID = setInterval(moveLogs, speed);
  checkTrucksID = setInterval(checkTrucks, speed);
  checkLogsID = setInterval(checkLogs, speed);
  checkFroggerID = setInterval(checkFrogger, 10);
  showDataID = setInterval(showData, 100);
}

// checks the current position of the frogger element to determine if the frogger has gone where
// it shouldn't or if it reached the finish line
function checkFrogger() {
  $frogger = $('#frogger');
    if ($frogger.attr('data-isallowed') == 'no') {
      doLoss();
    }
    if ($frogger.attr('class').includes('finish')){
      doWin();
    }
}

// gets all the parameters passed in to this page via the query string
function getAllParameters() {
  // get and parse the url
  var fullURL = window.location.href;
  // if there is no query string, simply exit gracefully
  if (!fullURL.includes('?')) {
    return;
  }
  var queryString = fullURL.split('?')[1];
  // split query string into an array of key-value pair strings
  var paramsAndVals = queryString.split('&');
  for (var i = 0; i < (paramsAndVals.length); i++) {
    var thisPair = paramsAndVals[i].split('=');
    // we only want the nickname, but we need to loop through all paramsAndVals
    // in case the query string was tampered with
    if (thisPair[0] == 'nickname') {
      userName = thisPair[1];
    }
  }
}

// simple utility function that loops through our array of truck Sprite objects and calls their move method
function moveTrucks() {
  for (var i = 0; i < allTrucks.length; i++) {
    allTrucks[i].move();
  }
}

// loops through our array of truck Sprite objects and deletes the objects that went off the board
// also responsible for generating new trucks when there aren't enough
function checkTrucks() {
  for (var i = 0; i < allTrucks.length; i++) {
    if (allTrucks[i].offBoard) {
      // remove it from the array
      allTrucks.splice(i, 1);
      numTrucks--;
    }
  }
  // loop through the difference between the number of sprites that we currently have and the desired amount
  // as determined by 1.5 times the maximum
  for (var i = numTrucks; i < (1.5 * multiplier * maxTrucks); i++) {
    generateTruck('ordered');
    numTrucks++;
  }
}

// simple utility function that loops through our array of log Sprite objects and calls their move method
function moveLogs() {
  for (var i = 0; i < allLogs.length; i++) {
    allLogs[i].move();
  }
}

// loops through our array of log Sprite objects and deletes the objects that went off the board
// also responsible for generating new logs when there aren't enough
function checkLogs() {
  for (var i = 0; i < allLogs.length; i++) {
    if (allLogs[i].offBoard) {
      // remove it from the array
      allLogs.splice(i, 1);
      numLogs--;
    }
  }
  // loop through the difference between the number of sprites that we currently have and the desired amount
  // as determined by 1.5 times the maximum
  for (var i = numLogs; i < (1.5 * multiplier * maxLogs); i++) {
    generateLog('ordered');
    numLogs++;
  }
}

// takes in a reference to a sprite type along with a string value determining whether we want a new sprite randomly
// placed on the screen or placed outside of the screen, then creates a new sprite type object using with the given
// creation method, then creates a new sprite object with the newly created type object, and returns the new sprite object
function generateSprite(spriteType, randOrOrdered) {
  var typeObj = new spriteType(randOrOrdered);
  var sprite = new Sprite(typeObj);
  sprite.type.parent = sprite;
  sprite.offBoard = sprite.isOffBoard();
  return sprite;
}

// determines if a new sprite type is allowed to be placed on the screen where it was randomly generated by checking
// the locations of all the other existing sprites of the same type
// takes in a sprite object and an array of objects of that sprite's type
function isValidPosition(sprite, allSprites) {
  // new sprite must be at least one div away from existing sprites on all sides
  var notAllowedRange = sprite.type.spriteLength + 1;
  for (var i = 0; i < allSprites.length; i++) {
    // get the difference of position of the new sprite's right column and that of the current existing one
    var diff = Math.abs(sprite.type.rightColNum - allSprites[i].type.rightColNum);
    // if the new one is within the allowed range and it's in the same row
    if (diff < notAllowedRange  && sprite.type.cellNum == allSprites[i].type.cellNum) {
      // this sprite is not allowed to be placed here
      return false;
    }
  }
  return true;
}

// function that is responsible for creating a new truck sprite object and ensuring its proper position
// takes one argument - a string value that denotes the creation type, random or ordered, of the truck
function generateTruck(randOrOrdered) {
  var thisTruck = generateSprite(Truck, randOrOrdered);
  var allGood = true;
  var count = 0;
  // check to see if the new truck sprite object is in a valid position
  // the allGood flag is just to exit the loop if the creation of 5 trucks didn't yield a valid position
  while (!isValidPosition(thisTruck, allTrucks) && allGood) {
    // do it all over again
    thisTruck = generateSprite(Truck, randOrOrdered);
    // keep track of how many times we created 'bad' trucks
    count++;
    // if we made 5 bad trucks
    if (count >= 5) {
      // get out
      allGood = false;
    }
  }
  // if we succesfully created a truck
  if (allGood) {
    // loop through the div elements it occupies
    for (var i = 0; i < thisTruck.cellsTakenUp.length; i++) {
      // if the current div exists; necessary for trucks created with the creation type of 'ordered'
      if (thisTruck.cellsTakenUp[i]){
        // set the div's isallowed attribute to whatever the truck type allows for
        thisTruck.cellsTakenUp[i].dataset.isallowed = thisTruck.type.canHoldFrogger;
        // add the truck's class to the div
        var curClass = thisTruck.cellsTakenUp[i].getAttribute('class');
        thisTruck.cellsTakenUp[i].setAttribute('class', (curClass + ' ' + thisTruck.type.typeClass));
      }
    }
    // add our new truck sprite to the array of all truck sprites
    allTrucks.push(thisTruck);
  }
}

// function that is responsible for creating a new log sprite object and ensuring its proper position
// takes one argument - a string value that denotes the creation type, random or ordered, of the log
function generateLog(randOrOrdered) {
  var thisLog = generateSprite(Log, randOrOrdered);
  var allGood = true;
  var count = 0;
  // check to see if the new log sprite object is in a valid position
  // the allGood flag is just to exit the loop if the creation of 5 logs didn't yield a valid position
  while (!isValidPosition(thisLog, allLogs) && allGood) {
    thisLog = generateSprite(Log, randOrOrdered);
    count++;
    // if we made 5 bad logs
    if (count >= 5) {
      // get out
      allGood = false;
    }
  }
  // if we succesfully created a log
  if (allGood) {
    // loop through the div elements it occupies
    for (var i = 0; i < thisLog.cellsTakenUp.length; i++) {
      // if the current div exists; necessary for logs created with the creation type of 'ordered'
      if (thisLog.cellsTakenUp[i]){
        // set the div's isallowed attribute to whatever the log type allows for
        thisLog.cellsTakenUp[i].dataset.isallowed = thisLog.type.canHoldFrogger;
        // add the log's class to the div
        var curClass = thisLog.cellsTakenUp[i].getAttribute('class');
        thisLog.cellsTakenUp[i].setAttribute('class', (curClass + ' ' + thisLog.type.typeClass));
      }
    }
    // add our new log sprite to the array of all log sprites
    allLogs.push(thisLog);
  }
}

// event handler for keypress. responsible for calling the proper functions to move the frogger div around
  function checkKey(e) {
    switch(e.key) {
      case 'ArrowRight':
        moveFroggerRight();
        break;
      case 'ArrowUp':
        moveFroggerUp();
        break;
      case 'ArrowLeft':
        moveFroggerLeft();
        break;
      case 'ArrowDown':
        moveFroggerDown();
        break;
      // easter egg time! pressing the 1 key 'pauses' the timer and truck movement/generation
      case '1':
        clearInterval(moveTrucksID);
        clearInterval(checkTrucksID);
        clearInterval(timerID);
        break;
      // pressing the 2 key 'pauses' the timer and log movement/generation
      case '2':
        clearInterval(moveLogsID);
        clearInterval(checkLogsID);
        clearInterval(timerID);
        break;
    }
  }

  // function that is called when the user moves the frogger to an area that it shouldn't be in
  function doLoss() {
    // user lost a life
    lives--;
    // change the containing element's CSS proerties to reflect a loss
    $mainContainer.css('border-color', 'white');
    $body.css('background', 'darkred');
    // disable the keydown event handler
    $(window).off('keydown', checkKey);
    // stop checking frogger's status
    clearInterval(checkFroggerID);
    // remove the frogger id from the current div so that we can reset it
    $('#frogger').attr('id', '');
    // do this all after one second
    setTimeout(function() {
      // move the frogger back to the beginning of the board
      $startSquare.attr('id', 'frogger');
      // turn on the keydown handler again
      $window.on('keydown', checkKey);
      // reset the containing elements' CSS
      $mainContainer.css('border-color', '');
      $body.css('background', '');
      // start checking frogger's status again
      checkFroggerID = setInterval(checkFrogger, 10);
    }, 1000);
    // if the user exhausted all their lives call the restartGame function to start over from the first level
    if (lives == 0) {
      displayLossPopup();
    }
  }

  // function that is called when the user succesfully moves the frogger to the finish zone
  function doWin() {
    winCount++;
    // add the frogger class to the div that the user landed on, so they know not to go there again
    var oldClass = $frogger.attr('class');
    var newClass = oldClass + ' frogger';
    $frogger.attr('class', newClass);
    // remove the frogger id from the div that the user landed on
    $frogger.attr('id', '');
    // start the user over again
    $startSquare.attr('id', 'frogger');
    // if the user got the frog to the end zone as many times as necessary to beat the level
    if (winCount == winsNeeded) {
      // throw some confetti on the screen
      $('.overlay').eq(0).css('background', 'url(assets/images/confetti.gif)');
      // move the user to the next level
      displayWinPopup();
    }
  }

  // needs work!!!
  function displayLossPopup() {
    // remove keydown event listener
    $(window).off('keydown', checkKey);
    // stop all running functions
    clearInterval(moveTrucksID);
    clearInterval(checkTrucksID);
    clearInterval(moveLogsID);
    clearInterval(checkLogsID);
    clearInterval(timerID);

    // hide the board's grid
    $mainContainer.children().hide();
    // show the winning popup div and add it to the main container, fading it in for effect
    var $popup = $('.popup-loss').eq(0);
    // set the popup's children's text fields
    $('#loss-popup-level').text(curLevel + '!');
    // add click event listener to popup's button
    $('#start-over').eq(0).on('click', restartGame);
    $mainContainer.append($popup);
    $popup.fadeIn(1500);
    // change flex property to vertically align the popup
    $mainContainer.css('align-items', 'center');
  }

  function restartGame() {
    clearAllCells();
    numTrucks = 0;
    numLogs = 0;
    allTrucks = [];
    allLogs = [];
    curLevel = 0;
    winCount = 0;
    timer = 0;
    multiplier = 1;
    speed = 1000;
    setupGame();
    playGame();
    var $popup = $('.popup-loss').eq(0);
    $body.append($popup);
    $popup.hide(100);
    $mainContainer.css('align-items', '');
    $mainContainer.children().show();
  }

  // needs work!!!
  function displayWinPopup() {
    // remove keydown event listener
    $(window).off('keydown', checkKey);
    // stop all running functions
    clearInterval(moveTrucksID);
    clearInterval(checkTrucksID);
    clearInterval(moveLogsID);
    clearInterval(checkLogsID);
    clearInterval(timerID);
    clearInterval(checkFroggerID);

    // hide the board's grid
    $mainContainer.children().hide();
    // show the winning popup div and add it to the main container, fading it in for effect
    var $popup = $('.popup-win').eq(0);
    // set the popup's children's text fields
    $('#win-popup-level').text(curLevel + '!');
    // add click event listener to popup's button
    $('#next-round').eq(0).on('click', advanceLevel);
    $mainContainer.append($popup);
    $popup.fadeIn(1500);
    // change flex property to vertically align the popup
    $mainContainer.css('align-items', 'center');
  }

  function advanceLevel() {
    clearAllCells();
    numTrucks = 0;
    numLogs = 0;
    allTrucks = [];
    allLogs = [];
    curLevel++;
    winCount = 0;
    timer = 0;
    (multiplier > 0.1) ? multiplier -= .1:multiplier = .1;
    (speed > 100) ? speed -= 100:speed = 100;
    setupGame();
    playGame();
    var $popup = $('.popup-win').eq(0);
    $body.append($popup);
    $popup.hide(100);
    $mainContainer.css('align-items', '');
    $mainContainer.children().show();
    // hide the confetti
    $('.overlay').eq(0).css('background', '');
  }

  // function that first queries the DOM for all elements with a class of cell, then loops through them all and removes
  // special classes
  function clearAllCells() {
    var $allCells = $('.cell');
    for (var i = 0; i < $allCells.length; i++) {
      var oldClass = $allCells[i].getAttribute('class');
      if (oldClass.includes('truck')){
        var newClass = oldClass.replace(' truck', '');
        $allCells[i].setAttribute('class', newClass);
      }
      if (oldClass.includes('log')){
        var newClass = oldClass.replace(' log', '');
        $allCells[i].setAttribute('class', newClass);
      }
      if (oldClass.includes('frogger')){
        var newClass = oldClass.replace(' frogger', '');
        $allCells[i].setAttribute('class', newClass);
      }
      if (oldClass.includes('street')) {
        $allCells[i].dataset.isallowed = 'yes';
      }
      if (oldClass.includes('river')) {
        $allCells[i].dataset.isallowed = 'no';
      }
    }
  }

  // function that actually moves the frogger id to the next div
  // takes in two arguments, representing the colum and cell of the next div so that we can look it up in the DOM
  function moveFrogger(nextCol, nextCell) {
    // build our column and row classes
    var nextColClass = '.column-' + nextCol;
    var nextCellClass = 'cell-' + nextCell;
    // do the lookup. nextCell - 1 because eq uses a zero based index
    var $nextEl = $(nextColClass).children().eq(nextCell-1);
    // check the validity of the next cell's position
    if ($nextEl.data('isallowed') == 'no' || $nextEl.attr('class').includes('frogger')) {
      doLoss();
      return;
    }
    // if it's a valid spot move the id
    $frogger.removeAttr('id');
    $nextEl.attr('id', 'frogger');
  }

  // helper function to get the column number of an element
  // note that this function only works if the column number class is the first class that has a dash in it
  function getCurrentColumn() {
    return (parseInt($frogger.parent().attr('class').split('-')[1]));
  }
  // helper function to get the row number of an element
  // note that this function only works if the cell number class is the first class that has a dash in it
  function getCurrentCell() {
    return (parseInt($frogger.attr('class').split('-')[1]));
  }

  // function that determines what the next element's coordinates should be if the user moved right
  // checks for the edge of the board and protects the user by just not doing anything if they moved off the board
  // calls the moveFrogger function with the computed coordinates for the next element
  function moveFroggerRight() {
    var curCol = getCurrentColumn();;
    var curCell = getCurrentCell();
    if (curCol == gridSize) {
      return;
    }
    var nextCol = curCol + 1;
    var nextCell = curCell;
    moveFrogger(nextCol, nextCell);
  }

  // function that determines what the next element's coordinates should be if the user moved left
  // checks for the edge of the board and protects the user by just not doing anything if they moved off the board
  // calls the moveFrogger function with the computed coordinates for the next element
  function moveFroggerLeft() {
    var curCol = getCurrentColumn();;
    var curCell = getCurrentCell();
    if (curCol == 1) {
      return;
    }
    var nextCol = curCol - 1;
    var nextCell = curCell;
    moveFrogger(nextCol, nextCell);
  }

  // function that determines what the next element's coordinates should be if the user moved up
  // checks for the edge of the board and protects the user by just not doing anything if they moved off the board
  // calls the moveFrogger function with the computed coordinates for the next element
  function moveFroggerUp() {
    var curCol = getCurrentColumn();;
    var curCell = getCurrentCell();
    if (curCell == 1) {
      return;
    }
    var nextCol = curCol;
    var nextCell = curCell - 1;
    moveFrogger(nextCol, nextCell);
  }

  // function that determines what the next element's coordinates should be if the user moved down
  // checks for the edge of the board and protects the user by just not doing anything if they moved off the board
  // calls the moveFrogger function with the computed coordinates for the next element
  function moveFroggerDown() {
    var curCol = getCurrentColumn();;
    var curCell = getCurrentCell();
    if (curCell == gridSize) {
      return;
    }
    var nextCol = curCol;
    var nextCell = curCell + 1;
    moveFrogger(nextCol, nextCell);
  }
