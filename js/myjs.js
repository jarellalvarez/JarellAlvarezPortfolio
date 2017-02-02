$(document).ready(function(){
  $("#webDLink").click(function() {
    if ($(".headerHover").css("display") == "block"){
$(".headerHover").css("display", "none");
    }
    else
    {
      $(".headerHover").css("display", "block");
    }
  });
  console.log("hi");
});


// ===== Sticky Header =====
/*$(window).scroll(function() {
    if ($(this).scrollTop() >= 50) {        // If page is scrolled more than 50px
        $('#header').fadeIn(400);    // Fade in the arrow
    } else {
        $('#header').fadeOut(400);   // Else fade out the arrow
    }
});




// ===== Scroll to Top ====
$(window).scroll(function() {
    if ($(this).scrollTop() >= 50) {        // If page is scrolled more than 50px
        $('#return-to-top').fadeIn(200);    // Fade in the arrow
    } else {
        $('#return-to-top').fadeOut(200);   // Else fade out the arrow
    }
});


$('#return-to-top').click(function() {      // When arrow is clicked
    $('body,html').animate({
        scrollTop : 0                       // Scroll to top of body
    }, 500);
});
    });


  function myFunction() {
    var x = document.getElementById("linksinMenu");
    if (x.className === "linksinMenu") {
        x.className += " responsive";
    } else {
        x.className = "linksinMenu";
    }*/
