
import {productsData} from "./db.js";
const productsDOM=document.querySelector(".products");
const cartContent=document.querySelector(".cart-content");
const cartTotal=document.querySelector(".cart-total");
const shopCartIcon=document.querySelector(".header--shop-icon");
const shopCart=document.querySelector(".header--shop-icon span");
const clearCart=document.querySelector(".clear-cart");

const backdrop=document.querySelector(".backdrop");
const cartModal=document.querySelector(".cart");
const confrimBtn=document.querySelector(".cart-item-confirm");

const searchInput=document.querySelector("#search");

let allProductsData=[];
let cart=[];
let btnsDom=[];
let filters={
  searchItem:"",
}
class Products{
  getProducts(){
    return productsData;
  }
}
class UI{
displayProducts(products){
    let result='';
    products.forEach((p)=>{
        result +=`
        <div class="product">
        <div class="products--desc">
          <p class="product-price">${p.price}</p>
          <p class="product-title">${p.title}</p>
        </div>
        <img src="${p.image}" class="product--img" alt="" />
        <button class="btn product--button" data-id="${p.id}">add to cart</button>
      </div>
        `;
        productsDOM.innerHTML=result;
        
    });
   
};

getProductsBtn(){
  const addToCartBtns = [...document.querySelectorAll(".product--button")];
    btnsDom=addToCartBtns;
    // buttonsDOM = addToCartBtns;
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      const isInCart = cart.find((btn)=> btn.id == parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
  
        return;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // 1. get product from products
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };

        // 2. add product to cart
        cart = [...cart, addedProduct];
        // 3. save cart in local sotrage
        Storage.saveCart(cart);
        // 4. set cart values
        this.setCartValue(cart);
        // 5. dispaly cart item
        this.addToCart(addedProduct);
      });
    });

};

addToCart(cItem){
    const div=document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML=`
    <img class="cart-item-img" src="${cItem.image}" />
          <div class="cart-item-desc">
            <h4>${cItem.title}</h4>
            <h5>${cItem.price}</h5>
          </div>
          <div class="cart-item-conteoller">
          <img src="/icons/chevron-up-2 (1).svg" class="chevron-up" alt="chevron up icon" data-id="${cItem.id}">
            <p >${cItem.quantity}</p>
            <img src="/icons/chevron-down-2.svg" class="chevron-down" alt="chevron down" data-id="${cItem.id}">
          </div>
          <img src="/icons/trash-alt (4).svg" class="trash-icon" alt="trash icon" data-id="${cItem.id}">
    
    `;
    cartContent.appendChild(div);
};
setCartValue(cart){
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return curr.quantity * curr.price + acc;
    }, 0);
    cartTotal.innerText = `total price : ${parseFloat(totalPrice).toFixed(
      2
    )} $`;
    shopCart.innerText = tempCartItems;
}
//setupApp
setupApp(){
cart= Storage.getCart();
this.htmlCart(cart);
this.setCartValue(cart);

}
htmlCart(cart){
  cart.forEach((cItem)=>this.addToCart(cItem))
}
// cart logic
cartLogic(){

  clearCart.addEventListener("click",this.clearCart())

cartContent.addEventListener("click",(e)=>{
  if(e.target.classList.contains("chevron-up")){
    const addQuantity=e.target;
    const id=addQuantity.dataset.id;
    const addedItem=cart.find((c)=>c.id == id);
    addedItem.quantity++;
    this.setCartValue(cart);
    Storage.saveCart(cart);
    addQuantity.nextElementSibling.innerText=addedItem.quantity;
  }else if(e.target.classList.contains("chevron-down")){
    const subQuantity = e.target;
        const id = subQuantity.dataset.id;
        const substractedItem = cart.find((c) => c.id == id);

        if (substractedItem.quantity === 1) {
          this.removeItem(id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }

        substractedItem.quantity--;
        // update storage
        Storage.saveCart(cart);
        // update total price
        this.setCartValue(cart);
        // update item quantity :
        // console.log(subQuantity.nextElementSibling);
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
  }else if(e.target.classList.contains("trash-icon")){
    const removeItem=e.target;
    const id=removeItem.dataset.id;
    const removedItem=cart.find((c)=>c.id == id);
     cartContent.removeChild(removeItem.parentElement);
     this.removeItem(id);
  }
})
}
clearCart(){
clearCart.addEventListener("click",()=>{
 // loop on all the item and tigger remove for each one
 cart.forEach((item) => this.removeItem(item.id));
 // console.log(cartContent.children[0]);
 while (cartContent.children.length) {
   cartContent.removeChild(cartContent.children[0]);
 }
 closeModalFunction();
})
}
removeItem(id){
  cart = cart.filter((cItem)=>cItem.id != id);
 this.setCartValue(cart);
 Storage.saveCart(cart);
const button= this.getSingleBtn(id);
button.innerText="add to cart";
button.disabled=false;

}

getSingleBtn(id){
  return btnsDom.find((btn)=>btn.dataset.id == id);
}

filterProducts(){
  this.renderProducts();
  this.searchInput();
  this.btnFiltersProducts();
}
renderProducts() {
  const filteredProducts = allProductsData.filter((p) => {
    return p.title.toLowerCase().includes(filters.searchItem.toLowerCase());
  });
  productsDOM.innerHTML = "";
  this.displayProducts(filteredProducts);
 this.getProductsBtn();
}
btnFiltersProducts(){
  const btns = document.querySelectorAll(".btn-filter");
  btns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const filter = e.target.dataset.filter;
      
      // e.target.classList.add("active");
      // console.log(e.target.innerText);
      filters.searchItem = filter;
     this.renderProducts(allProductsData, filters);
    });
  });
}
searchInput(){
  searchInput.addEventListener("input", (e) => {
    console.log(e.target.value);

    filters.searchItem = e.target.value;
   this.renderProducts(allProductsData, filters);
  });
}

}

class Storage{
static saveProducts(products){
    let saveProducts=localStorage.setItem("products",
    JSON.stringify(products));

}
static getProduct(id){
const product= JSON.parse(localStorage.getItem("products"));
return product.find((p)=>p.id == id)
// return localStorage.getItem("product");
}
static saveCart(cart){
    localStorage.setItem("cart",JSON.stringify(cart));
}
static getCart(){
 return localStorage.getItem("cart") ?
  JSON.parse(localStorage.getItem("cart"))
  : [];
}

//get cart

}


document.addEventListener("DOMContentLoaded",()=>{
      const products=new Products();
      const productsData=products.getProducts();
      
        allProductsData=productsData;
        const ui=new UI();
        ui.setupApp();
        ui.displayProducts(allProductsData);
        ui.getProductsBtn();
        ui.filterProducts();
        ui.cartLogic();
        Storage.saveProducts(allProductsData);
    
});


// CART MODAUL
function showModalFunction(){
backdrop.style.display="block",
cartModal.style.opacity="1",
cartModal.style.top="20%"
}
function closeModalFunction(){
    backdrop.style.display="none",
    cartModal.style.opacity="0",
    cartModal.style.top="-100%"
}
shopCartIcon.addEventListener("click",showModalFunction);
confrimBtn.addEventListener("click",closeModalFunction);
backdrop.addEventListener("click",closeModalFunction);





