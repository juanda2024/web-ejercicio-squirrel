
// Clase que representa un evento
class Evento {

    constructor(id, nombre, TP, TN, FP, FN, MCC) {
        this.id = id;
        this.nombre = nombre;
        this.TP = 0;
        this.TN = 0;
        this.FP = 0;
        this.FN = 0;
        this.MCC = 0;
    }

    get darId() {
        return this.id;
    }

    get darNombre() {
        return this.nombre;
    }

    get darTP() {
        return this.TP;
    }

    anadirTP() {
        this.TP = parseInt(this.TP) + 1;
    }

    get darTN() {
        return contador_filas - (this.FN + this.TP + this.darFP);
    }

    get darFP() {
        return contador_squirrel_true - this.TP;
    }

    get darFN() {
        return this.FN;
    }

    anadirFN() {
        this.FN = parseInt(this.FN) + 1;
    }

    get darMCC() {
        this.MCC = this.calcularMCC();
        return this.MCC;
    }

    calcularMCC() {
        var TP = this.darTP;
        var TN = this.darTN;
        var FP = this.darFP;
        var FN = this.darFN;
        return (((TP * TN) - (FP * FN)) / (Math.sqrt((TP + FP) * (TP + FN) * (TN + FP) * (TN + FN))))
    }
}
/**
 * Variable global que almacena el listado de todos los productos
 */
var listado_eventos;

var contador_filas = 0;

var contador_squirrel_true = 0;


function lecturaEventosHTTP(url_eventos) {
    listado_eventos = new Array();
    var contador_nuevos = 0;

    new Promise(function (resolve, reject) {

        let req_eventos = new XMLHttpRequest();
        req_eventos.open("GET", url_eventos);

        req_eventos.onload = function () {
            if (req_eventos.status == 200) {
                var transacciones = JSON.parse(req_eventos.response);
                for (var transaccion in transacciones) {
                    var transaccion_actual = transacciones[transaccion];
                    var eventos_actuales = transaccion_actual["events"];
                    var tiene_squirrel = transaccion_actual["squirrel"];

                    const fila_nueva = document.createElement("tr");

                    const identificador_fila = document.createElement("th");
                    identificador_fila.scope = "row";
                    identificador_fila.textContent = contador_filas + "";

                    const eventos_fila = document.createElement("td");

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

                    var s = eventos_fila.innerText;
                    s = s.substring(0, s.length - 2);
                    eventos_fila.textContent = s;

                    const squirrel_fila = document.createElement("td");
                    squirrel_fila.textContent = tiene_squirrel + "";
                    if (tiene_squirrel == true) {
                        ;
                        fila_nueva.className = "table-danger";
                    }

                    fila_nueva.appendChild(identificador_fila);
                    fila_nueva.appendChild(eventos_fila);
                    fila_nueva.appendChild(squirrel_fila);

                    const contenido_tabla = document.querySelector(".contenido_tabla_events");
                    contenido_tabla.appendChild(fila_nueva);
                    contador_filas++;
                    if (tiene_squirrel == true) {
                        contador_squirrel_true++;
                    }
                }

                function compare(a, b) {
                    if (a.darMCC < b.darMCC) {
                        return 1;
                    }
                    if (a.darMCC > b.darMCC) {
                        return -1;
                    }
                    return 0;
                }

                listado_eventos.sort(compare);

                var contador_identificador_2 = 1;

                for (var i = 0; i < listado_eventos.length; i++) {
                    const fila_nueva = document.createElement("tr");

                    const identificador_fila = document.createElement("th");
                    identificador_fila.scope = "row";
                    identificador_fila.textContent = contador_identificador_2 + "";

                    const evento_fila = document.createElement("td");
                    evento_fila.textContent = listado_eventos[i].darNombre;
                    evento_fila.style.paddingLeft = "300px";

                    const MCC_fila = document.createElement("td");
                    MCC_fila.textContent = listado_eventos[i].darMCC;
                    MCC_fila.style.paddingLeft = "500px";

                    fila_nueva.appendChild(identificador_fila);
                    fila_nueva.appendChild(evento_fila);
                    fila_nueva.appendChild(MCC_fila);

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
 * Se llama el metodo con la url del ejercicio.
 */
lecturaEventosHTTP("https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json");
