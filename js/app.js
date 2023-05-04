'use strict';
import { Producto } from './classes/products.js';

const tlou = new Producto(1,"The Last Of Us" , "PS3,PS4,PS5,PC", 60, "https://i.blogs.es/b9a176/image_2022-06-09_222051649/840_560.png")
const gtav = new Producto(2, "Grand Theft Auto V", "PS3,PS4,PS5, XBOX, PC", 39.98, "https://i.blogs.es/dfbccc/trucosgtavps4/1366_2000.jpg");
const sonsoftheforest = new Producto(3, "Sons of The Forest", "PC", 29.99, "https://errekgamer.com/wp-content/uploads/2023/01/Presentan-Sons-of-the-Forest-la-secuela-del-aclamado-The-Forest.jpg");
const rdr2 = new Producto(4, "Red Dead Redemption 2", "PC", 29.20, "https://as01.epimg.net/meristation/imagenes/2018/10/22/header_image/87072801540239406.jpg");
const hogwartsLegacy = new Producto(5, "Hogwarts Legacy", "PC/PS4/PS5", 59.99, "https://media.tycsports.com/files/2023/02/12/533536/hogwarts-legacy-_1440x810_wmk.webp");
const re4Remake = new Producto(6, "Resident Evil 4 Remake", "PC,PS4,PS5,XBOX", 59.99, "https://img.youtube.com/vi/b9OEQAW5m2k/maxresdefault.jpg");

const productos = [tlou, gtav, sonsoftheforest, rdr2, hogwartsLegacy, re4Remake];
let productSelected
let cart = [];
let mensaje = "Bienvenido a tu carrito de compras de videojuegos!\nEstos son nuestros productos:\nPor favor, seleccione el producto indicando su numero correspondiente\n";

//Calculadora de precio de videojuegos de Steam Argentina.
const GANANCIAS = 0.35;
const PAIS = 0.30;
let valorDolar = 470;
let valorConImpuestos;
let valorConvertido; 
let valorFormateado; 
let total = 0;
const convertirPesoArgentino = (valorProd) => {
  valorConvertido = valorProd * valorDolar;
  return valorConvertido;
}

const mostrarValorFormateado = (valor) => {
  valorFormateado = valor.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  return valorFormateado;
}

const calcularImpuestos = (base) => {
  let ganancias = base * GANANCIAS;
  let pais = base * PAIS;
  valorConImpuestos = base + ganancias + pais;
  return valorConImpuestos;
}

const makeProductsList = () => {
  for (let i = 0; i < productos.length; i++) {
    mensaje += (i+1) + ") " + productos[i].nombre + " precio: " + productos[i].precio + "\n";
  }
}
const addToCart = (productSelected, continuar, calcular) => {
  calcular = calcular;
  continuar = continuar;
  let agregar = Number(prompt(`Desea Agregar ${productSelected.nombre} al carrito?
  1)Si
  2)No
  `));
  if (agregar == '1') {
    cart.push(productSelected);
    console.log(cart);
  } else {
    if(calcular == 2) {
      total = cart.reduce( (acumulador, producto) => acumulador + producto.precio, 0)
      alert(`¡Gracias por comprar con nosotros! El total de sus productos es: ${total} Dolares`)
    } else {
      total = cart.reduce( (acumulador, producto) => acumulador + producto.precio, 0)
      total = convertirPesoArgentino(total);
      total = calcularImpuestos(total);
      total = mostrarValorFormateado(total);
      alert(`¡Gracias por comprar con nosotros! El total de sus productos es: ${total} ARS`)
      continuar = false;
    }
  }
}
const mostrarCarrito = () => {
  let mensaje = "Su compra:\n";
  for (let i = 0; i < cart.length; i++) {
    mensaje += `${i + 1}) ${cart[i].nombre}\n`;
  }
  alert(`${mensaje} `);
}
const takeUserChoice = () => {
  let continuar = true;
  do {
    makeProductsList();
    let choice;
    if (cart != '') {
      choice = Number(prompt(`${mensaje}8) Mostrar Carrito 
9) Salir
      `));
    } else {
      choice = Number(prompt(`${mensaje}9) Salir`));
    }

    if (choice == 9) {
      let productosMensaje = "";
      alert(`¡Gracias por comprar con nosotros!`)
      if (cart !='') {
        for (let i = 0; i < cart.length; i++) {
          productosMensaje += (i+1) + ") " + cart[i].nombre;
        }
        alert(productosMensaje + " " + "Productos en el carrito: " + cart.length);
      }
      continuar = false;
    } else if (choice == 8 && cart != '') {
      mostrarCarrito();
    } else {
      productSelected = productos.find( p => p.id === choice );
      alert(`Ha seleccionado: ${productSelected.nombre} con un valor de ${productSelected.precio}DLS`);
      let precioArsEncontrado = false

      let calcular = Number(prompt(`Desea convertir el valor de ${productSelected.nombre} a Pesos Argentinos?
      1)Si
      2)No
      `));
      if (calcular === 1) {
        convertirPesoArgentino(productSelected.precio);
        mostrarValorFormateado(valorConvertido);
        alert(`El juego ha sido convertido exitosamente! Valor de ${productSelected.nombre}: ${valorFormateado} ARS`);
        alert(`Al juego se le agregarán los impuestos pertinents: Ganancias + PAIS`);
        valorConImpuestos = calcularImpuestos(valorConvertido);
        valorConImpuestos = mostrarValorFormateado(valorConImpuestos);
        productSelected.precio = valorConImpuestos;
        alert(`Se han agregado los impuestos correctamente! ${productSelected.nombre} tiene un valor de ${valorConImpuestos} ARS`);
  
        addToCart(productSelected, continuar, calcular);
      } else {
        addToCart(productSelected, continuar, calcular);
      }
    }
  } while (continuar)
}
takeUserChoice()

