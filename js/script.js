document.addEventListener("DOMContentLoaded", (event) => {

/******************************
Changement de l'année par rapport au curseur
*******************************/

var mapYear = document.getElementById("map-year"); //Selectionne la barre de l'année
var mapYearDisplay = document.getElementById("map-year-display"); //Le nombre correspond à l'année

function changeMapYear() {
    //Afficher l'année
    mapYearDisplay.innerHTML = mapYear.value;

    //Mise à jour de la carte en fonction de l'année
    const mapCanvas = document.getElementById("map-canvas");
    const ctx = mapCanvas.getContext("2d");

    let img = new Image();
    img.src = "img/gaza-map-" + mapYear.value + ".svg"; 

    img.addEventListener("load", function () {
        const imgRatio = img.width / img.height;
        const canvasRatio = mapCanvas.width / mapCanvas.height;

        let drawWidth, drawHeight;
      
        if (imgRatio > canvasRatio) {
          // L'image est plus large que le canevas
          drawWidth = mapCanvas.width;
          drawHeight = mapCanvas.width / imgRatio;
        } 
        else {
          // L'image est plus haute ou égale en ratio
          drawHeight = mapCanvas.height;
          drawWidth = mapCanvas.height * imgRatio;
        } 
        const drawX = (mapCanvas.width - drawWidth) / 2;
        const drawY = (mapCanvas.height - drawHeight) / 2;
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }); 
}

changeMapYear(); //Affichage de l'année au chargement de la page

mapYear.addEventListener("change", changeMapYear); //Quand on bouge le curseur on change l'année


/**************************
Graphique des morts quotidiennes
*************************/
const barWidth = 26;
const barSpacing = 10;

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBar(contexte, index, barHeight, canvasHeight) {
  const positionX = (barWidth + barSpacing) * index;
  const positionY = canvasHeight - barHeight;
  //console.log(positionY);
  //console.log(barHeight);
  if (!(barHeight == undefined)) {
  const gradient = contexte.createLinearGradient(0, positionY, 0, positionY + barHeight);
  gradient.addColorStop(0, '#ED2E38'); // Début du dégradé
  gradient.addColorStop(0.7, '#0F0F14');  // Fin du dégradé
  contexte.fillStyle = gradient;
  const radius = 15; // Rayon des coins
  drawRoundedRect(contexte, positionX, positionY, barWidth, barHeight, radius);
  contexte.fill();
  }
}


function drawGraph(canvas, data) {
  data.forEach((value, index) => {
    const contexte = canvas.getContext("2d");
    const canvasHeight = canvas.height;
    drawBar(contexte, index, value.killed, canvas.height);
  });
}

const dailyDeathsCanvas = document.getElementById('daily-deaths-canvas');

fetch('./json/casualties_daily.json')
  .then(response => response.json())
  .then(dailyDeathsData => drawGraph(dailyDeathsCanvas, dailyDeathsData))
  .catch(error => console.error('Erreur :', error));

/******************************
Animation des ronds de l'image svg
*******************************/

const circles = document.querySelectorAll('.svg-flag__circle');
const transitionDelay = 1000; // Délai pour réactiver une animation
const intervalDuration = 5000; // Durée entre chaque cycle d'animation

function animateCircles() {
    circles.forEach(circle => {
        // Retire les animations précédentes
        (transitionDelay, intervalDuration)
        circle.classList.remove('animate1', 'animate2', 'animate3');

        // Délai pour permettre une transition fluide entre les états
        setTimeout(() => {
            // Choisit une animation aléatoire
            const randomAnimation = Math.floor(Math.random() * 3) + 1; // 1 à 3
            circle.classList.add(`animate${randomAnimation}`);
        }, transitionDelay, intervalDuration); // Petit délai pour activer la transition
    });
}
    // Commence l'animation immédiatement
    animateCircles();

    // Fait une animation toutes les 5 secondes
    setInterval(animateCircles, 5000); 

});
