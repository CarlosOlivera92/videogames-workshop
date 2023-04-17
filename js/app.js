'use strict';

//Calculadora de precio de videojuegos de Steam Argentina.
let precioBase;
const IVA = 0.21;
const GANANCIAS = 0.35;
const PAIS = 0.30;
let total;

const calcularPrecio = (base) => {
    let ganancias = base * GANANCIAS;
    let iva = (base + ganancias) * IVA;
    let pais = (base * PAIS);
    total = base + ganancias + iva + pais;
    return total;
}
const getPrecioBase = () => {
    let continuar = true;
    alert(`¡Bienvenido a la calculadora de impuestos de Steam Argentina!
    Nuestros valores se ajustan a la carga impositiva impuesta por AFIP hasta la fecha actual: 2023.
    Los impuestos son:
    *Percepcion de ganancias: 35%
    *IVA: 21%
    *Impuesto PAIS: 30%
    A continuación se le pedirá que ingrese el precio del videojuego en cuestion expresado en pesos.
    Ejemplo: 11299
    `);
    do {
        precioBase = Number(prompt("Por favor, ingrese el precio del vieojuego: "))
        if (isNaN(precioBase) || precioBase == undefined || precioBase <= 0) {
            alert("Error, el valor ingrresado no es valido");
        } else {
            continuar = false;
            alert(`El precio ingresado es de: ${precioBase}`)
        }
    } while (continuar) 
}
const agregarImpuestos = () => {
    let continuar;
    do {
        getPrecioBase();
        calcularPrecio (precioBase);
        alert(`El videojuego con impuestos tiene un valor de: ${total} ARS`);
        continuar = prompt(`Quiere continuar calculando los precios de otros juegos? Ingrese "No" (Sin comillas) para salir`);
        if (continuar == "No" || continuar == "no") {
            continuar = false;
            alert("¡Muchas gracias por usar nuestra calculadora de impuestos!");
        }
    } while (continuar)
}
agregarImpuestos();
console.log(total);