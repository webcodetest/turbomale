/* Fetches the wishlist data. */

const fetchList = async (swat) => {
  return new Promise((resolve, reject) => {
    const onSuccess = (lists) => {
      console.log("Fetched all Lists", lists);
      window.swymWishLists = lists;
      window.swymSelectedListId = lists && lists[0] && lists[0].lid;
      resolve(lists);
    };

    const onError = (error) => {
      console.log("Error while fetching all Lists", error);
      reject(error);
    };

    if (!window.swymWishLists) {
      swat.fetchLists({
        callbackFn: onSuccess,
        errorFn: onError
      });
    } else {
      resolve(window.swymWishLists);
    }
  });
};


const isProductInWishlist = async (swat, productId) => {
  const lists = await fetchList(swat);
  if (!lists || lists.length === 0) return false;
  
  return lists.some(list =>
    list.listcontents.some(item => {
      console.log(item.empi, Number(productId));
      return item.empi == Number(productId)
    })
  );
};


const markWishlistItems = async (swat) => {
  try {
    const lists = await fetchList(swat);

    document.querySelectorAll("[data-favorite]").forEach(item => {
      const productId = item.getAttribute("data-favorite");
      const isInWishlist = lists.some(list =>
        list.listcontents.some(product => product.empi == Number(productId))
      );

      if (isInWishlist) {
        item.classList.add("added");
      } else {
        item.classList.remove("added");
      }
    });

  } catch (error) {
    console.error("Ошибка при проверке wishlist:", error);
  }
};

// Функция для обработки клика по кнопке
const handleWishlistClick = async (event, swat) => {
  event.preventDefault();
  const item = event.target.closest("[data-favorite]");
  if (!item) return;

  const productId = item.getAttribute("data-favorite");
  const productVariantId = item.getAttribute("data-variant-id");
  const productUrl = item.getAttribute("data-product-url"); 

  const product = {
    epi: Number(productVariantId),
    empi: Number(productId),
    du: window.location.origin + productUrl,
  };

  console.log(product)

 if (item.classList.contains("added")) {
      removeFromWishlist(_swat, product);
      item.classList.remove("added");
    } else {
      addToWishlist(_swat, product);
      item.classList.add("added");
    }
};




/* Create a new wishlist if it doesn't already exist. */

const createList = (swat) => {
    let listConfig = { "lname": "My Wishlist" };
  
    let onSuccess = function({lid}) { 
      console.log("Successfully created a new List", lid);
      window.swymSelectedListId = lid;
    }
    
    let onError = function(error) {
      console.log("Error while creating a List", error);
    }
    
    swat.createList(listConfig, onSuccess, onError);
}


/* Refreshes the wishlist by fetching the list again in the global scope. */

const refreshList = async (swat) => {
  window.swymWishLists = null;
  await fetchList(swat);
};



/* Adds product to wishlist action. */

const addToWishlist = (swat, product) => {
    let onSuccess = async function (addedListItem){
      console.log('Product has been added to wishlist!', addedListItem);
    }
    
    let onError = function (error){
      console.log({ message: "Error Adding Product to Wishlist" });
    }

    let lid = window.swymSelectedListId;

    swat.addToList(lid, product, onSuccess, onError);
}

/* Remove product from wishlist action. */

const removeFromWishlist = (swat, product) => {
  let onSuccess = async function(deletedProduct) {
    console.log('Product has been removed from wishlist!', deletedProduct);
  }
  
  let onError = function(error) {
     console.log({ message: "Error removing Product from Wishlist" });
  }

  let lid = window.swymSelectedListId;

  swat.deleteFromList(lid, product, onSuccess, onError);
}


async function fetchProductById(productUrl) {
    try {
        const response = await fetch(`${productUrl}.json`);
        if (!response.ok) throw new Error("Failed to fetch product data");
        return await response.json();
    } catch (error) {
        console.error("Error fetching product details:", error);
        return null;
    }
}



window.onload = async function () {
  createList(_swat);
  await fetchList(_swat);
  await markWishlistItems(_swat);

  document.querySelectorAll("[data-favorite]").forEach(item => {
    item.addEventListener("click", async function (event) {
      event.preventDefault();
      await handleWishlistClick(event, _swat);
    });
  });



     const wishlistContainer = document.querySelector(".custom-wishlist-container");
    if (!wishlistContainer) return;

    try {
        const lists = await fetchList(window._swat);
        if (!lists || lists.length === 0) return;

        const wishlistItems = lists[0].listcontents;
        wishlistContainer.innerHTML = "";

        for (const item of wishlistItems) {
            const productData = await fetchProductById(item.du);
            if (!productData) continue;
            
            const product = productData.product;
          console.log(product)
            const comparePrice = product.variants[0].compare_at_price ? `<span class="custom-basket-tabs-content-product-price-old">${(product.variants[0].compare_at_price / 100).toFixed(2)} USD</span>` : "";
            
            const listItem = document.createElement("li");
            listItem.classList.add("custom-basket-tabs-content-product");
            listItem.innerHTML = `
                <a href="${product.url}">
                    <img src="${product.image.src}" alt="${product.title}">
                    <h3>${product.title}</h3>
                    <div class="remove-from-favorite added" data-favorite='${item.empi}' data-variant-id='${item.epi}' data-product-url="${item.du}">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="white"></rect> <path d="M7 17L16.8995 7.10051" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M7 7.00001L16.8995 16.8995" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
</div>
                    <div class='custom-basket-tabs-content-product-info'>
                        <div class="custom-basket-tabs-content-product-price">
                            ${comparePrice}
                            <span class="custom-basket-tabs-content-product-price-new">${product.variants[0].price} USD</span>
                        </div>
                        <div class='custom-basket-tabs-content-product-cart'>

                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="23" viewBox="0 0 20 23" fill="none" plerdy-tracking-id="42539113713">
                                                            <path d="M8.92459 0.0243473C8.15108 0.166836 7.34196 0.487432 6.73639 0.894539C6.25804 1.21514 5.54051 1.97337 5.24536 2.4619C4.80772 3.19978 4.55328 4.14121 4.55328 5.04194V5.41342L3.57622 5.43378C2.61443 5.44904 2.58899 5.45413 2.31419 5.59153C1.82567 5.84597 1.47963 6.25308 1.30152 6.79758C1.24554 6.97569 0.329549 19.5349 0.314283 20.3135C0.304105 21.0972 0.690856 21.7333 1.38803 22.0743L1.72898 22.2422H9.74389H17.7588L18.0489 22.1048C18.6341 21.83 19.0615 21.2804 19.1582 20.6748C19.2193 20.283 18.2779 7.13345 18.1608 6.74669C18.0082 6.23781 17.6723 5.84597 17.1736 5.59153C16.8988 5.45413 16.8733 5.44904 15.9217 5.43378L14.9498 5.41851L14.9141 4.91471C14.8633 4.09541 14.7055 3.47966 14.3747 2.82829C13.7081 1.5052 12.5377 0.548498 11.1128 0.151569C10.726 0.0447025 10.497 0.0192585 9.89655 0.00399208C9.48945 -0.00618553 9.05181 0.00399208 8.92459 0.0243473ZM10.4818 1.7342C10.6802 1.77491 11.0517 1.9123 11.3112 2.03953C12.4155 2.58912 13.1483 3.70357 13.2399 4.97069L13.2704 5.4236H9.74389H6.21733L6.24786 4.97069C6.31402 4.06488 6.65497 3.31682 7.31143 2.66545C7.9628 2.01917 8.79737 1.66804 9.71844 1.66295C9.94235 1.66295 10.2884 1.69349 10.4818 1.7342ZM4.59908 9.23513C4.57872 11.3877 4.57872 11.4233 4.68559 11.5658C4.87896 11.8253 5.09778 11.9373 5.41329 11.9373C5.75424 11.9373 5.94253 11.8304 6.11555 11.5455L6.23259 11.3521V9.19951V7.05202H9.74389H13.2552V9.18933C13.2552 11.2198 13.2603 11.3419 13.357 11.5251C13.6318 12.0696 14.4154 12.09 14.8022 11.5658C14.904 11.4233 14.9091 11.3623 14.9243 9.23513L14.9396 7.04694L15.6724 7.0622C16.2678 7.07238 16.4204 7.09274 16.4917 7.15889C16.6138 7.28611 17.5502 20.3033 17.4433 20.4713L17.3771 20.5883H9.74389H2.11064L2.04449 20.4713C1.98342 20.3746 2.03431 19.4993 2.44141 13.81C2.70094 10.2122 2.92994 7.24031 2.9503 7.20469C3.02154 7.08765 3.21492 7.05711 3.91209 7.05711L4.61435 7.05202L4.59908 9.23513Z" fill="white" style="fill:white;fill-opacity:1;"></path>
                                                        </svg>
                                    <product-form class="product-form" data-hide-errors="" data-section-id="template--24328161034617__custom_basket_bBtrxc">
                                                                          
                            <form method="post" action="/cart/add" accept-charset="UTF-8" class="form" enctype="multipart/form-data" novalidate="novalidate" data-type="add-to-cart-form">
                                <input type="hidden" name="form_type" value="product">
                                <input type="hidden" name="utf8" value="✓">
                                <input type="hidden" name="id" value="${product.variants[0].id}" class="product-variant-id">
                                <div class="product-form__buttons">
                                    <button type="submit" name="add" class="product-form__submit button button--full-width button--primary">
                                        <div class="loading__spinner hidden"></div>
                                    </button>
                                </div>
                                <input type="hidden" name="product-id" value="${product.id}">
                                <input type="hidden" name="section-id" value="template--24328161034617__custom_basket_bBtrxc">
                            </form>
                             </product-form> 
                        </div>
                    </div>
                </a>
            `;
            listItem.style.display = "block";
            wishlistContainer.appendChild(listItem);
        }
    } catch (error) {
        console.error("Error loading wishlist items:", error);
    }



    document.querySelectorAll(".remove-from-favorite").forEach(item => {
      item.addEventListener("click", async function (event) {
        item.closest('a').remove();
        event.preventDefault();
        await handleWishlistClick(event, _swat);
      });
    });
  

  
};



