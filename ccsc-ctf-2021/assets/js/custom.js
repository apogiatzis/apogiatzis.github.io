// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
// When the user scrolls the page, execute myFunction
$(document).ready(function () {
    window.onscroll = function() {stickyNavbar()};

    // Get the navbar
    var navbar = document.getElementById("qwFixedHeader");

    var sticky = screen.height-55;

    function stickyNavbar() {
        if (window.pageYOffset >= sticky) {
            navbar.classList.add("sticky")
        } else {
            navbar.classList.remove("sticky");
        }
    }
});