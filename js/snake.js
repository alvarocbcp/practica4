import { getInputDirection } from "./input.js";

export const SNAKE_SPEED = 5;
const snakeBody = [{ x:11, y:11}];
let nuevosSegmentos = 0;

export function actualizarSnake(){
    addSegmentos();
    const inputDirection = getInputDirection();
    for (let i = snakeBody.length - 2; i >= 0; i--){
        snakeBody[i + 1] = { ...snakeBody[i] }
    }

    snakeBody[0].x += inputDirection.x;
    snakeBody[0].y += inputDirection.y;
}

export function dibujarSnake(tablero){
    snakeBody.forEach(segmento => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segmento.y;
        snakeElement.style.gridColumnStart = segmento.x;
        snakeElement.classList.add('snake');
        tablero.appendChild(snakeElement);
    })
}

export function expandSnake(cantidad){
    nuevosSegmentos += cantidad;
}

export function onSnake(posicion, { ignoreHead = false } = {}){
    return snakeBody.some((segmento, indice) => {
        if(ignoreHead && indice === 0) return false;
        return posicionesIguales(segmento, posicion);
    })
}

export function getSnakeHead(){
    return snakeBody[0];
}

export function snakeIntersection(){
    return onSnake(snakeBody[0], { ignoreHead: true})
}

function posicionesIguales(pos1, pos2){
    return(pos1.x === pos2.x && pos1.y === pos2.y)
}

function addSegmentos(){
    for(let i = 0; i < nuevosSegmentos; i++){
        snakeBody.push({ ...snakeBody[snakeBody.length - 1] });
    }

    nuevosSegmentos = 0;
}