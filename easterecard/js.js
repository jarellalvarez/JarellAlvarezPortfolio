var underplace = document.querySelector("#under");
var hinttext = document.querySelector("#hinttext");
var underish = document.getElementById("underneath");
var returnunder = document.getElementById("underreturn");
var resetbut = document.getElementById("reset");
var changenight = document.getElementById("night");
var flowbut = document.getElementById("nightmode");
var night = document.getElementById("turnnight");
var canvascolor = document.getElementById("canvascolor");
var sky = document.getElementById("sky");
var score1 = document.getElementById("score");
var entdoggyhouse = document.getElementById("dog");
var doggyhouse = document.getElementById("doggyhouse");
var backdog = document.getElementById("backdog");
var buts = document.getElementById("buts");
var cloud = document.getElementById("cloud2");
var nameHodge = document.getElementById("nameHodge");
var picname = document.getElementById("picname");
var songname = document.getElementById("songname");
var songbut = document.getElementById("songbut");
var defaultdisp = document.getElementById("defaultdisp");
var hardmodetext = document.getElementById("hardmodetext");

var aud = document.getElementById("player");
var playbut =  document.getElementById("playbut");
var pausebut =  document.getElementById("pausebut");
var forwardbut =  document.getElementById("forwardbut");
var nextbut =  document.getElementById("nextbut");

var nextbut =  document.getElementById("nextbut");
var hardegg1 =  document.getElementById("hardegg1");
var hardegg2 =  document.getElementById("hardegg2");
var hardegg3 =  document.getElementById("hardegg3");
var hardegg4 =  document.getElementById("hardegg4");
var hardegg5 =  document.getElementById("hardegg5");

var botbasket = document.getElementById("botbasket");
var hbotbasket = document.getElementById("hbotbasket");
var pictbut = document.getElementById("pictbut");
var apphard = document.getElementById("apphard");

var score = 2000;
var eggscore = 100;
var easteggscore = 500;

 var eggs = [
    document.getElementById("egg1"),
    document.getElementById("egg2"),
    document.getElementById("egg3"),
    document.getElementById("egg4"),
    document.getElementById("eggbask1"),
    document.getElementById("eggbask2"),
    document.getElementById("eggbask3"),
    document.getElementById("eggbask4"),
    document.getElementById("eggbask5"),
    document.getElementById("golden"),
    document.getElementById("goldegg2"),
 ]

 var image = document.getElementById("display");
 var home = document.getElementById("homebut");
 var home = document.getElementById("cover");


 var facts = [
  "1. Easter is the celebration of the resurrection of Jesus Christ in the Christian religion.",
  "2. Eggs have been seen as ancient symbol of fertility, while springtime is considered to bring new life and rebirth",
  "3. Americans spend $1.9 billion on Easter candy. That&#39s the second biggest candy holiday after Halloween",
  "4. 70% of Easter candy purchased is chocolate.",
  "5. 76% of Americans think the ears of a chocolate bunny should be the first to be eaten."
 ]

 var aud_arry = [
   "audio1.mp3",
   "audio2.mp3",
   "audio3.mp3"
];

var img_arry = [
   "http://lovelace-media.imgix.net/uploads/210/1f7306b0-ec5c-0132-99d1-0e972b0ec8fd.gif",
   "https://media.giphy.com/media/T7kKcENcq6TNm/giphy.gif",
   "https://media.giphy.com/media/TAqYM2x2WHoT6/giphy.gif"
]

 var num = -1;




  eggs[0].addEventListener("click", clickEgg1, false);
  eggs[1].addEventListener("click", clickEgg2, false);
  eggs[2].addEventListener("click", clickEgg3, false);
  eggs[3].addEventListener("click", clickEgg4, false);
  eggs[10].addEventListener("click", clickEgg5, false);
  underplace.addEventListener("click", undershadow, false);
  underreturn.addEventListener("click", underret, false);
  homebut.addEventListener("click", buthome, false);
  resetbut.addEventListener("click", butreset, false);
  flowbut.addEventListener("click", mooneggs, false);
  night.addEventListener("click", turnnightn, false);
  entdoggyhouse.addEventListener("click", enterdog, false);
  backdog.addEventListener("click", dogback, false);
  nextbut.addEventListener("click", nextbutt, false);



  playbut.onclick = function() {
    console.log('hey');
    imgdisp.src = img_arry[num];
    aud.src = aud_arry[num];
    aud.play();
    pausebut.style.display = "block";
    playbut.style.display = "none";
  }

  function nextbutt() {
    num++;

    if (num > aud_arry.length - 1){
      num = 0;

    }
    imgdisp.src = img_arry[num];
    aud.src = aud_arry[num];
    aud.play();
    console.log(num);
    pausebut.style.display = "none";
    playbut.style.display = "block";
  }

  pausebut.onclick = function() {
    aud.pause();
    pausebut.style.display = "none";
    playbut.style.display = "block";
  }

  backbut.onclick = function() {
    num--;

    if (num < 0){
      num = aud_arry.length-1;
    }
    imgdisp.src = img_arry[num];
    aud.src = aud_arry[num];
    aud.play();
    pausebut.style.display = "none";
    playbut.style.display = "block";
}

    songbut.onclick = function() {
      aud_arry.push(songname.value);
      songname.value = "";
    }

    pictbut.onclick = function()
    {
      img_arry.push(picname.value);
      picname.value = "";
    }






   function clickEgg1() {
  console.log("egg1");
   var fact1 = document.createElement('h2');
   fact1.innerHTML=facts[0];
   eggs[0].style.display="none";
   eggs[4].style.display="block";
   disp.appendChild(fact1);
   score = score - eggscore;

   score1.innerHTML=score + "/1000";

   };

   function clickEgg2() {
     console.log("egg2");
   var fact2 = document.createElement('h2');
   fact2.innerHTML=facts[1];
   eggs[1].style.display="none";
   eggs[5].style.display="block";
   disp.appendChild(fact2);
   score = score - eggscore;

   score1.innerHTML=score + "/2000";
   };

   function clickEgg3() {
     console.log("egg3");
   var fact3 = document.createElement('h2');
   fact3.innerHTML=facts[2];
   eggs[2].style.display="none";
   eggs[6].style.display="block";
   disp.appendChild(fact3);
   score = score - eggscore;

   score1.innerHTML=score + "/2000";
   };

   function clickEgg4() {
     console.log("egg4");
   var fact4 = document.createElement('h2');
   fact4.innerHTML=facts[3];
   eggs[3].style.display="none";
   eggs[7].style.display="block";
   disp.appendChild(fact4);
   score = score - eggscore;

   score1.innerHTML=score + "/2000";
   };

   function clickEgg5() {
   var fact5 = document.createElement('h2');
   console.log("egg5");
   fact5.innerHTML=facts[4];
   eggs[10].style.display="none";
   eggs[9].style.display="block";
   disp.appendChild(fact5);
   score = score - eggscore;

   score1.innerHTML=score + "/2000";
   };

   function undershadow() {
     underneath.style.display= "block";
     buts.style.display="none";
     nameHodge.style.display="none";
     hardmodetext.style.display="none";
     hinttext.style.display="none";
   }

   function underret() {
     underneath.style.display= "none";
     buts.style.display="block";
   }

   function buthome(){
     cover.style.display="none";
     hardmodetext.style.display="block";

   }

   function butreset(){
     location.reload();
   }

   function mooneggs(){
     night.style.display="block";

   }

  function turnnightn(){

     canvascolor.style.backgroundColor="#292631";
     night.style.display="none";
     changenight.style.display="block";
     sky.style.display="none";
     eggs[8].style.display="block";
     console.log("hey");
    score = score - easteggscore;

   score1.innerHTML=score + "/2000";

   }

   function enterdog() {
     doggyhouse.style.display="block";
     picname.style.display="block";
     songname.style.display="block";
     aud.style.display="block";
     imgdisp.style.display="block";
     defaultdisp.style.display="block";
     hardmodetext.style.display="none";
     hinttext.style.display="none";
   }

   function dogback() {
     doggyhouse.style.display="none";
     nameHodge.style.display="none";
     picname.style.display="none";
     songname.style.display="none";
     aud.style.display="none";
     imgdisp.style.display="none";
     defaultdisp.style.display="none";
     hardmodetext.style.display="none";
     hinttext.style.display="none";
   }

    cloud.onclick = function() {
     nameHodge.style.display="block";
     score = score - easteggscore;
    score1.innerHTML=score + "/2000";
     cloud.style.display = "none";

   }
   apphard.onclick = function() {

        underneath.style.display= "none";
        buts.style.display="block";
        eggs[0].style.display="none";
        eggs[1].style.display="none";
        eggs[2].style.display="none";
        eggs[3].style.display="none";
        eggs[4].style.display="none";
        eggs[5].style.display="none";
        eggs[6].style.display="none";
        eggs[7].style.display="none";
        eggs[8].style.display="none";
        eggs[9].style.display="none";
        eggs[10].style.display="none";
        hbotbasket.style.display="block";
        botbasket.style.display="none";
        var words = document.createElement("h3");
        hardmodetext.innerHTML="...woah ...seems like someones stolen my eggs.... i must find more..";
        hardmodetext.style.display="block";
        hinttext.style.display="block";

   }

hbotbasket.onclick = function(){
  hardegg.style.display="block";
   score = 0;
  score1.innerHTML=score + "/2000";
  canvascolor.style.backgroundColor="#292631";
  night.style.display="none";
  changenight.style.display="block";
  sky.style.display="none";
}
