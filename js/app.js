'use strict';
import { Producto } from './classes/PRODUCTO.js';
const toastr = window.toastr;

const tlou = new Producto(1,"The Last Of Us" , "PS3,PS4,PS5,PC", 60, "https://i.blogs.es/b9a176/image_2022-06-09_222051649/840_560.png")
const gtav = new Producto(2, "Grand Theft Auto V", "PS3,PS4,PS5, XBOX, PC", 39.98, "https://i.blogs.es/dfbccc/trucosgtavps4/1366_2000.jpg");
const sonsoftheforest = new Producto(3, "Sons of The Forest", "PC", 29.99, "https://errekgamer.com/wp-content/uploads/2023/01/Presentan-Sons-of-the-Forest-la-secuela-del-aclamado-The-Forest.jpg");
const rdr2 = new Producto(4, "Red Dead Redemption 2", "PC", 29.20, "https://as01.epimg.net/meristation/imagenes/2018/10/22/header_image/87072801540239406.jpg");
const hogwartsLegacy = new Producto(5, "Hogwarts Legacy", "PC/PS4/PS5", 59.99, "https://media.tycsports.com/files/2023/02/12/533536/hogwarts-legacy-_1440x810_wmk.webp");
const re4Remake = new Producto(6, "Resident Evil 4 Remake", "PC,PS4,PS5,XBOX", 59.99, "https://img.youtube.com/vi/b9OEQAW5m2k/maxresdefault.jpg");

const productos = [tlou, gtav, sonsoftheforest, rdr2, hogwartsLegacy, re4Remake];
let carrito = [];

const productContainer = document.getElementById('products');
const cardsContainer = productContainer.querySelector(".cards");
const cartContainer = document.getElementById('cart-items');
const cartTitle = document.querySelector('.cart-title');


const GANANCIAS = 0.45;
const PAIS = 0.30;
let valorDolar = 470;
let divisaConvertida;
let total = 0;
let totalImpuestos = 0;
let formatedTotal = 0; 

//Calculadora de precio de videojuegos de Steam Argentina.
const convertirPesoArgentino = (valorProd) => {
  divisaConvertida = valorProd * valorDolar;
  return divisaConvertida;
}
const calcularImpuestos = (base) => {
    let ganancias = base * GANANCIAS;
    let pais = (base * PAIS);
    totalImpuestos = base + ganancias + pais;
    return totalImpuestos;
}
// Crear elementos HTML para los productos
const createProductsDom = () => {
  for (let i = 0; i < productos.length; i++) {
    const product = productos[i];
    const card = `
    <div class="card">
        <div class="image">
            <img src="${product.imgUri}" alt="">
        </div>
        <div class="content">
            <div class=" card-title my-4">
              <p class="h4">${product.nombre}</p>
              <p class="h5">Plataforma ${product.detalle}</p>
            </div>
            <div class=" body ">
              <p class="card-text">Precio: ${product.precio} DLS</p>
              <button class="btn button addBtn" type="button" data-id="${product.id}">Agregar al carrito</button>
            </div>
        </div>
    </div>
  `;
  cardsContainer.innerHTML += card;
  }
  // Agregar evento de clic en el botón "Agregar al carrito"
  const addBtn = document.querySelectorAll('.addBtn');
  for (let i = 0; i < addBtn.length; i++) {
    addBtn[i].addEventListener('click', (event) => {
      const productId = event.target.dataset.id; // obtener el ID del producto correspondiente al botón que se ha hecho clic
      let addedProduct = productos.find(product => product.id == productId);
      carrito.push(addedProduct);
      toastr.success(`El producto ${addedProduct.nombre} ha sido agregado al carrito`);
      renderCart();
    });
  }
}
// Crear elementos HTML para el carrito
const renderCart = () => {
  cartContainer.innerHTML = ``;
  let buyInfo = ``;
  total = 0; // reiniciar la variable total al comienzo de la función
  for (const product of carrito) {
    const cartItem = `
      <div class="cart-item d-flex flex-row my-3">
        <div class="image">
          <img src="${product.imgUri}" alt="">
        </div>
        <div class="content">
          <p>${product.nombre}</p>
          <p>Precio: ${product.precio}DLS</p>
          <button class="btn button delBtn" type="button" data-id="${product.id}">Eliminar del carrito</button>
        </div>
      </div>
    `;
    cartContainer.innerHTML += cartItem;
  } 

  if (carrito.length > 0) {
    cartTitle.textContent = 'Su compra';
    total = carrito.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.precio;
    }, 0);
    divisaConvertida = convertirPesoArgentino(total);
    console.log(divisaConvertida)
    totalImpuestos = calcularImpuestos(divisaConvertida);
    console.log(totalImpuestos)

    totalImpuestos = totalImpuestos.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'});
    formatedTotal = totalImpuestos;
    buyInfo = `
      <div class="buyInfo bg-dark d-flex flex-column align-items-center p-2 rounded">
        <p class="text-center total">Total: ${formatedTotal} ARS</p>
        <p class="text-muted">El valor se convierte a pesos y se le agregan los impuestos correspondientes </p>
        <a href="pages/productos.html"> <button type="button" class="btn button"> Comprar Ahora </button> </a>
      </div>
    `;
    cartContainer.innerHTML += buyInfo;
  } else {
    cartTitle.textContent = 'No hay productos en su carrito';
  }
  

  // Agregar eventos de clic en los botones "Eliminar del carrito"
  const delBtns = document.querySelectorAll('.delBtn');
  for (let i = 0; i < delBtns.length; i++) {
    delBtns[i].addEventListener('click', (event) => {
      const productId = event.target.dataset.id; // obtener el ID del producto correspondiente al botón que se ha hecho clic
      let index = carrito.findIndex(product => product.id == productId); // busca el índice del producto correspondiente en el carrito
      let deletedProd = carrito[index];
      if (index > -1) {
        carrito.splice(index, 1); // eliminar el producto del carrito
        event.target.closest('.cart-item').remove(); // eliminar el elemento del DOM
        toastr.success(`El producto ha sido eliminado del carrito`);
        total -= deletedProd.precio; // restar el precio del producto eliminado del total
        divisaConvertida = convertirPesoArgentino(total); // volver a convertir el total a pesos
        totalImpuestos = calcularImpuestos(divisaConvertida); // calcular los impuestos correspondientes al nuevo total
        totalImpuestos = totalImpuestos.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'}); // formatear el texto del total con los impuestos correspondientes
        formatedTotal = totalImpuestos;
        const totalElement = cartContainer.querySelector('.total');
        if (totalElement) {
          totalElement.textContent = `Total: ${formatedTotal} ARS`;
        }
        if (carrito.length == 0) {
          cartTitle.textContent = 'No hay productos en su carrito';
          const buyInfoElement = cartContainer.querySelector('.buyInfo');
          if (buyInfoElement) {
            buyInfoElement.remove();
          }
        }
      }
    });
  }
}
createProductsDom();