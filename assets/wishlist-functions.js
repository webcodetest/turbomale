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
  const productUrl = item.closest('a').getAttribute('href'); // URL страницы, где товар находится

  const product = {
    epi: Number(productId),
    empi: Number(productId),
    du: productUrl, // Обязательно нужен URL
  };

  console.log(product)

  const lists = await fetchList(swat);
  const isInWishlist = lists.some(list =>
    list.listcontents.some(product => product.epi == Number(productId))
  );

  if (isInWishlist) {
    removeFromWishlist(swat, product);
    item.classList.remove("added");
  } else {
    addToWishlist(swat, product);
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
};



