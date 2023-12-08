var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = "https://code.jquery.com/jquery-2.2.1.min.js";
import ResilientSDK from 'https://cdn.resilientdb.com/resilient-sdk.js';

const sdk = new ResilientSDK();

// Then bind the event to the callback function.
// There are several events for cross browser compatibility.
script.onreadystatechange = handler;
script.onload = handler;

// Fire the loading
head.appendChild(script);

var flag;
var currentRole;

var user_name;
var ssn;
var role;

var user_public_key;

document.getElementById('formreg')!= null ? document.getElementById('formreg').addEventListener('submit', handleRegistration) : '';
document.getElementById('formlogin')!= null ? document.getElementById('formlogin').addEventListener('submit', handleLogin) : '';

document.getElementById('formaddland')!= null ? document.getElementById('formaddland').addEventListener('submit', handleAddLand) : '';

function handler(){
    console.log('jquery added :)');
}

var overlay; // Declare a variable to store the overlay element

function showLoader() {
  // Create overlay element
  overlay = document.createElement("div");
  overlay.className = "overlay";
  document.body.appendChild(overlay);

  // Create loader element
  var loader = document.createElement("div");
  loader.className = "loader";
  overlay.appendChild(loader);
}

// Function to hide the loader
function hideLoader() {
  var loaderContainer = document.querySelector(".loader-container");
  if (loaderContainer) {
    loaderContainer.remove();
  }
  if (overlay) {
    overlay.remove(); 
    overlay = null;   
  }
}


sdk.addMessageListener((event) => {
    const message = event.data.data;
    var nexres_response = message;
    console.log(nexres_response);
    console.log(flag);

    if (flag == "create-user") {
      console.log("inside addMessageListener");
      var user_public_key = nexres_response;
      localStorage.setItem("currentPublicKey", user_public_key);
      var base_initial_amount = 10000;
      var user_details = ` "name": "${user_name}", "ssn": "${ssn}",  "role": "${role}",  "type": "balance", "timestamp": ${new Date().getTime()}`
      // commit - i.e. send user details to resDb
      flag = "show-dashboard";
      sdk.sendMessage({
        direction: "commit-page-script",
        message: user_details,
        amount: base_initial_amount,
        address: user_public_key,
      });
    } else if (flag == "show-dashboard") {
      console.log("user registered");
      showLoader();
      setTimeout(function () {
      if (currentRole == "buyer") {
        window.location.href = './buyer_dashboard.html'
      } else if (currentRole == "seller") {
        window.location.href = './seller_dashboard.html'
      }
      hideLoader();
    }, 3000);

      flag = "user-logged-in";
    }else if(flag == "land-added"){
      alert("Land Added")
      window.location.href = './seller_dashboard.html'
      
    } else if (flag=="user-logged-in") {
      console.log("bugggggggggg");
      alert("bugggggggggg");
    } else if (flag == "login-user") {
      console.log("inside addMessageListener");
      var user_public_key = nexres_response;
      localStorage.setItem("currentPublicKey", user_public_key);
      
      flag = "show-dashboard";
    }

});

function handleAddLand(event) {
  event.preventDefault();
  $("#initial").fadeOut("normal", function(){
    $("#loader").fadeIn("normal");
  });
  flag = "create-user";
  

  const formData = new FormData(event.target);
  var land_name = formData.get("city");
  var state = formData.get("state");
  var price = formData.get("price");
  var plot_no = formData.get("plot_no");
  var zip_code = formData.get("zip_code");
  var type = "land";
  console.log(price);

  var land_details = `"id":"${plot_no+zip_code}" , "name": "${land_name}", "state": "${state}",  "price": "${price}" , "type":"${type}",  "timestamp": ${new Date().getTime()}, "status": "available"`
  user_public_key = localStorage.getItem('currentPublicKey')
  sdk.sendMessage({
    direction: "commit-page-script",
    message: land_details,
    address: user_public_key,
    amount: price
  });
   flag = "land-added"
}

function handleRegistration(event) {
  event.preventDefault();
  $("#initial").fadeOut("normal", function(){
    $("#loader").fadeIn("normal");
  });
  flag = "create-user";
  sdk.sendMessage({
    direction: "account-page-script",
  });

  const formData = new FormData(event.target);
  user_name = formData.get("name");
  ssn = formData.get("ssn");
  role = formData.get("role");
  
  if(formData.get('role') == 'role-buyer'){
    currentRole = "buyer";
  }else if(formData.get('role') == 'role-seller'){
    currentRole = "seller";
  }
  localStorage.setItem('role', currentRole);
  localStorage.setItem('user_name', user_name);
}

function handleLogin(event) {
  console.log("handle login");
  event.preventDefault();
  $("#initial").fadeOut("normal", function(){
    $("#loader").fadeIn("normal");
  });
  flag = "login-user";
  sdk.sendMessage({
    direction: "account-page-script",
  });
}

// export async function getAllLands() {
//   var transactions = await getAllTransactions(user_public_key);
//   console.log(transactions);
// }

// function getAllTransactions(key) {
//   const url = 'https://cloud.resilientdb.com/graphql';
//   const graphqlQuery = `
//       query {
//           getFilteredTransactions(filter: {
//               ownerPublicKey: ""
//               recipientPublicKey: "${key}"
//           }) {
//               id
//               version
//               amount
//               metadata
//               operation
//               asset
//               publicKey
//               uri
//               type
//           }
//       }
//   `;

//   const payload = {
//       query: graphqlQuery
//   };

//   const headers = {
//       'Content-Type': 'application/json',
//       // Add any other headers as needed (e.g., authorization headers)
//   };

//   return fetch(url, {
//       method: 'POST',
//       headers: headers,
//       body: JSON.stringify(payload)
//   })
//   .then(response => response.json())
//   .then(data => {
//       return data;
//   })
//   .catch(error => {
//       console.error('Error:', error);
//       setTimeout(() => longPoll(key), 15000); // Retry after 5 seconds in case of error
//   });
// }