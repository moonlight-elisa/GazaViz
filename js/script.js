document.addEventListener("DOMContentLoaded", (event) => {

/******************************
Changement de l'année par rapport au curseur
*******************************/

// Sélectionne les éléments
var mapDate = document.getElementById("map-date");
var mapDateText = document.getElementById("map-date-text");
var mapSvgContainer = document.getElementById("map-svg-container"); // Mettre l'objet SVG dans un conteneur div
var buildingsCount = document.getElementById("buildings-count");

// Tableau des noms des mois
const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Fonction pour regrouper les données par mois
function groupDataByMonth(data) {
    const groupedData = {};

    data.forEach(report => {
        const date = new Date(report.report_date);
        const month = date.getMonth() + 1; // getMonth() retourne les mois de 0 à 11
        const year = date.getFullYear();
        const key = `${year}-${month}`;

        if (!groupedData[key]) {
            groupedData[key] = {
                civic_destroyed: 0,
            };
        }

        if (report.civic_buildings) {
            groupedData[key].civic_destroyed += report.civic_buildings.ext_destroyed || 0;
        }
    });

    return groupedData;
}

// Chargement des données JSON depuis l'URL locale
var data;
fetch('./json/infrastructure-damaged.json')
    .then(response => response.json())
    .then(jsonData => {
        console.log('Données JSON chargées :', jsonData);
        data = groupDataByMonth(jsonData);
        changeMapDate(); // Initialisation après le chargement des données
    })
    .catch(error => {
        console.error('Erreur de chargement des données JSON :', error);
    });

function changeMapDate() {
    // Calcule le mois et l'année
    const totalMonths = parseInt(mapDate.value, 10);
    const startingMonth = 9; // Octobre comme index 9
    const selectedYear = 2023 + Math.floor((totalMonths + startingMonth) / 12);
    const selectedMonth = (totalMonths + startingMonth) % 12 + 1;

    console.log('Mois et année sélectionnés :', selectedMonth, selectedYear);

    mapDateText.innerHTML = `${months[selectedMonth - 1]} ${selectedYear}`;

    // Ajout d'un paramètre unique pour forcer le rechargement de l'image SVG
    const svgPath = `img/gaza-map-${selectedMonth}-${selectedYear}.svg?cache_buster=${new Date().getTime()}`;

    // Gestion de la transition d'opacité
    mapSvgContainer.classList.add('fade-out');
    setTimeout(() => {
        mapSvgContainer.innerHTML = `<object id="map-svg" data="${svgPath}" type="image/svg+xml" width="500" height="600"></object>`;
        mapSvgContainer.classList.remove('fade-out');
    }, 500); // Durée de la transition en millisecondes

    // Vérification du chemin de l'image
    console.log('Chemin de l\'image SVG :', svgPath);

    // Afficher le nombre de bâtiments civiques détruits pour le mois et l'année sélectionnés
    const key = `${selectedYear}-${selectedMonth}`;
    const report = data[key];
        
    let civicDestroyed = 0; // Initialisation de la variable

    if (report) {
        civicDestroyed = report.civic_destroyed;
    }

    buildingsCount.innerHTML = civicDestroyed;

    console.log('Données pour la clé:', key);
    console.log('Bâtiments civiques détruits :', civicDestroyed);
}

// Écouteurs d'événements pour mettre à jour l'image lors des changements
mapDate.addEventListener("input", changeMapDate);


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
