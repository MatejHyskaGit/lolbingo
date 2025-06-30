let gridItems = document.querySelectorAll('.grid-item');

gridItems.forEach(item => {
    item.addEventListener('click', () => {
        let clickedItems = document.querySelectorAll('.clicked');
        let bingoCount = 1;
        item.classList.toggle('clicked');
        
    });
});