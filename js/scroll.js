// Ce script permet de scroll 100vh vers le haut ou vers le bas


// Supposons que 'scrollButton' est la classe de votre bouton
var scrollDownButtons = document.getElementsByClassName('scrollDownButton');

// Comme getElementsByClassName retourne une collection, vous itérer sur chaque élément
Array.from(scrollDownButtons).forEach(function(button) {
  button.addEventListener('click', function() {
    // Calcule 100% de la hauteur de la fenêtre du navigateur
    const height = window.innerHeight;
  
    // Fait défiler la page de 100vh
    window.scrollBy({ top: height, left: 0, behavior: 'smooth' });
  });
});

// Def le button
var scrollUpButtons = document.getElementsByClassName('scrollUpButton');

// Comme getElementsByClassName retourne une collection, itérer sur chaque élément
Array.from(scrollUpButtons).forEach(function(button) {
  button.addEventListener('click', function() {
    // Calcule 100% de la hauteur de la fenêtre du navigateur
    const height = window.innerHeight;
  
    // Fait défiler la page de 100vh
    window.scrollBy({ top: -height, left: 0, behavior: 'smooth' });
  });
});
