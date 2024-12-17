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
const barSpacing = 80;

function drawRoundedRect(ctx, x, y, width, height, radius, color) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + height);
  gradient.addColorStop(0, color); // Début du dégradé
  gradient.addColorStop(0.7, 'transparent');  // Fin du dégradé
  ctx.fillStyle = gradient;
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
  ctx.fill();
}

function drawText(ctx, x, y, value, style, font) {
  ctx.fillStyle = style;  // Couleur de remplissage
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillText(value, x, y);
}

function drawBar(contexte, index, barHeight, barMaxHeight, canvasHeight, dataX, dataY, color) {
  const positionX = (barWidth + barSpacing) * index + 80;
  const radius = 15; // Rayon des coins
  if (!(barHeight == undefined)) {
    var barHeightResize = barHeight / barMaxHeight;
    barHeightResize = barHeightResize * canvasHeight - 50;
    const positionY = canvasHeight - barHeightResize;
    drawRoundedRect(contexte, positionX, positionY, barWidth, barHeightResize, radius, color);
    drawText(contexte, positionX + (barWidth/2), positionY - 10, dataY, "white", "16px DM Sans");
    drawText(contexte, positionX + (barWidth/2), canvasHeight, dataX, "grey", "14px DM Sans");
  }
  else {
    const positionY = canvasHeight - 100;
    drawRoundedRect(contexte, positionX, positionY, barWidth, 100, radius, "#21212c");
    drawText(contexte, positionX + (barWidth/2), canvasHeight, "No data", "grey", "14px DM Sans");
  }
}


function drawGraph(canvas, data, dataX, dataY, color) {
  const dataLength = data.length;
  const contexte = canvas.getContext("2d");
  const canvasHeight = canvas.height;
  const canvasWidth = (barWidth + barSpacing) * dataLength + 80;
  var maxdataY = 0;
  canvas.width = canvasWidth;

  data.forEach((value) => {
    if (value[dataY]) {
      if (value[dataY] > maxdataY) {
        maxdataY = value[dataY];
      }
    }
  });

  data.forEach((value, index) => {
    drawBar(contexte, index, value[dataY], maxdataY, canvas.height, value[dataX], value[dataY], color);
  });
}

const dailyDeathsCanvas = document.getElementById('daily-deaths-canvas');
const dailyCasualtiesCanvas = document.getElementById('daily-casualties-canvas');

fetch('./json/casualties_daily.json')
  .then(response => response.json())
  .then(data => {
    console.log('Données reçues :', data); // Vérifiez les données ici
    drawGraph(dailyDeathsCanvas, data, "report_date", "killed", "#ED2E38");
    drawGraph(dailyCasualtiesCanvas, data, "report_date", "injured", "#009639");
  })
  .catch(error => console.error('Erreur lors du chargement des données :', error));


/******************************
Animation des ronds de l'image svg
*******************************/

const circles = document.querySelectorAll('.svg-flag__circle');
const intervalDuration = 5000; // Durée entre chaque cycle d'animation

function animateCircles() {
    circles.forEach(circle => {
        // Écoute la fin de l'animation pour retirer les classes
        circle.addEventListener('animationend', () => {
            circle.classList.remove('animate1', 'animate2', 'animate3');
        });

        // Choisit une animation aléatoire
        const randomAnimation = Math.floor(Math.random() * 3) + 1; // 1 à 3
        circle.classList.add(`animate${randomAnimation}`);
    });
}
    // Commence l'animation immédiatement
    animateCircles();

    // Répète l'animation toutes les 5 secondes
    setInterval(animateCircles, intervalDuration);

}); 
