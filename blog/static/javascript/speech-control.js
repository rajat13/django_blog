
var colors = {
    blog:'blog',
    aboutme:'aboutme',
    portfolio:'portfolio',
    back:'back',

};
var open=[]
var text=document.getElementById("speech");
var click = function (data) {
    if(!open.includes(data)){
        open.push(data);
        document.getElementById(data).click();
    }

}
var keys = Object.keys( colors );
var speech = new webkitSpeechRecognition();
speech.language = 'en-US';
speech.continuous = true;
speech.interimResults = true;
speech.onresult = function( e ) {
    ;
          var said = e.results[e.results.length - 1][0].transcript.toLowerCase();
          for (var i = keys.length - 1; i >= 0; i--) {
              var sanitized_said = said.trim().replace(' ', '');
              if (text!=null){
              text.innerText=sanitized_said;}
              if ((keys[i] === sanitized_said )){
                  if (keys[i] === 'back') {
                      window.history.back();
                  }
                  click(sanitized_said);
                  }
          }
          ;
      };

speech.start();
speech.onend=function () {
    speech.start();

}