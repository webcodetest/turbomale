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
    list.listcontents.some(item => item.epi === productId)
  );
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
      swat.ui.showErrorNotification({ message: "Error Adding Product to Wishlist" });
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
    swat.ui.showErrorNotification({ message: "Error removing Product from Wishlist" });
  }

  let lid = window.swymSelectedListId;

  swat.deleteFromList(lid, product, onSuccess, onError);
}



  window.onload = function() {
    createList(_swat);
    fetchList(_swat);

    document.querySelectorAll("[data-favorite]").forEach(item => {
      item.addEventListener("click", function(event){
        event.preventDefault();
          const id = item.getAttribute("data-favorite");
                const result = await isProductInWishlist(_swat, id)
        
          console.log(result);
      })
    })
      document.body.addEventListener("click", function(event) {
            if (event.target.matches("[data-favorite]")) {
                const id = event.target.getAttribute("data-favorite");
                console.log(`Кнопка с data-favorite="${id}" нажата!`);
            }
        });
  };


