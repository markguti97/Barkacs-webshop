console.log("Ajax");

function request(method, url, cbfn){

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function(){

        if (this.readyState == 4 && this.status == 200){

            cbfn(this.responseText);
        }

    }

    xhttp.open(method, url);
    xhttp.send();
}

function request1(o){

    var xhttp = new XMLHttpRequest();

    o.method = o.method || "GET";
    o.params = o.params || {};

    o.contentType = o.contentType || "application/x-www-form-urlencoded";

    o.success = o.success || function(){};

    xhttp.onreadystatechange = function(){

        if (this.readyState == 4 && this.status == 200)
            o.success(this.responseText);

    }

    var paramsTmp = [];
    var paramsStr = "";
    
    if (o.contentType != "application/json"){ // ?name=Gyalu&price=4500
        for (let key in o.params)
            paramsTmp.push(`${key}=${o.params[key]}`);

        paramsStr = paramsTmp.join("&");

    }else paramsStr = JSON.stringify(o.params);

    xhttp.open(o.method, o.url + (o.method == "GET" ? "?" + paramsStr : "" ));
    xhttp.send(paramsStr);
}

var products = [];
var cart = [];
var filteredProducts = [];
var editedId = null;
var view = 'shop';              // "shop" vagy "cart" ertekeket vehet fel

var productFilter = {

    byId: function(id){
        return products.find( p => p._id == id );
    }
}
// template a termékeknek
var productTpl = (p) =>                                              
`                                                                       
    <div class="product" data-id="${p._id}">
        <div class="inner-ct">
            <div class="pimage"><img src="${p.img || 'img/noimage.jpg'}"></div>
            <div class="pname">${p.name}</div>
            <div class="price">${p.price}</div>
        </div>
        <div class="pfooter">
            <a class="cartlink" >&#128722;</a>
            <a class="dellink">X</a>
            <a class="editlink">&#9998;</a>
        </div>
    </div>
`;                              

var content = document.querySelector("#termekek");

function renderProduct(products){                                                           // termékek renderelése

    content.innerHTML = "";

    for (let product of products){
        content.innerHTML += productTpl(product);
    }

    var productElements = document.querySelectorAll(".product");

    productElements.forEach(function(productBox){
        var productId = productBox.dataset.id;

        productBox.querySelector(".cartlink").onclick = function(){                                 // kosárba helyezés
            
            cart.push( productFilter.byId(productId) );

            document.querySelector("button#cart span").innerHTML = cart.length;
        }

        productBox.querySelector(".editlink").onclick = function(){                                 //termék szerkesztése
            var prod = productFilter.byId(productId);

            if (editedId)
                document.querySelector(`.product[data-id="${editedId}"]`).classList.remove("highlight");

            document.getElementById("name").value = prod.name;
            document.getElementById("ar").value = prod.price;

            editedId = productId;

            productBox.classList.add("highlight");
        }

        productBox.querySelector(".dellink").onclick = function(){                                      //termék törlése (ha kosár nézetben vagyunk, akkor a kosárból, ellenben az adatbázisból)
            console.log(productId);

            switch (view) {                                                                                 
                case 'shop':
                    request1({
                        method: "DELETE",
                        url: productId, 
                        success: function(res){
                            var response = JSON.parse(res);
        
                            if (response.deleted == "OK")
                                document.querySelector("#termekek-betolt").onclick();
                        }
                    });
                break;
                case 'cart':
                    var productIndex = cart.findIndex( p => p._id === productId );

                    if (productIndex > -1)
                        cart.splice(productIndex, 1);

                    renderProduct(cart);

                    document.querySelector("button#cart span").innerHTML = cart.length;

                break;
            }

        }

    });

}

document.querySelector("#termekek-betolt").onclick = function(){                                // termékek betöltése a képernyőre

    request("GET", "/products", function(res){

        products = JSON.parse(res);

        renderProduct(products);

        view = 'shop';
    
    });
}

document.querySelector("#newproduct").onclick = function(){                                     // új termék létrehozása az adatbázisban

    fetch(editedId == null ? "/newproduct" : "/editproduct", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: document.getElementById("name").value,
            price: document.getElementById("ar").value,
            id: editedId
        })
    }).
    then( res => res.json()).
    then( data => {

        console.log(data);

        document.querySelector("#termekek-betolt").onclick();

        document.getElementById("name").value = "";
        document.getElementById("ar").value = "";

        editedId = null;
    });

};

document.querySelector("#cart").onclick = function(){                   // kosár
    console.log(cart);
    renderProduct(cart);
    content.innerHTML += `
        <div style="display: block;">
            <button>Tovabb a fizeteshez</button>
        <div>
    `;
    view = 'cart';
}


/*
document.querySelector("#filter").onclick = function(){

    var category = document.getElementById("select").value;

    filteredProducts = products.filter(function(prod){
        return prod.kategoria.includes(category);
    });

    renderProduct(filteredProducts);
}
*/