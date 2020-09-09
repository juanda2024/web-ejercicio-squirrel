
// Clase que representa un evento
class Evento {
    /**
     * Constructor de la clase evento
     * @param {} id: identificador del evento
     * @param {*} nombre : Nombre del evento
     * @param {*} TP : Contador TP del evento
     * @param {*} TN : Contador TN del evento
     * @param {*} FP : Contador FP del evento
     * @param {*} FN : Contador FN del evento
     * @param {*} MCC : Calculo del MCC del evento
     */
    constructor(id, nombre, TP, TN, FP, FN, MCC) {
        this.id = id;
        this.nombre = nombre;
        this.TP = 0;
        this.TN = 0;
        this.FP = 0;
        this.FN = 0;
        this.MCC = 0;
    }
    /**
     * Retorna el ID del evento
     */
    get darId() {
        return this.id;
    }
    /**
     * Retorna el nombre del evento
     */
    get darNombre() {
        return this.nombre;
    }
    /**
     * Retorna el TP del evento
     */
    get darTP() {
        return this.TP;
    }
    /**
     * Suma el contador de TP
     */
    anadirTP() {
        this.TP = parseInt(this.TP) + 1;
    }
    /**
     * Retorna y calcula el TN del evento
     */
    get darTN() {
        return contador_filas - (this.FN + this.TP + this.darFP);
    }
    /**
     * Retorna y calcula el FP del evento
     */
    get darFP() {
        return contador_squirrel_true - this.TP;
    }
    /**
     * Retorna el FN del evento
     */
    get darFN() {
        return this.FN;
    }
    /**
     * Suma el contador de FN
     */
    anadirFN() {
        this.FN = parseInt(this.FN) + 1;
    }
    /**
     * Retorna el MCC
     */
    get darMCC() {
        this.MCC = this.calcularMCC();
        return this.MCC;
    }
    /**
     * Calcula el MCC del evento
     */
    calcularMCC() {
        var TP = this.darTP;
        var TN = this.darTN;
        var FP = this.darFP;
        var FN = this.darFN;
        return (((TP * TN) - (FP * FN)) / (Math.sqrt((TP + FP) * (TP + FN) * (TN + FP) * (TN + FN))))
    }
}
/**
 * Variable global que almacena el listado de todos los eventos encontrados en la lectura por HTTP
 */
var listado_eventos;
/**
 * Variable que cuenta las filas para la tabla eventos
 */
var contador_filas = 0;
/**
 * Variable que cuenta las filas donde el atributo squirrel sea true.
 */
var contador_squirrel_true = 0;

/**
 * Metodo de lectura para los eventos por HTTP  
 * @param {} url_eventos: url que almacena el JSON de los eventos
 */
function lecturaEventosHTTP(url_eventos) {
    listado_eventos = new Array();
    var contador_nuevos = 0;

    new Promise(function (resolve, reject) {

        let req_eventos = new XMLHttpRequest();
        req_eventos.open("GET", url_eventos);

        req_eventos.onload = function () {
            if (req_eventos.status == 200) {
                var transacciones = JSON.parse(req_eventos.response);

                // Se realiza la lectura de las transacciones encontradas en la lectura por HTTP
                for (var transaccion in transacciones) {
                    var transaccion_actual = transacciones[transaccion];
                    var eventos_actuales = transaccion_actual["events"];
                    var tiene_squirrel = transaccion_actual["squirrel"];

                    // Se crean los elementos por DOM
                    const fila_nueva = document.createElement("tr");

                    const identificador_fila = document.createElement("th");
                    identificador_fila.scope = "row";
                    identificador_fila.textContent = contador_filas + "";

                    const eventos_fila = document.createElement("td");

                    // Se recorren los eventos de la transaccion actual, y se verifica si este existe en el arreglo de eventos.
                    // Se calcula el FN y el TP, dependiendo si hay squirrel o no.
                    for (var i = 0; i < eventos_actuales.length; i++) {
                        eventos_fila.textContent += (eventos_actuales[i] + ", ");
                        const encontrado = listado_eventos.find(element => element.darNombre === eventos_actuales[i]);
                        if (encontrado != null) {
                            if (tiene_squirrel === false) {
                                encontrado.anadirFN();
                            }
                            else {
                                encontrado.anadirTP();
                            }
                            listado_eventos[encontrado.darId] = encontrado;
                        }
                        else {
                            var nuevo_evento = new Evento(contador_nuevos, eventos_actuales[i]);
                            if (tiene_squirrel === false) {
                                nuevo_evento.anadirFN();
                            }
                            else {
                                nuevo_evento.anadirTP();
                            }
                            listado_eventos.push(nuevo_evento);
                            contador_nuevos++;
                        }
                    }
                    // Se quita la ultima "," generada en la concatenación del for
                    var s = eventos_fila.innerText;
                    s = s.substring(0, s.length - 2);
                    eventos_fila.textContent = s;

                    // se crea la columna squirrel por DOM
                    const squirrel_fila = document.createElement("td");
                    squirrel_fila.textContent = tiene_squirrel + "";
                    // Se verifica si es true o no (para cambiar el color de la fila)
                    if (tiene_squirrel == true) {
                        ;
                        fila_nueva.className = "table-danger";
                    }

                    // Se añaden los elementos a la fila actual
                    fila_nueva.appendChild(identificador_fila);
                    fila_nueva.appendChild(eventos_fila);
                    fila_nueva.appendChild(squirrel_fila);

                    // Se crea la fila en la tabla.
                    const contenido_tabla = document.querySelector(".contenido_tabla_events");
                    contenido_tabla.appendChild(fila_nueva);
                    contador_filas++;
                    if (tiene_squirrel == true) {
                        contador_squirrel_true++;
                    }
                }

                // Funcion comparator para el ordenamiento por MCC
                function compare(a, b) {
                    if (a.darMCC < b.darMCC) {
                        return 1;
                    }
                    if (a.darMCC > b.darMCC) {
                        return -1;
                    }
                    return 0;
                }
                // Se ordenan los eventos por MCC
                listado_eventos.sort(compare);

                var contador_identificador_2 = 1;


                for (var i = 0; i < listado_eventos.length; i++) {

                    // Se crea la fila nueva por DOM
                    const fila_nueva = document.createElement("tr");

                    // Se crean los elementos de la fila por DOM
                    const identificador_fila = document.createElement("th");
                    identificador_fila.scope = "row";
                    identificador_fila.textContent = contador_identificador_2 + "";

                    const evento_fila = document.createElement("td");
                    evento_fila.textContent = listado_eventos[i].darNombre;
                    evento_fila.style.paddingLeft = "300px";

                    const MCC_fila = document.createElement("td");
                    MCC_fila.textContent = listado_eventos[i].darMCC;
                    MCC_fila.style.paddingLeft = "500px";

                    // Se añaden los elementos de la fila por DOM
                    fila_nueva.appendChild(identificador_fila);
                    fila_nueva.appendChild(evento_fila);
                    fila_nueva.appendChild(MCC_fila);

                    // Se añade la fila a la tabla Correlation of Events por DOM
                    const contenido_tabla = document.querySelector(".contenido_tabla_correlation");
                    contenido_tabla.appendChild(fila_nueva);
                    contador_identificador_2++;
                }
                resolve(req_eventos.response);
            }
            else {
                reject(Error(req_eventos.statusText));
            }
        };
        req_eventos.send();
    });
}

/**
 * Se llama el metodo que realiza la lectura y creacion de tablas con la url del ejercicio.
 */
lecturaEventosHTTP("https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json");
