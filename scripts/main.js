let gridItems = document.querySelectorAll('.grid-item');
const [UP, RIGHT, DOWN, LEFT, RUP, RDOWN, LUP, LDOWN] = [-5, 1, 5, -1, -4, 6, -6, 4];
const TILE_AMOUNT = 25;

const mySwitch = document.getElementById('mySwitch');
const logo = document.getElementsByClassName('logo')[0];

mySwitch.addEventListener('click', () => {
  mySwitch.classList.toggle('active');
    if (mySwitch.classList.contains('active')) {
        logo.src = "https://cdn.jsdelivr.net/gh/MatejHyskaGit/lolbingo@master/images/Logo_drunk.png";
    } else {
        logo.src = "https://cdn.jsdelivr.net/gh/MatejHyskaGit/lolbingo@master/images/Logo.png";
    }
});

//console.log(gridItems);
const myPopup = new Popup({
    id: "bingoPopup",
    title: "Bingo!",
    content: `
        Congratulations! You've got bingo!`
});

let bingo = false;
let idChecked = new Set([13]);

let newGameButton = document.getElementById("newGame");

const newGameConfirmation = new Popup({
    id: "override",
    title: "Určitě chceš začít <br> novou hru?",
    content: `custom-space-out big-margin§{btn-refuse-override}[...ne]{btn-accept-override}[ANO!]`,
    sideMargin: "1.5em",
    fontSizeMultiplier: "1.2",
    backgroundColor: "#FFFFFF",
    allowClose: false,
    css: `
    button {
        color: white;
        border: none;
        border-radius: 20em !important;
        width: 7em !important;
        font-size: 1.7em !important;
        margin: 0.5em !important;
        padding: 0 !important;
        font-size: 2em !important;
    }
    .popup-title {
        margin-top: 1.5em;
        margin-bottom: -1em;
        line-height: 1em;
    }
    .popup.override .custom-space-out {
        display: flex;
        justify-content: center;
    }
    .refuse-override{
        background-color: #2e282a;
    }
    .accept-override{
        background-color: #952c52;
        padding-top: 0.1em !important;
    } 
    .popup-body:last-child {
        margin-bottom: 0 !important;
    } 
    @media (max-width: 768px) {
    button {
        font-size: 1.6em !important;
        margin-top: 1em !important;
    }
}
}`,
    loadCallback: () => {
        /* button functionality */
        document.getElementsByClassName("refuse-override")[0].onclick =
            () => {

                newGameConfirmation.hide();
                // user wants to use local data
            };

        document.getElementsByClassName("accept-override")[0].onclick =
            () => {
                newGame();
                newGameConfirmation.hide();
                // user wants to use cloud data
            };
    },
});

// ---- PRELOADING IMAGES ----

let imageUrls = [];
imageUrls.push("https://cdn.jsdelivr.net/gh/MatejHyskaGit/lolbingo@master/images/Logo.png");
imageUrls.push("https://cdn.jsdelivr.net/gh/MatejHyskaGit/lolbingo@master/images/Logo_drunk.png");
for (let index = 1; index < TILE_AMOUNT + 1; index++) {
    imageUrls.push("https://cdn.jsdelivr.net/gh/MatejHyskaGit/lolbingo@master/images/" + index + ".png");
    imageUrls.push("https://cdn.jsdelivr.net/gh/MatejHyskaGit/lolbingo@master/images/" + index + "_s.png");
}

const preloadedImages = {};

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    if (preloadedImages[url]) return resolve(preloadedImages[url]);

    const img = new Image();
    img.onload = () => {
      preloadedImages[url] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function preloadAllImages(urls) {
  return Promise.all(urls.map(preloadImage));
}


// ---- BINGO LOGIC ----

let checkBingo = (id) => {
    let bingoCount = { value: 1 }; // Use an object to hold the count
    // Check up and down
    checkBingoRecursive(id, bingoCount, UP);
    checkBingoRecursive(id, bingoCount, DOWN);
    //console.log("Bingo Count after up down check:", bingoCount);
    if (bingoCount.value == 5) return true;

    // Check left and right
    bingoCount = { value: 1 }; // Reset count for horizontal check
    checkBingoRecursive(id, bingoCount, LEFT);
    checkBingoRecursive(id, bingoCount, RIGHT);
    //console.log("Bingo Count after left right check:", bingoCount);
    if (bingoCount.value == 5) return true;

    // Check rUP and lDOWN
    bingoCount = { value: 1 }; // Reset count for horizontal check
    checkBingoRecursive(id, bingoCount, RUP);
    checkBingoRecursive(id, bingoCount, LDOWN);
    //console.log("Bingo Count after rUP lDOWN check:", bingoCount);
    if (bingoCount.value == 5) return true;

    // Check rDOWN and lUP
    bingoCount = { value: 1 }; // Reset count for horizontal check
    checkBingoRecursive(id, bingoCount, RDOWN);
    checkBingoRecursive(id, bingoCount, LUP);
    //console.log("Bingo Count after rDOWN lUP check:", bingoCount);
    if (bingoCount.value == 5) return true;
    return false;
};

let checkBingoRecursive = (id, bingoCount, dir) => {
    if (idChecked.has(id)) {
        bingoCount.value++;
    }
    //console.log("Checking ID:", id, "Bingo Count:", bingoCount, "Direction:", dir);
    // Check in the specified direction
    let nextId = parseInt(id) + parseInt(dir);
    //console.log("Next ID:", nextId, "hasId:", idChecked.has(nextId));
    if (isLegalMove(id, nextId, dir) && idChecked.has(nextId)) {
        bingoCount.value = checkBingoRecursive(nextId, bingoCount, dir);
    }
    return bingoCount.value;
};

let isLegalMove = (id, nextId, dir) => {
    // Check if the next ID is within bounds and not wrapping around the grid
    if (nextId < 1 || nextId > 25) return false; // Out of bounds
    if (id % 5 === 0 && (dir === RIGHT || dir === RUP || dir === RDOWN)) return false;
    if (id % 5 === 1 && (dir === LEFT || dir === LUP || dir === LDOWN)) return false;
    return true;
}

// ---- GAME SETUP ----

let newGame = () => {
    bingoNumbers = Array.from({ length: TILE_AMOUNT }, (_, i) => i + 1);

    for (let i = 0; i < bingoNumbers.length; i++) {
        let rand = Math.floor(Math.random() * bingoNumbers.length);
        [bingoNumbers[i], bingoNumbers[rand]] = [bingoNumbers[rand], bingoNumbers[i]];
    }
    idChecked = new Set([13]); // Reset checked IDs, keeping the center one checked
    localStorage.setItem("bingoChecked", JSON.stringify(Array.from(idChecked)));
    Array.from(document.getElementsByClassName("grid-item clicked")).forEach(element => {
        element.classList.remove("clicked");
    });
    bingo = false;
    localStorage.setItem("bingo", JSON.stringify(bingo));
    //console.log("Shuffled:", bingoNumbers);
    setGame();
    
}

let setGame = () => {
    localStorage.setItem("bingoNumbers", JSON.stringify(bingoNumbers));

    let index = 0;
    gridItems.forEach(element => {
        element.src = "https://cdn.jsdelivr.net/gh/MatejHyskaGit/lolbingo@master/images/" + bingoNumbers[index] + "_s.png";
        element.dataset.altSrc = element.src;
        element.src = "https://cdn.jsdelivr.net/gh/MatejHyskaGit/lolbingo@master/images/" + bingoNumbers[index] + ".png";
        element.dataset.origSrc = element.src;
        index++;
    });

    idChecked = new Set(JSON.parse(localStorage.getItem("bingoChecked")));
    idChecked.add(13);
    //console.log("Checked IDs:", idChecked);
    idChecked.forEach(element => {
        document.getElementById(element).classList.add("clicked");
        if (element != 13) {
            document.getElementById(element).src = document.getElementById(element).dataset.altSrc;
        }
    });
    if (localStorage.getItem("bingo") != null) {
        bingo = JSON.parse(localStorage.getItem("bingo"));
    }
}

// ---- RAW CODE ----

window.addEventListener('DOMContentLoaded', () => {
    preloadAllImages(imageUrls).then(() => {
        console.log("All images preloaded");
    }).catch(err => {
        console.error("Error preloading images:", err);
    });
});

newGameButton.onclick = () => {
    newGameConfirmation.show();
}


if (localStorage.getItem("bingoNumbers") != null && localStorage.getItem("bingoNumbers") != "[]") {
    bingoNumbers = JSON.parse(localStorage.getItem("bingoNumbers"));
    setGame();
}
else {
    newGame();
}


gridItems.forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('clicked');
        clickedImgId = item.src.split("/")[7].split(".")[0];
        //console.log("Image id: ", clickedImgId);
        if (item.classList.contains('clicked')) {
            idChecked.add(parseInt(item.id));
            localStorage.setItem("bingoChecked", JSON.stringify(Array.from(idChecked)));
            item.src = item.dataset.altSrc;
            //console.log(idChecked);
            if (checkBingo(item.id) && !bingo) {
                myPopup.show();
                bingo = true;
                localStorage.setItem("bingo", JSON.stringify(bingo));
            }
        } else {
            idChecked.delete(parseInt(item.id));
            localStorage.setItem("bingoChecked", JSON.stringify(Array.from(idChecked)));
            item.src = item.dataset.origSrc;
        }
    });
});


