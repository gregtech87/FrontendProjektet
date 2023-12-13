const appContainer = document.getElementById("app");
let deleteMessageFromBackend;


let ref1 = document.querySelector("#cus");
ref1.addEventListener('click', function (){
    renderPage('user', 'tyra', 'tyra');
})
let ref2 = document.querySelector("#adm");
ref2.addEventListener('click', function (){
    renderPage('admin', 'lasse', 'lasse');
});

let ref3 = document.querySelector("#logggg");
ref3.addEventListener('click', function (){
    renderPage('login');
});
let ref4 = document.querySelector("#nofo");
ref4.addEventListener('click', function (){
    renderPage('nope', 'poopyMcPoopface');
});


function renderPage(route, user, pass) {
username = user;
password = pass;
    switch (route) {
        case "login":
            displayLoginForm();
            break;
        case "user":
            displayCustomerDashboard();
            break;
        case "admin":
            displayAdminDashboard();
            break;
        default:
            displayNotFound();
    }
}



// Rendering functions for customer and admin dashboards
function displayLoginForm() {
    appContainer.innerHTML = `
      <section id="loginSection" class="loginPage">
        <form id="loginForm" onsubmit= "login();return false;">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required>

          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required>

          <button type="submit" >Login</button>
        </form>
      </section>
    `;
}

function displayAdminDashboard() {

    appContainer.innerHTML = `
      <section>
        <h2>Welcome "${username}" to Admin Dashboard</h2>
        <!-- Additional content for admin dashboard -->
          <h1>Admin Portal</h1>
  <nav>
        <a href="#" id="customers">Customers</a>
        <a href="#" id="destinations">Destinations</a>
        <a href="#" id="trips">Booked trips</a>
    </nav>

    <section id="adminContent">
        <!-- Content will be loaded dynamically here -->
    </section>
    `;
    createAdminButtons();
}

function displayNotFound() {
    appContainer.innerHTML = `
      <section>
        <h2>404 User: "${username}" Not Found</h2>
      </section>
    `;
}

// *************** ADMIN STUFF START **********************

function createAdminButtons() {
    let adminCust = document.querySelector('#customers');
    adminCust.addEventListener('click', function () {
        loadContent('customer');
    });
    let adminDest = document.querySelector('#destinations');
    adminDest.addEventListener('click', function () {
        loadContent('destination');
    });
    let adminTrip = document.querySelector('#trips');
    adminTrip.addEventListener('click', function () {
        loadContent('trips');
    });

}

function loadContent(topic) {
    let mainDiv = document.querySelector('#adminContent');

    switch (topic) {
        case 'customer':
            mainDiv.innerHTML = `
            <h2>Kunder</h2>
            <button onclick="addCustomer()" class="stdbutton posbutton">Add Customer</button>
            <table>
                <thead>
                    <tr>
                        <th>Customer id</th>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Authority</th>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Date Of Birth</th>
                        <th>Street</th>
                        <th>Postal Code</th>
                        <th>City</th>
                        <th>Trips Booked</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="customerTableBody">
                     <!-- Content will be loaded dynamically here -->
                </tbody>
            </table>
            `;
            fetchCustomers();
            break;
        case 'destination':
            mainDiv.innerHTML =
                `
                <h2>Destinations</h2>
                <button onclick="addDestination()"  class="stdbutton posbutton">Add Destination</button>
                <table>
                    <thead>
                        <tr>
                            <th>Destination id</th>
                            <th>Hotell</th>
                            <th>Price Per Week (SEK)</th>
                            <th>Country</th>
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="destinationTableBody">
                         <!-- Content will be loaded dynamically here -->
                    </tbody>
                </table>
                `;
            fetchDestinations();
            break;
        case 'trips':
            mainDiv.innerHTML =
                `
                <h2>Booked Trips</h2>
<!--                <button onclick="addDestination()"  class="stdbutton posbutton">Add Trip</button> -->
                <table>
                    <thead>
                        <tr>
                            <th>Trip id</th>
                            <th>Departure Date</th>
                            <th>Number Of Weeks</th>
                            <th>Total Price(SEK)</th>
                            <th>Total Price(PLN)</th>
                            <th></th>
                            <th>Destination Id</th>
                            <th>Hotell Name</th>
                            <th>Price Per Week (SEK)</th>
                            <th>Country</th>
                            <th>City</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="tripTableBody">
                         <!-- Content will be loaded dynamically here -->
                    </tbody>
                </table>
                `;
            fetchTrips();
            break;
        default:
            mainDiv.innerHTML = `
            < h2 > Page not found < /h2>
            `;
            break;
    }
}

async function fetchCustomers() {
    const customerTableBody = document.getElementById('customerTableBody');

    const url = 'http://localhost:8585/api/v1/customers';
    const base64 = btoa(`${username}:${password}`);
    const response = await fetchDataGet(url, base64);
    let data = await response.json();

    data.forEach(customer => {
        customerTableBody.innerHTML += `
                    <tr>
                        <td>${customer.customerId}</td>
                        <td>${customer.userName}</td>
                        <td>${customer.password.substring(6)}</td>
                        <td>${customer.authority.substring(5)}</td>
                        <td>${customer.firstName}</td>
                        <td>${customer.lastName}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.dateOfBirth}</td>
                        <td>${customer.address.street}</td>
                        <td>${customer.address.postalCode}</td>
                        <td>${customer.address.city}</td>
                        <td>${customer.trips.length}</td>
                        <td>${customer.active}</td>
                        <td class="editButtons">
                            <button onclick="updateCustomer(${customer.customerId})" class="stdbutton">Update</button>
                            <button onclick="deleteCustomer(${customer.customerId})" class="stdbutton negbutton">Remove</button>
                        </td>
                    </tr>
                `;
        if (customer.trips.length > 0){
            customerTableBody.innerHTML += `
            <tr style="background-color: #f2f2f2">
                <td>Trip id</td>
                <td>Departure Date</td>
                <td>Number Of Weeks</td>
                <td>Total Price(SEK)</td>
                <td>Total Price(PLN)</td>
                <td></td>
                <td>Destination Id</td>
                <td>Hotell Name</td>
                <td>Price Per Week (SEK)</td>
                <td>Country</td>
                <td>City</td>
            </tr>
            `;
            customer.trips.forEach(trip => {
                customerTableBody.innerHTML += `
                             <tr>
                                <td>${trip.tripId}</td>
                                <td>${trip.departureDate}</td>
                                <td>${trip.numberOfWeeks}</td>
                                <td>${trip.totalPriceSEK}</td>
                                <td>${trip.totalPricePLN}</td>
                                <td>-</td>
                                <td>${trip.destination.id}</td>
                                <td>${trip.destination.hotellName}</td>
                                <td>${trip.destination.pricePerWeek}</td>
                                <td>${trip.destination.country}</td>
                                <td>${trip.destination.city}</td>
                    </tr>
                `;
            })

        }
        customerTableBody.innerHTML += `<tr style="background: #333333"><td colspan="100%"></td> </tr>`;
    });

}

async function deleteCustomer(customerId) {

    const url = 'http://localhost:8585/api/v1/customers/' + customerId;
    const base64 = btoa(`${username}:${password}`);
    const response = await fetchDataGet(url, base64);
    let data = await response.json();
    console.log(data);
    console.log(data.userName);


    if(data.userName !== username){
        await fetchDataDelete(url, base64);
        // Uppdatera tabellen efter borttagning
        loadContent('customer');
    } else {
        confirm("Logged in as \"" + username + "\". Login with different user before deleting user!");
    }

}


// *************** ADMIN STUFF END **********************

// *************** DESTINATION STUFF START **********************
async function fetchDestinations() {
    const destinationTableBody = document.getElementById('destinationTableBody');

    const url = 'http://localhost:8585/api/v1/trips';
    const base64 = btoa(`${username}:${password}`);
    const response = await fetchDataGet(url, base64);
    let data = await response.json();

    data.forEach(destination => {
        destinationTableBody.innerHTML += `
                    <tr>
                        <td>${destination.id}</td>
                        <td>${destination.hotellName}</td>
                        <td>${destination.pricePerWeek}</td>
                        <td>${destination.country}</td>
                        <td>${destination.city}</td>
                        <td class="editButtons">
                            <button onclick="updateDestination(${destination.id})" class="stdbutton">Update</button>
                            <button onclick="deleteDestinations(${destination.id})" class="stdbutton negbutton">Remove</button>
                        </td>
                    </tr>
                `;
    });
}

async function deleteDestinations(destinationId) {

    const url = 'http://localhost:8585/api/v1/destination/' + destinationId;
    const base64 = btoa(`${username}:${password}`);
    await fetchDataDelete(url, base64);

    console.log('dddaaaata: '+deleteMessageFromBackend);
    if (deleteMessageFromBackend.length > 60){
        confirm(deleteMessageFromBackend);
    }
    loadContent('destination');
}

// *************** DESTINATION STUFF END **********************