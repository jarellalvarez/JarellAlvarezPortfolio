$(document).ready(function(){
  $("#webDesCurt").click(function() {
    if ($("#subMenuWebDes").css("display") == "block"){
      $("#subMenuWebDes").css("display", "none");

    }
    else
    {
      $("#subMenuWebDes").css("display", "block");
      $("#subMenuWebDes").addClass("animateCurtainRight");
        $("#subMenuStory").css("display", "none");
        $("#subMenuDev").css("display", "none");
    }
  });

  $("#storyCurt").click(function() {
    if ($("#subMenuStory").css("display") == "block"){
      $("#subMenuStory").css("display", "none");

    }
    else
    {
      $("#subMenuStory").css("display", "block");
      $("#subMenuStory").addClass("animateCurtainRight");
        $("#subMenuDev").css("display", "none");
        $("#subMenuWebDes").css("display", "none");
    }
  });



  $("#webDevCurt").click(function() {
    if ($("#subMenuDev").css("display") == "block"){
      $("#subMenuDev").css("display", "none");

    }
    else
    {
      $("#subMenuDev").css("display", "block");
      $("#subMenuDev").addClass("animateCurtainRight");
      $("#subMenuWebDes").css("display", "none");
      $("#subMenuStory").css("display", "none");
    }
  });

});

var menuButt = document.getElementById("menuButt");
var mobMenu = document.getElementById("mobMenu");
var closeButt = document.getElementById("closeButt");
var subMenuWebDes = document.getElementById("subMenuWebDes");

closeButt.onclick = function () {
  mobMenu.style.display = "none";
  closeButt.style.display = "none";
  subMenuWebDes.style.display = "none";
  menuButt.style.display = "block";
};


menuButt.onclick = function () {
  mobMenu.style.display = "block";
  mobMenu.classList.add("animateCurtainLeft");
  closeButt.style.display = "block";
  menuButt.style.display = "none";
};
