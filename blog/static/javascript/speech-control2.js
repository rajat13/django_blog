function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}



function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


// listen to the mic, turns on the browser's mic if its not on
function resume() {
  $(".recording").css("background-color",'#a51a1a') ;
  isListening = true;
  annyang.resume();
}

// stop listening to the mic (but the browser is still listening)
function pause() {
  $(".recording").css("background-color", "grey");
  isListening = false;
  annyang.pause();
}

// turn off the browser's mic
function abort() {
  $(".recording").css("background-color", "grey");
  isListening = false;
  annyang.abort();
}

// this is important, dont know why
// but seems to let me set the default to US-english
// otherwise, it doesnt seem to work
// do this before other html5 speech synthesis
(function() {
  var defaultVoiceName = "Google US English";
  var msg = new SpeechSynthesisUtterance("starting");
  msg.voice = window.speechSynthesis.getVoices().filter(function(voice) {
    return voice.name == defaultVoiceName;
  })[0];
})();

// converts a js date to a time string with am/pm
function dateTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ampm;
  return strTime;
}

function jsonpGetter(url, jsonpcallback) {
  $.ajax({
    type: 'GET',
    url: url,
    async: false,
    jsonpCallback: jsonpcallback,
    contentType: "application/json",
    dataType: 'jsonp'
  });
}

// searches for giphy's
function giphy(term) {
  var xhr = $.get("https://api.giphy.com/v1/gifs/search?q=" + encodeURIComponent(term) + "&api_key=dc6zaTOxFJmzC&limit=5");
  xhr.done(function(results) {
    var string = "";
    $.each(results.data, function(index, gif) {
      string += "<iframe width='300' heigh='150' src='" + gif.embed_url + "'></iframe>";
    });
    respond("Here are giphy results for " + term, string);
  });
}

// responds to the duckduckgo results
function displayDuckduckgo(results) {
  console.log(results);
  var resultsHTML = "";
  var resultsArray = [];

  $.each(results.items, function(index, item) {
    if (item.htmlTitle) {
      resultsArray.push(item.htmlTitle + "</li>");
    }
    if (resultsArray.length > 10) {
      return false;
    }
  });

  if (resultsArray.length == 0) {
    respond("I couldn't find any results for \"" + globalTerm + "\"");
    return;
  }

  resultsHTML = "<ul>" + resultsArray.join("\n<li>") + "</ul>";

  respond("Here is search results for \"" + globalTerm + "\"", resultsHTML);
}



// dragon animation
function dragon() {
  respond("Dragons? What? Where?");

  $("#dragon").animate({
    right: "+=125%"
  }, 3500, function() {
    $("#dragon").addClass("flipped").show();
    setTimeout(function() {
      $("#dragon").animate({
        right: "-=125%"
      }, 2000, function() {
        $("#dragon").removeClass("flipped").show();
      });
    }, 1500);
  });
}

// press enter in the text box to say something
$('#testSpeech').keypress(function(event) {
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if (keycode == '13') {
    micInput($("#testSpeech").val());
  }
});

// press escape to turn on/off the mic
$(document).keyup(function(e) {
  var keycode = (e.keyCode ? e.keyCode : e.which);
  if (keycode == 27) {
    if (isListening) {
      abort();
    } else {
      resume();
    }
  }
});

// give your browser a voice
function speak(text, voiceName) {
  abort();
  if (!voiceName) {
    voiceName = "Google US English";
  }

  var msg = new SpeechSynthesisUtterance(text);
  console.log(msg);
  msg.voice = window.speechSynthesis.getVoices().filter(function(voice) {
    return voice.name == voiceName;
  })[0];
  speechSynthesis.speak(msg);
  msg.onend = resume;

}
var namespoke=false;
// displays words that should be read, delay added for effect
function respond(words, html) {

  //split by space
  var wordsArr = words.split(" ");
  console.log("speak it");
  $("#speech2").text("");
  $("#speechResults").text("");
console.log("proceeded");
  // speak the words
  speak(words);

  // go over each of the words, displaying each with a delay
  for (var i = 0; i < wordsArr.length; i++) {
    setTimeout(function(word, x) {
      $("#speech2").append(" " + word);

      // if this is the last item, append any html data we may want to display
      if (html && x == wordsArr.length - 1) {
        $("#speechResults").html(html);
      }

    }, (300 * (i + .5)), wordsArr[i], i);
  }

}

// this is the function that lets us fake mic input
function micInput(words) {
  annyang.getSpeechRecognizer().onresult(mockResult(words));
}

// annyang doesnt have a method of testing this without getting actual results, this allows for input from anything
function mockResult(sentence) {
console.log(sentence);
  var event = document.createEvent('CustomEvent');
  event.initCustomEvent('result', false, false, {
    'sentence': sentence
  });
  event.resultIndex = 0;
  event.results = {
    'length': function() {
      return 1;
    },
    0: {
      0: {
        'transcript': sentence,
        'confidence': 0.99,
      }
    }
  };
  Object.defineProperty(event.results[0], 'length', {
    get: function() {
      return 1;
    }
  });
  return event;
};

function noMatch(results) {
        console.log({
            missedResults: results
        });
        //$("#speech").text();
        $("#confused").fadeIn(3000, function () {
            setTimeout(function () {
                $("#confused").fadeOut("fast", function () {
                });
            }, 1500);

        });
        respond("I am not programmed to respond to \"" + results[0].trim() + "\"");
}
/*

END OF UTIL JS

*/

// click the text to repeat a message
$("#speech").on("click", function() {
  respond($("#speech").text());
});

// keep track of the listening state
var isListening;

// this keeps a global "search" or "keyword" for things that need to reference it
var globalTerm;
var user_name="";
var play_music=false;
var song_list=["goliyan","yaar","akhar"];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

if (annyang) {
  // Let's define a command.
  var commands = {
    'play music':function(){
      play_music=true;
      resultshtml="";resultshtml=resultshtml+("<ul>");
      for(var i=0;i<song_list.length;i++){

        resultshtml=resultshtml+("<li>"+song_list[i]+"</li>")
      }
      resultshtml=resultshtml+("</ul>");
      respond("Please select song",resultshtml);

    },
    'stop listening':function(){
      annyang.abort();
    },
    'hello': function() {
      respond('Hello world!');
    },

    'who am I': function() {
      respond('Oh '+user_name+', I know all about you, in fact, I probably know too much...');
    },

    ':term dragon': {
      'regexp': /^(.*)dragon(.*)$/,
      'callback': dragon
    },
    'sir mix alot': function() {
      respond("oh my god Becky, look at her butt");
    }
    ,
    'calculate :number times :number': function(x, y) {
      respond(x + " times " + y + " is " + parseInt(x) * parseInt(y));
    },

    ':number in binary': function(x) {
      respond(x + " in binary is " + parseInt(x).toString(2).split("").join(" "));
    },

    'what time is it': function() {
      var now = new Date();
      respond(dateTime(now));
    },

    'what month is it': function() {
      var now = new Date();
      respond("The current month is " + months[now.getMonth()]);
    },

    'what day is it': function() {
      var now = new Date();
      respond("The current day is " + days[now.getDay()]);
    },

    'search *tag': function(term) {
      globalTerm = term;
      jsonpGetter("https://www.googleapis.com/customsearch/v1?key=AIzaSyAmEVY6P4alwr96gpeaotXMggOECbBp3uU&\n" +
          "cx=014020295643958327062:hfg9xu-ya6i&q="+encodeURIComponent(term) + "&format=json", "displayDuckduckgo");
    },
      '*song':function(song_name){
      if(play_music==true){
        console.log(song_name);
        play_music=false;
      var results=[song_name];
        if(song_list.includes(song_name)) {
            setTimeout(function () {
                abort();
            }, 5000);
            respond('Playing ' + song_name + ' enjoy');
            var audio = document.getElementById("song_" + song_name);
            audio.play();
        }else{
        respond("Currently i do not have song " + song_name);
      }}
      else{
         if (namespoke==false) {
      user_name=song_name;
      namespoke=true;
      setCookie("django_blog",user_name,10);
      respond("Hello "+user_name+" Welcome, Try some commands such as search or play music");
    }
    else{
      respond("I am not programmed to respond to "+song_name);
    }
      }
      }
      ,
    ':term meme': {
      'regexp': /^(.*) meme$/,
      'callback': giphy
    },

    'giphy *tag': giphy,

    'help (me)': help,
    'examples': help,
    'example': help,

  };

  // in case we need help
  function help() {
    respond("Here is a list of things you can say: ", Object.keys(commands).join(" <br />"));
  }

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening.
  //annyang.start({continuous:false});
  isListening = true;

  // for debugging
  annyang.addCallback('resultNoMatch', noMatch);

  // greeting once everything starts up
  setTimeout(function() {
    var cookie = getCookie("django_blog");
    if(cookie!=""){
      user_name=cookie;
      namespoke=true;
      respond("Welcome Back "+user_name+" I recognize you , i am listening");
    }
    else{
      jsonpGetter("https://www.googleapis.com/customsearch/v1?key=AIzaSyAmEVY6P4alwr96gpeaotXMggOECbBp3uU&\n" +
          "cx=014020295643958327062:hfg9xu-ya6i&q="+encodeURIComponent("rajat goyal "+"amadeus labs linkedin") + "&format=json", "displayDuckduckgo");
    respond("Hi! My name is Indu , I am an Artificial Intelligence written by Rajat, Can u tell me your name?");
  }},1000)

}