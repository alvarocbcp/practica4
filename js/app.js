document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado");
    aplicacion();
});

function aplicacion() {

    // CONSTANTES Y VARIABLES

    let GRID_SIZE = 61;                                                         //Tamaño del grid, al ser cuadrado nos sirve con tener un solo lado
    const tablero = document.getElementById('tablero');                         //Tablero (div) principal del html que contiene la propiedad display: grid;
    const contenedorJuego = document.querySelector(".container-juego");


    let snakeBody = [{ x: Math.round(GRID_SIZE / 2), y: Math.round(GRID_SIZE / 2) }];//Cuerpo de la serpiente. Empieza siendo solo la cabeza en la posicion central del tablero
    let SNAKE_SPEED = 5;                                                         //Velocidad a la que se mueve la serpiente, va en relacion con el requestAnimationFrame y este hace que se ejecute a distintas velocidades
    let EXPANSION_RATE = 1;                                                      //Numero de cuadrados que se expande la serpiente cuando come
    let TIEMPO_CAMBIO = 10000;                                                   //Tiempo en el que cambia la manzana de posicion si no es comida (varia segun dificultad)
    let lastRenderTime = 0;                                                      //Variable usada en el requestAnimationFrame
    let gameOver = false;                                                        //Variable que hace junto a la funcion checkMuerte() cuando se acaba la partida
    let nuevosSegmentos = 0;                                                     //Nuevos segmentos que se añaden a la serpiente cuando come una manzana
    let apple = getRandomApplePosition();                                        //Creacion de una manzana de forma aleatoria en el tablero
    let inputDirection = { x: 0, y: 0 };                                         //Variable que indica la direccion hacia donde se mueve la serpiente
    let lastInputDirection = { x: 0, y: 0 };                                     //Variable que indica la ultima direccion hacia donde se movia la serpiente (sirve para no poder girar 180º)
    let contadorTiempo = 0;                                                      //Segundos que dura la partida
    let contadorPuntos = 0;                                                      //Puntos totales de la partida
    var cambiaApple;                                                             //Variable que recoge el setInterval para cambiar la manzana cada x segundos si no la atrapas

    //Creacion custom element pantalla inicial

    class ElementoIntroduccion extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({ mode: "open" });

            this.templateIntro = document.querySelector("#intro");

            this.instrucciones = document.importNode(this.templateIntro.content, true);

        }

        connectedCallback() {
            this.shadowRoot.appendChild(this.instrucciones);
            var start = this.shadowRoot.querySelector(".boton-start");
            //Cambia las variables del programa para la dificultad facil
            this.shadowRoot.querySelector(".facil").addEventListener('click', () => {
                SNAKE_SPEED = 5;
                EXPANSION_RATE = 1;
                GRID_SIZE = 21;
                TIEMPO_CAMBIO = 10000;
                apple = getRandomApplePosition();
                snakeBody = [{ x: Math.round(GRID_SIZE / 2), y: Math.round(GRID_SIZE / 2) }];
                tablero.style.gridTemplateColumns = "repeat(" + GRID_SIZE + ", 1fr)";
                tablero.style.gridTemplateRows = "repeat(" + GRID_SIZE + ", 1fr)";
                start.addEventListener('click', () => {
                    this.empezar();
                })
            });
            //Cambia las variables del programa para la dificultad intermedia
            this.shadowRoot.querySelector(".intermedio").addEventListener('click', () => {
                SNAKE_SPEED = 15;
                EXPANSION_RATE = 1;
                GRID_SIZE = 41;
                TIEMPO_CAMBIO = 20000;
                apple = getRandomApplePosition();
                snakeBody = [{ x: Math.round(GRID_SIZE / 2), y: Math.round(GRID_SIZE / 2) }];
                tablero.style.gridTemplateColumns = "repeat(" + GRID_SIZE + ", 1fr)";
                tablero.style.gridTemplateRows = "repeat(" + GRID_SIZE + ", 1fr)";
                start.addEventListener('click', () => {
                    this.empezar();
                })
            });
            //Cambia las variables del programa para la dificultad dificil
            this.shadowRoot.querySelector(".dificil").addEventListener('click', () => {
                SNAKE_SPEED = 20;
                EXPANSION_RATE = 2;
                GRID_SIZE = 61;
                TIEMPO_CAMBIO = 30000;
                apple = getRandomApplePosition();
                snakeBody = [{ x: Math.round(GRID_SIZE / 2), y: Math.round(GRID_SIZE / 2) }];
                tablero.style.gridTemplateColumns = "repeat(" + GRID_SIZE + ", 1fr)";
                tablero.style.gridTemplateRows = "repeat(" + GRID_SIZE + ", 1fr)";
                start.addEventListener('click', () => {
                    this.empezar();
                })
            });


        }

        empezar() {
            var botonEmpezar = this.shadowRoot.querySelector(".boton-start");
            this.shadowRoot.querySelector(".container-instrucciones").style.display = "none";
            contadorTiempoFuncion();
            cambiarManzana();
        }
    }

    customElements.define('elemento-introduccion', ElementoIntroduccion);

    //TABLERO DE JUEGO


    //Evento para iniciar la funcion principal del juego cuando se pulsa una tecla que no sea ninguna de las flechas

    //Funcion principal del programa, ejecuta de continuo teniendo en cuenta la velocidad de la serpiente las funciones de actualizar y dibujar tanto la serpiente como la manzana
    function principal(currentTime) {
        if (gameOver) { setTimeout(gameOverFuncion, 1000) }                         //setTimeout espera 1 segundo despues de que la serpiente colisione para acceder a la pantalla de GAME OVER
        else {
            window.requestAnimationFrame(principal);
            const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
            if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;
            console.log("Render");
            lastRenderTime = currentTime;

            actualizar();
            dibujar();
        }
    }

    //Funcion que crea un contador del tiempo que dura la partida
    function contadorTiempoFuncion() {
        setInterval(function () {
            contadorTiempo++;;
            document.getElementById("tiempo").innerHTML = contadorTiempo;
        }, 1000);
    }

    //Funcion para cambiar la manzana de posicion si no se ha comido en un tiempo determinado
    function cambiarManzana(){
        cambiaApple = setInterval(function(){
            apple = getRandomApplePosition();
        }, TIEMPO_CAMBIO)
    }

    //Funcion que reanuda la funcion anterior cuando se come una manzana (es llamada en la funcion "actualizaApples")
    function restartCambiarManzana(){
        clearInterval(cambiaApple);
        cambiaApple = setInterval(function(){
            apple = getRandomApplePosition();
        }, TIEMPO_CAMBIO)
    }


    window.requestAnimationFrame(principal);

    //Funcion para actualizar los datos del programa
    function actualizar() {
        actualizarSnake();
        actualizarApple();
        checkMuerte();
    }

    //Funcion para dibujar sobre el tablero los datos del programa
    function dibujar() {
        tablero.innerHTML = '';
        dibujarSnake(tablero);
        dibujarApple(tablero);
    }

    //Funcion para ver si la serpiente ha colisionado y finalizar el programa gracias a la variable booleana gameOver
    function checkMuerte() {
        gameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
    }


    // FUNCIONES SNAKE

    //Actualiza la serpiente
    function actualizarSnake() {
        addSegmentos();
        const inputDirection = getInputDirection();
        for (let i = snakeBody.length - 2; i >= 0; i--) {
            snakeBody[i + 1] = { ...snakeBody[i] }
        }

        snakeBody[0].x += inputDirection.x;
        snakeBody[0].y += inputDirection.y;
    }

    //Dibuja la serpiente
    function dibujarSnake(tablero) {
        snakeBody.forEach(segmento => {
            const snakeElement = document.createElement('div');
            snakeElement.style.gridRowStart = segmento.y;
            snakeElement.style.gridColumnStart = segmento.x;
            snakeElement.classList.add('snake');
            tablero.appendChild(snakeElement);
        })
    }

    //Expande la serpiente cuando come una manzana
    function expandSnake(cantidad) {
        if (contadorPuntos % 10 === 0 && contadorPuntos !== 0) {
            nuevosSegmentos += (cantidad * 2);
            contadorPuntos = contadorPuntos + 3;
        }
        else {
            nuevosSegmentos += cantidad;
            contadorPuntos++;
        }
        document.getElementById("puntos").innerHTML = contadorPuntos;
    }

    //Indica si hay algun elemento en la misma posicion que la serpiente
    function onSnake(posicion, { ignoreHead = false } = {}) {
        return snakeBody.some((segmento, indice) => {
            if (ignoreHead && indice === 0) return false;
            return posicionesIguales(segmento, posicion);
        })
    }

    //Devuelve la posicion de la cabeza de la serpiente
    function getSnakeHead() {
        return snakeBody[0];
    }

    //Devuelve true si la serpiente ha colisionado consigo misma
    function snakeIntersection() {
        return onSnake(snakeBody[0], { ignoreHead: true })
    }

    //Retorna true si dos posiciones pasadas por parametro son iguales
    function posicionesIguales(pos1, pos2) {
        return (pos1.x === pos2.x && pos1.y === pos2.y)
    }

    //Añade segmentos a la cola de la serpiente cuando esta come una manzana
    function addSegmentos() {
        for (let i = 0; i < nuevosSegmentos; i++) {
            snakeBody.push({ ...snakeBody[snakeBody.length - 1] });
        }
        nuevosSegmentos = 0;
    }

    // FUNCIONES APPLE

    //Actualiza la manzana
    function actualizarApple() {
        if (onSnake(apple)) {
            expandSnake(EXPANSION_RATE);
            apple = getRandomApplePosition();
            restartCambiarManzana();
        }        
    }

    //Dibuja la manzana en el tablero (roja por defecto y dorada si el contador es multiplo de 10)
    function dibujarApple(tablero) {
        if (contadorPuntos % 10 === 0 && contadorPuntos !== 0) {
            const appleElement = document.createElement('div');
            appleElement.style.gridRowStart = apple.y;
            appleElement.style.gridColumnStart = apple.x;
            appleElement.classList.add('appleDorada');
            tablero.appendChild(appleElement);
        }
        else {
            const appleElement = document.createElement('div');
            appleElement.style.gridRowStart = apple.y;
            appleElement.style.gridColumnStart = apple.x;
            appleElement.classList.add('apple');
            tablero.appendChild(appleElement);
        }
    }

    //Devuelve una posicion aleatoria para colocar la manzana en un sitio vacío del tablero
    function getRandomApplePosition() {
        let newApplePosition;
        while (newApplePosition == null || onSnake(newApplePosition)) {
            newApplePosition = randomGridPosition();
        }
        return newApplePosition;
    }

    // FUNCIONES GRID

    //Devuelve una posicion aleatoria del GRID
    function randomGridPosition() {
        return {
            x: Math.floor(Math.random() * GRID_SIZE) + 1,
            y: Math.floor(Math.random() * GRID_SIZE) + 1
        }
    }

    //Devuelve true si la posicion pasada por parámetro está fuera de los límites del tablero
    function outsideGrid(position) {
        return (position.x < 1 || position.x > GRID_SIZE || position.y < 1 || position.y > GRID_SIZE);

    }

    // FUNCIONES INPUT MOVIMIENTO

    //Evento para controlar la direccion hacia donde se mueve la serpiente
    window.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
                if (lastInputDirection.y !== 0) break;
                inputDirection = { x: 0, y: -1 };
                break
            case 'ArrowDown':
                if (lastInputDirection.y !== 0) break;
                inputDirection = { x: 0, y: 1 };
                break
            case 'ArrowLeft':
                if (lastInputDirection.x !== 0) break;
                inputDirection = { x: -1, y: 0 };
                break
            case 'ArrowRight':
                if (lastInputDirection.x !== 0) break;
                inputDirection = { x: 1, y: 0 };
                break
        }
    })

    //Funcion para que no se pueda girar 180 grados con la serpiente (no cambiar de derecha a izquiera || no cambiar de arriba a abajo)
    function getInputDirection() {
        lastInputDirection = inputDirection;
        return inputDirection;
    }



    //PANTALLA GAME OVER

    //Ejecuta el template del game over
    function gameOverFuncion() {
        var gameOverContainer = document.querySelector(".container-gameOver");

        //Clase del custom elemet GAME OVER
        class ElementoGameOver extends HTMLElement {
            constructor() {
                super();

                this.attachShadow({ mode: "open" });

                this.templateGameOver = document.querySelector("#gameOver");

                this.contenidoGameOver = document.importNode(this.templateGameOver.content, true);

            }

            connectedCallback() {
                this.shadowRoot.appendChild(this.contenidoGameOver);
                contenedorJuego.style.display = "none";
                this.shadowRoot.querySelector(".tiempo-gameOver").innerHTML = contadorTiempo + " segundos";
                this.shadowRoot.querySelector(".puntos-gameOver").innerHTML = contadorPuntos + " puntos";
                this.shadowRoot.querySelector(".salir").addEventListener('click', salir);
                let titulo = this.shadowRoot.querySelector(".titulo-gameOver");

                let contador = 25;
                //Animacion del titulo de la pantalla del GAME OVER
                let intervalo = setInterval(() => {
                    if (contador == 0) {
                        clearInterval(intervalo);
                    }
                    contador--;
                    titulo.style.transform = "translateY(-" + contador + "rem)";
                }, 50);



            }
        }
        window.customElements.define('elemento-gameover', ElementoGameOver);

        //Funcion para volver a la pantalla principal del programa
        function salir() {
            location.reload();
        }

    }


}