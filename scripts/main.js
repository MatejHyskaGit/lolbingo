let gridItems = document.querySelectorAll('.grid-item');
console.log(gridItems);
const myPopup = new Popup({
    id: "bingoPopup",
    title: "Bingo!",
    content: `
        Congratulations! You've got Bingo!`
});
let bingo = false;
let idChecked = new Set([13]);
gridItems.forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('clicked');
        if (item.classList.contains('clicked') && !bingo) {
            idChecked.add(parseInt(item.id));
            console.log(idChecked);
            if (checkBingo(item.id)) {
                myPopup.show();
                bingo = true;
            }
        } else {
            idChecked.delete(parseInt(item.id));
        }
    });
});
const [UP, RIGHT, DOWN, LEFT, RUP, RDOWN, LUP, LDOWN] = [-5, 1, 5, -1, -4, 6, -6, 4];
let checkBingo = (id) => {
    let bingoCount = { value: 1 }; // Use an object to hold the count
    // Check up and down
    checkBingoRecursive(id, bingoCount, UP);
    checkBingoRecursive(id, bingoCount, DOWN);
    console.log("Bingo Count after up down check:", bingoCount);
    if (bingoCount.value == 5) return true;

    // Check left and right
    bingoCount = { value: 1 }; // Reset count for horizontal check
    checkBingoRecursive(id, bingoCount, LEFT);
    checkBingoRecursive(id, bingoCount, RIGHT);
    console.log("Bingo Count after left right check:", bingoCount);
    if (bingoCount.value == 5) return true;

    // Check rUP and lDOWN
    bingoCount = { value: 1 }; // Reset count for horizontal check
    checkBingoRecursive(id, bingoCount, RUP);
    checkBingoRecursive(id, bingoCount, LDOWN);
    console.log("Bingo Count after rUP lDOWN check:", bingoCount);
    if (bingoCount.value == 5) return true;

    // Check rDOWN and lUP
    bingoCount = { value: 1 }; // Reset count for horizontal check
    checkBingoRecursive(id, bingoCount, RDOWN);
    checkBingoRecursive(id, bingoCount, LUP);
    console.log("Bingo Count after rDOWN lUP check:", bingoCount);
    if (bingoCount.value == 5) return true;
    return false;
};

let checkBingoRecursive = (id, bingoCount, dir) => {
    if (idChecked.has(id)) {
        bingoCount.value++;
    }
    console.log("Checking ID:", id, "Bingo Count:", bingoCount, "Direction:", dir);
    // Check in the specified direction
    let nextId = parseInt(id) + parseInt(dir);
    console.log("Next ID:", nextId, "hasId:", idChecked.has(nextId));
    if (idChecked.has(nextId)) {
        bingoCount.value = checkBingoRecursive(nextId, bingoCount, dir);
    }
    return bingoCount.value;
};
