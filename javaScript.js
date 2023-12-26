const appContainer = document.getElementById("app");
let loggedInUsername;
let loggedInPassword;
let base64credentials = btoa(`${loggedInUsername}:${loggedInPassword}`);
let updatedCustomer = {};
let updatedCustomerAddress = {};
let updatedCustomerTrips = {};

let ref1 = document.querySelector("#cus");
ref1.addEventListener('click', function () {
    renderPage('user', 'tyra', 'tyra');
})
let ref2 = document.querySelector("#adm");
ref2.addEventListener('click', function () {
    renderPage('admin', 'lasse', 'lasse');
});

let ref3 = document.querySelector("#logggg");
ref3.addEventListener('click', function () {
    renderPage('login');
});
let ref4 = document.querySelector("#nofo");
ref4.addEventListener('click', function () {
    renderPage('nope', 'poopyMcPoopface');
});

function displayLoginForm() {
    appContainer.innerHTML = `
      <section id="loginSection" class="loginPage">
        <form class="loginForm" id="loginForm" onsubmit= "login();return false;">
          <label for="username">Username:</label>
          <input type="text" id="loginUsername" name="username" required>

          <label for="password">Password:</label>
          <input type="password" id="loginPassword" name="password" required>
          <div class="editButtons">
          <button type="submit" class="save posbutton">Login</button>
          <button type="button" onclick="renderPage('start')" class="save negbutton">Return</button>
          </div>
        </form>
      </section>
    `;
}

async function login() {
    loggedInUsername = document.getElementById('loginUsername').value;
    loggedInPassword = document.getElementById('loginPassword').value;
    base64credentials = btoa(`${loggedInUsername}:${loggedInPassword}`);
    const url = 'http://localhost:8585/api/v1/customers';
    try {
        const response = await fetchDataGet(url, base64credentials);
        let data = await response.json();
        data.forEach(customer => {
            console.log(customer);
            let customerRole;
            if (customer.userName === loggedInUsername) {
                let role = customer.authority;
                if (role.length > 6) {
                    customerRole = role.substring(5);
                }
                renderPage(customerRole.toLowerCase());
            }
        });
    } catch (e) {
        renderPage('noRoute',loggedInUsername);
    }
}

function logout() {
    loggedInUsername = "";
    loggedInPassword = "";
    renderPage('start')
}

function renderPage(route, user, pass) {
    loggedInUsername = user;
    loggedInPassword = pass;
    base64credentials = btoa(`${loggedInUsername}:${loggedInPassword}`);
    switch (route) {
        case "login":
            displayLoginForm();
            break;
        case "start":
            displayCustomerDashboard();
            break;
        case "admin":
            displayAdminDashboard();
            break;
        default:
            displayNotFound(loggedInUsername);
    }
}

function displayNotFound(username) {
    appContainer.innerHTML = `
      <section>
        <h2>404 User: "${username}" Not found or wrong password</h2>
      </section>
    `;
}

// *************** ADMIN PAGE STUFF START **********************

function displayAdminDashboard() {

    appContainer.innerHTML = `
      <section>
        <nav>
            <a href="#" id="customers">Customers</a>
            <a href="#" id="destinations">Destinations</a>
            <a href="#" id="trips">Booked trips</a>
            <a href="#" id="logout">Logout</a>
        </nav>
        <h2 style="text-align: center">Welcome "${loggedInUsername}" to Admin Dashboard</h2>
      </section>   
      <section id="adminContent">
      <img src="images/admin.png">
      <img src="images/admin.png">
      <img src="images/admin.png">
      <img src="images/admin.png">
      <img src="images/admin.png">
      <img src="images/admin.png">
      <img src="images/admin.png">
      <!-- Content will be loaded dynamically here -->
      </section>
    `;
    createAdminButtons();
}

function createAdminButtons() {
    let adminCust = document.querySelector('#customers');
    adminCust.addEventListener('click', function () {
        loadAdminContent('customer');
    });
    let adminDest = document.querySelector('#destinations');
    adminDest.addEventListener('click', function () {
        loadAdminContent('destination');
    });
    let adminTrip = document.querySelector('#trips');
    adminTrip.addEventListener('click', function () {
        loadAdminContent('trips');
    });
    let logoutBtn = document.querySelector("#logout");
    logoutBtn.addEventListener('click', function () {
        logout();
    });
}

function loadAdminContent(topic, customerId) {
    let mainDiv = document.querySelector('#adminContent');

    switch (topic) {
        case 'customer':
            displayCustomers(mainDiv);
            break;
        case 'destination':
            displayDestinations(mainDiv);
            break;
        case 'trips':
            displayTrips(mainDiv);
            break;
        case 'addCustomers':
            displayAddCustomer(mainDiv);
            break;
        case 'addCustomerTrip':
            displayAddCustomerTrip(mainDiv, customerId);
            break;
        case 'updateCustomers':
            displayUpdateCustomer(mainDiv, customerId);
            break;
        case 'addDestination':
            displayDestinationForm(mainDiv);
            break
        default:
            mainDiv.innerHTML = `
            < h2 > Page not found < /h2> 
            `;
            break;
    }
}

// *************** CUSTOMER STUFF START **********************

function displayCustomers(mainDiv) {

    mainDiv.innerHTML = `
            <h2>Customers</h2>
            <button onclick="loadAdminContent('addCustomers')" class="stdbutton posbutton">Add Customer</button>
            <table id="customerTable" class="table-sortable">
                <thead>
                    <tr>
                        <th>Customer id</th>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Authority</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Date Of Birth</th>
                        <th>Address id</th>
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
}

async function fetchCustomers() {
    activateSortingForTables();
    const customerTableBody = document.getElementById('customerTableBody');

    const url = 'http://localhost:8585/api/v1/customers';
    const response = await fetchDataGet(url, base64credentials);
    let data = await response.json();

    data.forEach(customer => {
        let id = customer.customerId;
        if(customer.customerId < 10){
            id ='0' + customer.customerId;
        }
        customerTableBody.innerHTML += `
                    <tr>
                        <td>${id}</td>
                        <td>${customer.firstName}</td>
                        <td>${customer.lastName}</td>
                        <td>${customer.userName}</td>
                        <td>${customer.password.substring(6)}</td>
                        <td>${customer.authority.substring(5)}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.dateOfBirth}</td>
                        <td>${customer.address.id}</td>
                        <td>${customer.address.street}</td>
                        <td>${customer.address.postalCode}</td>
                        <td>${customer.address.city}</td>
                        <td>${customer.trips.length}</td>
                        <td>${customer.active}</td>
                        <td class="editButtons">
                            <button onclick="loadAdminContent('updateCustomers', ${customer.customerId})" class="stdbutton">Update</button>
                            <button onclick="deleteCustomer(${customer.customerId})" class="stdbutton negbutton">Remove</button>
                        </td>
                    </tr>
                `;
    });
    sortTableByColumn(document.getElementById('customerTable'), 0, true);
}

function displayAddCustomer(mainDiv) {
    mainDiv.innerHTML =
        `
                <h2>Add Customers lägga till "info, error och success" rutor</h2>
<!--         <form class="loginForm" id="loginForm" onsubmit= "login();return false;">-->
<div class="container">
            <form id="form" class="form" onsubmit="saveNewCustomer(event)";return false;>
                <div class="column one">
                    <div class="field firstname">
                        <label for="firstName">Firstname:</label>
                        <input type="text" name="firstName" id="firstName" placeholder="Firstname" required>
                    </div>
                    <div class="field lastname">
                        <label for="lastName">Lastname:</label>
                        <input type="text" name="lastName" id="lastName" placeholder="Lastname" required>
                    </div>
                    <div class="field username">
                        <label for="Username">Username:</label>
                        <input type="text" name="userName" id="Username" maxlength="20" placeholder="Username" required>
                    </div>
                    <div class="field password">
                        <label for="Password">Password:</label>
                        <input type="password" name="password" id="Password" minlength="8" maxlength="20" placeholder="type a complex password" required>
                    </div>
                    <div class="field email">
                        <label for="Email">Email:</label>
                        <input type="email" name="email" id="Email"  placeholder="type a valid email" required>
                    </div>                    
                    <div class="field">
                        <label for="postalCode">Postal Code:</label>
                        <input type="number" id="postalCode" name="postalCode" placeholder="Postal Code" required>
                    </div>
                </div>
                <div class="column two">
                    <div class="field phone">
                        <label for="Phone_">Phone:</label>
                        <input type="number" name="phone" id="Phone" pattern="[0-9]{10}" placeholder="07########">
                    </div>
                    <div class="field dateOfBirth">
                        <label for="dateOfBirth">Date of birth:</label>
                        <input type="date" name="dateOfBirth" id="dateOfBirth" required>
                    </div>                   
                    <div class="field authority">
                        <label for="authority">Authority:</label>
                        <input type="text" id="authority" name="authority" placeholder="Role: admin/user" required> 
                    </div>                   
                    <div class="field active">
                        <label for="active">Active:</label>
                        <input type="number" id="active" name="active" min="0" max="1" placeholder="1=Enabled, 0=Not enabled" required>
                    </div>                   
                    <div class="field">
                        <label for="street">Address:</label>
                        <input type="text" id="street" name="street" placeholder="Street" required>
                    </div>                    
                    <div class="field">
                        <label for="city">City:</label>
                         <input type="text" id="city" name="city" placeholder="City" required>
                    </div>
                     
                </div>
                    <div style="margin: auto">
                        <input type="submit" value="Save customer" class="save saveBackground" id="saveCustomer">
                        </div>
            </form>
        </div>
                `;
    let saveBtn = document.querySelector("#saveCustomer");
    saveBtn.addEventListener('click', function () {
        saveBtn.style.backgroundColor = '#009d00';
    });
}

async function saveNewCustomer(event) {
    event.preventDefault();
    const url = 'http://localhost:8585/api/v1/customers';
    let formUsername = document.getElementById("Username").value;
    let incomingRole = document.getElementById("authority").value;
    let password = document.getElementById("Password").value;
    let usernameInUse = await checkIfUsernameIsInUse(formUsername, url, 0);
    let fullRole;

    if (!usernameInUse) {
        fullRole = formatUserRole(incomingRole);
        if (fullRole === 'ROLE_USER' || fullRole === 'ROLE_ADMIN') {

            password = formatPassword(password);

            let trips = [];
            let address = {
                street: document.getElementById("street").value,
                city: document.getElementById("city").value,
                postalCode: document.getElementById("postalCode").value
            };
            let formData = {
                firstName: document.getElementById("firstName").value,
                lastName: document.getElementById("lastName").value,
                userName: document.getElementById("Username").value,
                password: password,
                email: document.getElementById("Email").value,
                phone: document.getElementById("Phone").value,
                dateOfBirth: document.getElementById("dateOfBirth").value,
                authority: fullRole,
                active: document.getElementById("active").value,
                address,
                trips
            };
            await fetchDataPost(url, base64credentials, formData);
            loadAdminContent('customer');
        }
    }
}

function displayUpdateCustomer(mainDiv, customerId) {
    mainDiv.innerHTML =
        `
        <h2>Update Customers lägga till "info, error och success" rutor</h2>
<div style="display: flex">
        <div class="container">
            <h3>Cusomer id: <label id="updateCustomerID"></label></h3>
            <form id="formUpdateCustomer" class="form" onsubmit="storeUpdateCustomer(event)";return false;>
                <div class="column one">
                    <div>   
                        <input type="hidden" name="customerId" id="customerIdUpdate"> 
                    </div>                    
                    <div class="field firstname">
                        <label for="firstNameUpdate">Firstname:</label>
                        <input type="text" name="firstName" id="firstNameUpdate" placeholder="Firstname" required>
                    </div>
                    <div class="field lastname">
                        <label for="lastNameUpdate">Lastname:</label>
                        <input type="text" name="lastName" id="lastNameUpdate" placeholder="Lastname" required>
                    </div>
                    <div class="field username">
                        <label for="UsernameUpdate">Username:</label>
                        <input type="text" name="userName" id="UsernameUpdate" maxlength="20" placeholder="Username" required>
                    </div>
                    <div class="field password">
                        <label for="PasswordUpdate">Password:</label>
                        <input type="text" name="password" id="PasswordUpdate" minlength="8" maxlength="20" placeholder="type a complex password" required>
                    </div>
                    <div class="field email">
                        <label for="EmailUpdate">Email:</label>
                        <input type="email" name="email" id="EmailUpdate"  placeholder="type a valid email" required>
                    </div>                    
                </div>
                <div class="column two">
                    <div class="field phone">
                        <label for="PhoneUpdate">Phone:</label>
                        <input type="text" name="phone" id="PhoneUpdate" pattern="[0-9]{10}" placeholder="07########">
                    </div>
                    <div class="field dateOfBirth">
                        <label for="dateOfBirthUpdate">Date of birth:</label>
                        <input type="date" name="dateOfBirth" id="dateOfBirthUpdate" required>
                    </div>                   
                    <div class="field authority">
                        <label for="authorityUpdate">Authority:</label>
                        <input type="text" id="authorityUpdate" name="authority" placeholder="Role: admin/user" required> 
                    </div>                   
                    <div class="field active">
                        <label for="activeUpdate">Active:</label>
                        <input type="number" id="activeUpdate" name="active" min="0" max="1" placeholder="1=Enabled, 0=Not enabled" required>
                    </div>                                        
                </div>
                <input type="submit" id="storeCustomerBtn" value="Store updates before saving" class="save saveBackground">
            </form>

        </div>
        <div class="container">
            <h3>Address id: <label id="updateAddressID"></label></h3>
            <form id="formUpdateCustomerAddress" class="form" onsubmit="storeUpdateCustomerAddress(event)";return false;>
                <div class="column one">
                     <div>   
                        <input type="hidden" name="id" id="addressIdUpdate"> 
                    </div>    
                    <div class="field">
                        <label for="postalCodeUpdate">Postal Code:</label>
                        <input type="number" id="postalCodeUpdate" name="postalCode" placeholder="Postal Code" required>
                    </div>
                          <div class="field">
                        <label for="streetUpdate">Address:</label>
                        <input type="text" id="streetUpdate" name="street" placeholder="Street" required>
                    </div>                    
                    <div class="field">
                        <label for="cityUpdate">City:</label>
                         <input type="text" id="cityUpdate" name="city" placeholder="City" required>
                    </div>
                </div>
                <input type="submit" id="storeCustomerAddressBtn" value="Store updates before saving" class="save saveBackground">
            </form>
        </div>
</div>
        <div class="btnList"> 
            <button onclick="loadAdminContent('addCustomerTrip', ${customerId})" class="save posbutton">Add Trip</button>  
            <input type="button" value="Save Changes" class="save neutralBtn" onclick="saveUpdatedCustomer()" id="saveAll">
            <input type="button" value="Return To Customerlist" class="save negbutton" id="returnBtn" onclick="loadAdminContent('customer')">
        </div>
                `;
    loadUpdateCustomerData(customerId, mainDiv);
}

async function loadUpdateCustomerData(customerId, mainDiv) {

    const url = 'http://localhost:8585/api/v1/customers/' + customerId;
    const response = await fetchDataGet(url, base64credentials);
    let customer = await response.json();
    document.querySelector('#updateCustomerID').innerHTML = customer.customerId;
    document.querySelector('#updateAddressID').innerHTML = customer.address.id;
    creatCustomerTripsUpdateFormAndFillThem(mainDiv, customer.trips, customerId)

    const customerForm = document.getElementById('formUpdateCustomer');
    const addressForm = document.getElementById('formUpdateCustomerAddress');

    // // Autofill forms with JSON data
    autofillForm(customerForm, customer);
    autofillForm(addressForm, customer.address);

    updatedCustomer = customer;
    updatedCustomerAddress = customer.address;
    updatedCustomerTrips = customer.trips;
}

function creatCustomerTripsUpdateFormAndFillThem (mainDiv, tripList, customerId){
    console.log(tripList);
    tripList.reverse().forEach(trip => {
        let index = trip.tripId;

        mainDiv.innerHTML += `
    <div class="container">
        <h3>Trip id: ${index}</h3>
        <form id="formUpdateCustomerTrip${index}" class="form" onsubmit="storeUpdateCustomerTrip(event, ${index})";return false;>
        <div class="column one">
            <div>
                <input type="hidden" name="tripId" id="tripId${index}">
            </div>
            <div class="field">
                <label for="departureDateTrip${index}">Departure Date:</label>
                <input type="date" id="departureDateTrip${index}" name="departureDate" required>
            </div>
            <div class="field">
                <label for="numberOfWeeksTripindex">Number Of Weeks:</label>
                <input type="number" id="numberOfWeeksTrip${index}" name="numberOfWeeks" placeholder="Duration in weeks" onchange="adjustTripPrice(${index})" required>
            </div>
            <div class="field">
                <label>Total Price(SEK): </label>
                <label id="totalPriceSEKTrip${index}" name="totalPriceSEK"></label></div>
            <div class="field">
                <label>Total Price(PLN): </label>
                <label id="totalPricePLNTrip${index}" name="totalPricePLN"></label> </div>
            <div class="field">
                <label>Destination Id: </label>
                <label id="destinationIdTrip${index}" name="destinationId"> </label>
            </div>
            <div class="field">
                <label>Destination HotellName: </label>
                <label id="destinationHotellNameTrip${index}" name="hotellName"> </label>
            </div>
            <div class="field">
                <label>Destination PricePerWeek(SEK): </label>
                <label id="destinationPricePerWeekTrip${index}" name="pricePerWeek"> </label>
            </div>
            <div class="field">
                <label>Destination City: </label>
                <label id="destinationCityTrip${index}" name="city"> </label>
            </div>
            <div class="field">
                <label>Destination Country: </label>
                <label id="destinationCountryTrip${index}" name="country"> </label>
            </div>
        </div>
        <div class="editTripBtnList"> 
        <input type="submit" id="storeCustomerTripBtn${index}" value="Store updates before saving" class="save saveBackground">
        <input type="button" id="removeCustomerTripBtn${index}" value="Remove Trip" class="save negbutton" onclick="deleteCustomerTrip(${index}, ${customerId})">
        </div>
        </form>
    </div>    
        `;
    });
    console.log(tripList);
    tripList.reverse().forEach(trip => {
        let index = trip.tripId;
        const tripForm = document.getElementById('formUpdateCustomerTrip'+index);
        const inputField1 = tripForm.querySelector(`[name="${'tripId'}"]`);
        const inputField2 = tripForm.querySelector(`[name="${'departureDate'}"]`);
        const inputField3 = tripForm.querySelector(`[name="${'numberOfWeeks'}"]`);
        const inputField4 = tripForm.querySelector(`[name="${'totalPriceSEK'}"]`);
        const inputField5 = tripForm.querySelector(`[name="${'totalPricePLN'}"]`);
        const inputField6 = tripForm.querySelector(`[name="${'destinationId'}"]`);
        const inputField7 = tripForm.querySelector(`[name="${'hotellName'}"]`);
        const inputField8 = tripForm.querySelector(`[name="${'pricePerWeek'}"]`);
        const inputField9 = tripForm.querySelector(`[name="${'city'}"]`);
        const inputField10 = tripForm.querySelector(`[name="${'country'}"]`);
        inputField1.value = trip['tripId'];
        inputField2.value = trip['departureDate'];
        inputField3.value = trip['numberOfWeeks'];
        inputField4.innerHTML = trip['totalPriceSEK'];
        inputField5.innerHTML = trip['totalPricePLN'];
        inputField6.innerHTML = trip.destination.id;
        inputField7.innerHTML = trip.destination.hotellName;
        inputField8.innerHTML = trip.destination.pricePerWeek;
        inputField9.innerHTML = trip.destination.city;
        inputField10.innerHTML = trip.destination.country;
    });
}

async function storeUpdateCustomer(event) {
    // Prevent the default form submission
    event.preventDefault();
    let customerBtn = document.querySelector("#storeCustomerBtn");
    customerBtn.style.backgroundColor = '#009d00';

    const url = 'http://localhost:8585/api/v1/customers';
    let username = document.getElementById("UsernameUpdate").value;
    let customerId = parseInt(document.getElementById("customerIdUpdate").value);
    let usernameInUse = false;

    usernameInUse = await checkIfUsernameIsInUse(username, url, customerId);
    if (!usernameInUse) {
        let password = document.getElementById("PasswordUpdate").value
        password = formatPassword(password);
        let role = document.getElementById("authorityUpdate").value
        role = formatUserRole(role);

        updatedCustomer = {
            customerId: customerId,
            firstName: document.getElementById("firstNameUpdate").value,
            lastName: document.getElementById("lastNameUpdate").value,
            userName: username,
            password: password,
            email: document.getElementById("EmailUpdate").value,
            phone: document.getElementById("PhoneUpdate").value,
            dateOfBirth: document.getElementById("dateOfBirthUpdate").value,
            authority: role,
            active: document.getElementById("activeUpdate").value
        };
    }
}

function storeUpdateCustomerAddress(event) {
    event.preventDefault();
    let customerAddressBtn = document.querySelector("#storeCustomerAddressBtn");
    customerAddressBtn.style.backgroundColor = '#009d00';

    updatedCustomerAddress = {
        id: document.getElementById("addressIdUpdate").value,
        street: document.getElementById("streetUpdate").value,
        city: document.getElementById("cityUpdate").value,
        postalCode: document.getElementById("postalCodeUpdate").value
    }
}

function storeUpdateCustomerTrip(event, tripId) {
    event.preventDefault();
    let customerTripBtn = document.querySelector("#storeCustomerTripBtn"+tripId);
    customerTripBtn.style.backgroundColor = '#009d00';

    let updatedTrip = {
        tripId: document.getElementById(`tripId${tripId}`).value,
        departureDate: document.getElementById(`departureDateTrip${tripId}`).value,
        numberOfWeeks: document.getElementById(`numberOfWeeksTrip${tripId}`).value,
        totalPriceSEK: document.getElementById(`totalPriceSEKTrip${tripId}`).innerHTML,
        totalPricePLN: document.getElementById(`totalPricePLNTrip${tripId}`).innerHTML
    };
    updatedTrip.destination = {
        destinationId: document.getElementById(`destinationIdTrip${tripId}`).innerHTML,
        hotellName: document.getElementById(`destinationHotellNameTrip${tripId}`).innerHTML,
        pricePerWeek: document.getElementById(`destinationPricePerWeekTrip${tripId}`).innerHTML,
        city: document.getElementById(`destinationCityTrip${tripId}`).innerHTML,
        country: document.getElementById(`destinationCountryTrip${tripId}`).innerHTML,
    };

    updatedCustomerTrips.forEach(trip => {
        if (trip.tripId === tripId){
            trip.departureDate = updatedTrip.departureDate;
            trip.numberOfWeeks = updatedTrip.numberOfWeeks;
            trip.destination.id = updatedTrip.destination.id;
            trip.destination.hotellName = updatedTrip.destination.hotellName;
            trip.destination.pricePerWeek = updatedTrip.destination.pricePerWeek;
            trip.destination.city = updatedTrip.destination.city;
            trip.destination.country = updatedTrip.destination.country;
        }
    });
}

async function saveUpdatedCustomer() {
    let saveBtn = document.querySelector("#saveAll");
        saveBtn.style.backgroundColor = '#009d00';

    let formData = updatedCustomer;
    formData.address = updatedCustomerAddress;
    formData.trips = updatedCustomerTrips;

    const url = 'http://localhost:8585/api/v1/customers/' + updatedCustomer.customerId;
    await fetchDataPut(url, base64credentials, formData);
    loadAdminContent('customer');
}

async function deleteCustomer(customerId) {

    const url = 'http://localhost:8585/api/v1/customers/' + customerId;
    const response = await fetchDataGet(url, base64credentials);
    let data = await response.json();

    if (data.userName !== loggedInUsername) {
        await fetchDataDelete(url, base64credentials);
        // Uppdatera tabellen efter borttagning
        loadAdminContent('customer');
    } else {
        confirm("Logged in as \"" + loggedInUsername + "\". Login with different user before deleting user!");
    }
}

// *************** CUSTOMER STUFF END **********************

// *************** TRIP STUFF START **********************

function displayTrips(mainDiv) {

    mainDiv.innerHTML =
                `
                <h2>Booked Trips</h2>
                <table id="tripsTable" class="table-sortable">
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
                            <th>Customer id</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="tripTableBody">
                         <!-- Content will be loaded dynamically here -->
                    </tbody>
                </table>
                `;
    fetchTrips();
}

async function fetchTrips() {
    activateSortingForTables();
    const tripTableBody = document.getElementById('tripTableBody');

    const url = 'http://localhost:8585/api/v1/customers';
    const response = await fetchDataGet(url, base64credentials);
    let data = await response.json();

    data.forEach(customer => {
        customer.trips.forEach(trip => {
            let id = trip.tripId;
            if(trip.tripId < 10){
               id ='0'+trip.tripId;
            }
            tripTableBody.innerHTML += `
                    <tr>
                        <td>${id}</td>
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
                        <td>${customer.customerId}</td>
                        <td class="editButtons">
                            <button onclick="loadAdminContent('updateCustomers', ${customer.customerId})" class="stdbutton">Find Customer</button>
                        </td>
                    </tr>
                `;
        });
    });
    sortTableByColumn(document.getElementById('tripsTable'), 0, true);
}

function displayAddCustomerTrip(mainDiv, customerId) {

    mainDiv.innerHTML = `
    <div class="container">
        <h2>Add Trips for Customer: ${customerId} "info, error och success" rutor</h2>
        <form id="formSaveCustomerTrip" class="form" onsubmit="saveNewCustomerTrip(event, ${customerId})";return false;>
        <div class="column one">
            <div class="field">
                <label for="departureDateTrip">Departure Date:</label>
                <input type="date" id="departureDateTrip" name="departureDateTrip" required>
            </div>
            <div class="field">
                <label for="numberOfWeeksTrip">Number Of Weeks:</label>
                <input type="number" id="numberOfWeeksTrip" name="numberOfWeeksTrip" placeholder="Duration in weeks" required>
            </div>
            <div class="field">
                <label for="dest">Select Destination: </label>
                <select id="dest" class="destinatinChoise" required>
                    <option value="" disabled selected hidden>-- Destination --</option>
                <select> 
            </div>
            <div class="field">
                <input type="button" id="checkPrice" value="Check Price" class="save neutralBtn"><br>
                <label id="totPrice"></label>
            </div>
        </div>
        <div class="editTripBtnList"> 
        <input type="submit" id="storeCustomerTripBtn" value="Save Trip" class="save saveBackground">
        <input type="button" value="Return" class="save negbutton" id="returnBtn" onclick="loadAdminContent('updateCustomers', ${customerId})">
        </div>
        </form>
    </div>    
        `;
    loadDestinationsToTripForm();
    let priceBtn = document.querySelector('#checkPrice');
    priceBtn.addEventListener('click', function () {
        checkPrice();
    });
}

async function loadDestinationsToTripForm() {

    let destDropdown = document.querySelector('#dest');

    const url = 'http://localhost:8585/api/v1/trips';
    const response = await fetchDataGet(url, base64credentials);
    let destinationData = await response.json();

    destinationData.forEach(d => {
        destDropdown.innerHTML += `
       <option value="${d.id}">${d.hotellName}: ${d.city}, ${d.country}, Price/week(SEK): ${d.pricePerWeek}</option>
       `;
    });

}

async function saveNewCustomerTrip(event, customerId) {
    event.preventDefault();
    let saveBtn = document.querySelector("#storeCustomerTripBtn");
    saveBtn.style.backgroundColor = '#009d00';

    let selectedDestinationId = document.querySelector('#dest').value;

    const url = 'http://localhost:8585/api/v1/destination/'+selectedDestinationId;
    const response = await fetchDataGet(url, base64credentials);
    let destination = await response.json();

    let newTrip = {
        departureDate: document.querySelector('#departureDateTrip').value,
        numberOfWeeks: document.querySelector('#numberOfWeeksTrip').value,
        totalPriceSEK: 0,
        totalPricePLN: 0,
        destination: destination
    }
    updatedCustomer.trips.push(newTrip);
    const url2 = 'http://localhost:8585/api/v1/customers/' + updatedCustomer.customerId;
    await fetchDataPut(url2, base64credentials, updatedCustomer);
    loadAdminContent('updateCustomers', customerId)
}

async function deleteCustomerTrip(tripId, customerId) {
    const url = 'http://localhost:8585/api/v1/trips/' + tripId;
    await fetchDataDelete(url, base64credentials);
    loadAdminContent('updateCustomers', customerId);
}


// *************** TRIP STUFF END **********************

// *************** DESTINATION STUFF START **********************

function displayDestinations(mainDiv) {
    mainDiv.innerHTML =
        `
                <h2>Destinations</h2>
                <button onclick="loadAdminContent('addDestination')"  class="stdbutton posbutton">Add Destination</button>
                <table id="destinationTable" class="table-sortable">
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
}

async function fetchDestinations() {
    activateSortingForTables();
    const destinationTableBody = document.getElementById('destinationTableBody');

    const url = 'http://localhost:8585/api/v1/trips';
    const response = await fetchDataGet(url, base64credentials);
    let data = await response.json();

    data.forEach(destination => {
        let id = destination.id;
        if(destination.id < 10){
            id ='0' + destination.id;
        }
        destinationTableBody.innerHTML += `
                    <tr>
                        <td>${id}</td>
                        <td>${destination.hotellName}</td>
                        <td>${destination.pricePerWeek}</td>
                        <td>${destination.country}</td>
                        <td>${destination.city}</td>
                        <td class="editButtons">
                            <button onclick="displayUpdateDestination(${destination.id})" class="stdbutton">Update</button>
                            <button onclick="deleteDestinations(${destination.id})" class="stdbutton negbutton">Remove</button>
                        </td>
                    </tr>
                `;
    });
    sortTableByColumn(document.getElementById('destinationTable'), 0, true);
}

function displayDestinationForm(mainDiv) {

    mainDiv.innerHTML =
        `
<div class="container">
    <h2 id="destinationH2">Add New Destination:</h2>

<form id="formSaveDestination" class="form" onsubmit="saveNewDestination(event)">
    <div class="column one">
        <div>
            <input type="hidden" name="destinationId" id="destinationId"> 
        </div>    
        <div class="field">
            <label for="hotellName">Hotel Name:</label>
            <input type="text" id="hotellName" name="hotellName" placeholder="Name of hotell" required>
        </div>
        <div class="field">
            <label for="pricePerWeek">Price Per Week(SEK):</label>
            <input type="number" id="pricePerWeek" name="pricePerWeek" step="0.01" placeholder="Enter price" required>
        </div>
        <div class="field">
            <label for="city">City:</label>
            <input type="text" id="city" name="city" placeholder="Name of city" required>
        </div>
        <div class="field">
            <label for="country">Country:</label>
            <input type="text" id="country" name="country" placeholder="Country" required>
        </div>
    </div>
        <div class="editTripBtnList">
           <input type="submit" id="saveDestinationBtn" value="Save Destination" class="save saveBackground">
            <input type="button" value="Return" class="save negbutton" id="returnDestinationBtn" onclick="loadAdminContent('destination')">
        </div>
    </form>
</div>
        `;
}

function displayUpdateDestination(destinationId) {
    let mainDiv = document.querySelector('#adminContent');
    displayDestinationForm(mainDiv);
    let form = document.querySelector('#formSaveDestination')
    form.setAttribute('onsubmit', 'saveUpdatedDestination(event)');
    loadUpdateDestination(destinationId);
}

async function loadUpdateDestination(destinationId) {

    let updateH2 = document.querySelector('#destinationH2');
    updateH2.innerHTML = 'Update Destination: ' + destinationId

    const url = 'http://localhost:8585/api/v1/destination/' + destinationId;
    const response = await fetchDataGet(url, base64credentials);
    let destination = await response.json();
    document.querySelector('#destinationId').value = destination.id;
    document.querySelector('#hotellName').value = destination.hotellName;
    document.querySelector('#pricePerWeek').value = destination.pricePerWeek;
    document.querySelector('#city').value = destination.city;
    document.querySelector('#country').value = destination.country;
}

/**
 * This function gets set to save/update destination form
 * dynamically by displayUpdateDestination().
 * @param event
 */
async function saveUpdatedDestination(event) {
    event.preventDefault();
    let saveBtn = document.querySelector("#saveDestinationBtn");
    saveBtn.style.backgroundColor = '#009d00';

    let destinationId = document.querySelector('#destinationId').value
    let updatedDestination = {
        id: destinationId,
        hotellName: document.querySelector('#hotellName').value,
        pricePerWeek: document.querySelector('#pricePerWeek').value,
        city: document.querySelector('#city').value,
        country: document.querySelector('#country').value
    }

    const url = 'http://localhost:8585/api/v1/destination/' + destinationId;
    await fetchDataPut(url, base64credentials, updatedDestination);
    loadAdminContent('destination');
}

async function saveNewDestination(event) {
    event.preventDefault()
    let saveBtn = document.querySelector("#saveDestinationBtn");
    saveBtn.style.backgroundColor = '#009d00';

    let newDestination = {
        hotellName: document.querySelector('#hotellName').value,
        pricePerWeek: document.querySelector('#pricePerWeek').value,
        city: document.querySelector('#city').value,
        country: document.querySelector('#country').value
    }

    const url = 'http://localhost:8585/api/v1/destination';
    await fetchDataPost(url, base64credentials, newDestination);
    loadAdminContent('destination');
}

async function deleteDestinations(destinationId) {
    const url = 'http://localhost:8585/api/v1/destination/' + destinationId;
    let message = await fetchDataDelete(url, base64credentials);

    if (message.length > 60) {
        confirm(message);
    }
    loadAdminContent('destination');
}

// *************** DESTINATION STUFF END **********************

// *************** OTHER STUFF START **********************

function sortTableByColumn(table, column, asc = true) {
    const dirModifier = asc ? 1 : -1;
    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll("tr"));

    // Sort each row.
    const sortedRows = rows.sort((a, b) => {
        const aColText = a.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
        const bColText = b.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
        console.log("aColText:", aColText, "bColText:", bColText);
        return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
    });
    // Remove all existing TRs from the table.
    while (tBody.firstChild) {
        tBody.removeChild(tBody.firstChild);
    }
    // Re-add the newly sorted rows.
    tBody.append(...sortedRows);

    // Remember how the column is currently sorted.
    table.querySelectorAll("th").forEach(th => th.classList.remove("th-sort-asc", "th-sort-desc"));
    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("th-sort-asc", asc);
    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("th-sort-desc", !asc);
    // activateSortingForTables();
}

function activateSortingForTables() {
    document.querySelectorAll(".table-sortable th").forEach(headerCell => {
        headerCell.addEventListener("click", () => {
            let tableElement = headerCell.parentElement.parentElement.parentElement;
            let headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
            let currentIsAscending = headerCell.classList.contains("th-sort-asc");
            sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
        });
    });
}

async function checkIfUsernameIsInUse(formUsername, url, id) {
    let usernameInUse = false;
    await fetchDataGet(url, base64credentials)
        .then(response => response.json())
        .then(data => {
                data.forEach(customer => {
                    if (customer.userName === formUsername) {
                        if (customer.customerId !== id) {
                            confirm("Username already in use!");
                            usernameInUse = true;
                        }
                    }

                })
            }
        );
    return usernameInUse;
}

function formatUserRole(role) {
    let fullRole;
    role = role.toUpperCase();
    if (role.length > 5) {
        role = role.substring(5);
    }
    console.log(role)
    if (role === 'USER' || role === 'ADMIN') {
        fullRole = 'ROLE_' + role;
    } else {
        confirm('Can only assign roles: user or admin!')
    }
    return fullRole;
}

function formatPassword(password) {
    if (password.substring(0, 6) === '{noop}') {
        return password;
    }
    return '{noop}' + password;
}

function autofillForm(form, data) {
    for (const key in data) {
        const inputField = form.querySelector(`[name="${key}"]`);
        if (inputField) {
            if (inputField.name === 'password') {
                let password = data[key];
                inputField.value = password.substring(6);
            } else if (inputField.name === 'authority') {
                let authority = data[key];
                inputField.value = authority.substring(5);
            } else {
                inputField.value = data[key];
            }
        }
    }
}

async function adjustTripPrice(tripId) {
    let weeks = document.getElementById(`numberOfWeeksTrip${tripId}`).value
    let pricePerWeek = document.getElementById(`destinationPricePerWeekTrip${tripId}`).innerHTML
    let total = pricePerWeek * weeks;
    document.getElementById(`totalPriceSEKTrip${tripId}`).innerHTML = total;

    let data = await fetchCurrency(total, 'PLN')
    console.log(data.value);
    document.getElementById(`totalPricePLNTrip${tripId}`).innerHTML = data;
}

async function checkPrice() {

    let weeks = document.querySelector(`#numberOfWeeksTrip`).value
    let selectedDestinationId = document.querySelector('#dest').value;

    const url = 'http://localhost:8585/api/v1/destination/'+selectedDestinationId;
    const response = await fetchDataGet(url, base64credentials);
    let destination = await response.json();

    let pricePerWeek = destination.pricePerWeek;
    let totalSEK = pricePerWeek * weeks;
    let totalPLN = await fetchCurrency(totalSEK, 'PLN')
    document.querySelector(`#totPrice`).innerHTML = 'Total price(SEK): ' + totalSEK + ', Total price(PLN): ' + totalPLN;
}

/**
 *
 * @param totalSEK = total price in SEK
 * @param currency = the currency you want to convert totalSEK to, ex: 'PLN' or 'USD'
 * @returns {Promise<any>}
 */
async function fetchCurrency(totalSEK, currency) {
    const url = 'http://localhost:8585/api/v1/currency/' + totalSEK + '/' + currency;
    const response = await fetchDataGet(url, base64credentials);
    return await response.json();
}

async function fetchDataGet(url, credentials) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${credentials}`
            }
        });
        if (!response.ok) {
            new Error(`HTTP error! Status: ${response.status}`);
        } else {
            return response;
        }
    } catch (error) {
        console.error('Error: ', error);
    }
}

async function fetchDataPost(url, credentials, formData) {

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Success:', data);

        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function fetchDataPut(url, credentials, formData) {

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Success:', data);

        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function fetchDataDelete(url, credentials) {
    let deleteMessageFromBackend;
    try {
        await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${credentials}`
            }
        })
            .then(response => response.text())
            .then(data => {
                deleteMessageFromBackend = data;
            })
    } catch (error) {
        console.error('Error: ', error);
    }
    return deleteMessageFromBackend;
}

// *************** OTHER STUFF END **********************

// *************** ADMIN PAGE STUFF END **********************
