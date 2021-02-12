import { onSnake, expandSnake } from './snake.js';
import { randomGridPosition } from './grid.js';

let apple = getRandomApplePosition();
const EXPANSION_RATE = 2;

export function actualizarApple(){
    if(onSnake(apple)){
        expandSnake(EXPANSION_RATE);
        apple = getRandomApplePosition();
    }
}

export function dibujarApple(tablero){
    const appleElement = document.createElement('div');
    appleElement.style.gridRowStart = apple.y;
    appleElement.style.gridColumnStart = apple.x;
    appleElement.classList.add('apple');
    tablero.appendChild(appleElement);
    
}

function getRandomApplePosition(){
    let newApplePosition;
    while(newApplePosition == null || onSnake(newApplePosition)){
        newApplePosition = randomGridPosition();
    }
    return newApplePosition;
}