const appContainer = document.getElementById("app");
let loggedInUsername;
let loggedInPassword;
let base64credentials = btoa(`${loggedInUsername}:${loggedInPassword}`);
let updatedCustomer = {};
let updatedCustomerAddress = {};
let updatedCustomerTrips = {};

function displayHomepage() {
    appContainer.innerHTML = `
      <section id="start">
        <h2>Welcome to Wigell travels</h2>
        <button onclick="displayLoginForm()" class="save posButton primaryLoginBtn">Login to my travels</button>
        <p>Please login to book your trips</p>
        <img src="images/background.jpg" style="width: 100%" alt="Background">
      </section>
    `;
}

function displayLoginForm() {
    appContainer.innerHTML = `
      <section id="loginSection" class="loginPage">
        <form class="loginForm" id="loginForm" onsubmit= "login();return false;">
          <label for="username">Username:</label>
          <input type="text" id="loginUsername" name="username" required>
          <label for="password">Password:</label>
          <input type="password" id="loginPassword" name="password" required>
          <div class="editButtons">
          <button type="submit" class="save posButton">Login</button>
          <button type="button" onclick="renderPage('start')" class="save negButton">Return</button>
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
            let customerRole;
            if (customer.userName === loggedInUsername) {
                let role = customer.authority;
                if (role.length > 6) {
                    customerRole = role.substring(5);
                }
                renderPage(customerRole.toLowerCase(), customer.customerId);
            }
        });
    } catch (e) {
        errorBox('\"' + loggedInUsername + '\" Not found or wrong password')
    }
}

function logout() {
    loggedInUsername = "";
    loggedInPassword = "";
    updatedCustomer = {};
    updatedCustomerAddress = {};
    updatedCustomerTrips = {};
    renderPage('start')
}

async function renderPage(route, customerId) {

    switch (route) {
        case "login":
            displayLoginForm();
            break;
        case "start":
            displayHomepage();
            break;
        case "user":
            displayUserPage(customerId);
            //preparation in case of customer books/edits a trip.
            const url = 'http://localhost:8585/api/v1/customers/' + customerId;
            const response = await fetchDataGet(url, base64credentials);
            updatedCustomer = await response.json();
            updatedCustomerTrips = updatedCustomer.trips;
            updatedCustomerAddress = updatedCustomer.address;
            break;
        case "admin":
            displayAdminDashboard();
            break;
        default:
            displayNotFound();
    }
}

function displayNotFound() {
    appContainer.innerHTML = `
      <section>
        <h2>404: Something went to shit!!! Try again.</h2>
        <button type="button" onclick="renderPage('start')" class="save negButton">Return</button>
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
      <img src="images/admin.png" alt="adminLogo">
      <img src="images/admin.png" alt="adminLogo">
      <img src="images/admin.png" alt="adminLogo">
      <img src="images/admin.png" alt="adminLogo">
      <img src="images/admin.png" alt="adminLogo">
      <img src="images/admin.png" alt="adminLogo">
      <img src="images/admin.png" alt="adminLogo">
      <!-- Content will be loaded dynamically here -->
      </section>
    `;
    createAdminButtons();
}

function createAdminButtons() {
    let adminCustomer = document.querySelector('#customers');
    adminCustomer.addEventListener('click', function () {
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
            fetchDestinations();
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
            <button onclick="loadAdminContent('addCustomers')" class="stdButton posButton">Add Customer</button>
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
                        <th>-</th>
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
        customerTableBody.innerHTML += `
                    <tr>
                        <td>${customer.customerId}</td>
                        <td>${customer.firstName}</td>
                        <td>${customer.lastName}</td>
                        <td>${customer.userName}</td>
                        <td>${customer.password.substring(6)}</td>
                        <td>${customer.authority.substring(5)}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.dateOfBirth}</td>
                        <td>-</td>
                        <td>${customer.address.id}</td>
                        <td>${customer.address.street}</td>
                        <td>${customer.address.postalCode}</td>
                        <td>${customer.address.city}</td>
                        <td>${customer.trips.length}</td>
                        <td>${customer.active}</td>
                        <td class="editButtons">
                            <button onclick="loadAdminContent('updateCustomers', ${customer.customerId})" class="stdButton">Update</button>
                            <button onclick="deleteCustomer(${customer.customerId})" class="stdButton negButton">Remove</button>
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
        <div class="container">
            <form id="form" name="form" class="form">
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
                        <input type="submit" value="Save customer" class="save saveBackground" id="saveCustomer" onclick="inspectCustomerFormInput(event, true, document.form.userName, document.form.password)">
                        </div>
            </form>
        </div>
                `;
}

async function saveNewCustomer(event) {
    event.preventDefault();
    let saveBtn = document.querySelector("#saveCustomer");
    saveBtn.style.backgroundColor = '#009d00';

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
            successBox('Customer saved!')
            loadAdminContent('customer');
        }
    }
}

async function saveNewCustomerTrip(event, customerId, destinationId) {
    event.preventDefault();
    let saveBtn = document.querySelector("#storeCustomerTripBtn");
    saveBtn.style.backgroundColor = '#009d00';

    let selectedDestinationId;
    if (destinationId > 1) {
        selectedDestinationId = destinationId;
    } else {
        try {
            selectedDestinationId = document.querySelector('#dest').value;
        } catch (e) {
            console.log('poop')
        }
    }

    const url = 'http://localhost:8585/api/v1/destination/' + selectedDestinationId;
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
    successBox('Trip saved!')
    if (destinationId > 1) {
        await loadUserContent('listDestinations', customerId)
    } else {
        loadAdminContent('updateCustomers', customerId)
    }
}

function displayUpdateCustomer(mainDiv, customerId) {
    mainDiv.innerHTML =
        `
    <h2>Update Customers lägga till "info, error och success" rutor</h2>
    <div style="display: flex">
        <div class="container">
            <h3>Cusomer id: <label id="updateCustomerID"></label></h3>
            <form id="formUpdateCustomer" name="formUpdateCust" class="form">
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
                <input type="submit" id="storeCustomerBtn" value="Store updates before saving" class="save saveBackground" onclick="inspectCustomerFormInput(event, false, document.formUpdateCust.userName, document.formUpdateCust.password)">
            </form>

        </div>
        <div class="container">
            <h3>Address id: <label id="updateAddressID"></label></h3>
            <form id="formUpdateCustomerAddress" class="form" onsubmit="storeUpdateCustomerAddress(event)">
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
            <button onclick="loadAdminContent('addCustomerTrip', ${customerId})" class="save posButton">Add Trip</button>  
            <input type="button" value="Save Changes" class="save neutralBtn" onclick="saveUpdatedCustomer(true)" id="saveAll">
            <input type="button" value="Return To Customerlist" class="save negButton" id="returnBtn" onclick="loadAdminContent('customer')">
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

    // Autofill forms with JSON data
    autofillForm(customerForm, customer);
    autofillForm(addressForm, customer.address);

    updatedCustomer = customer;
    updatedCustomerAddress = customer.address;
    updatedCustomerTrips = customer.trips;
}

function creatCustomerTripsUpdateFormAndFillThem(mainDiv, tripList, customerId) {

    tripList.reverse().forEach(trip => {
        let index = trip.tripId;
        mainDiv.innerHTML += `
        <div class="container">
            <h3 id="updateHeader">Trip id: ${index}</h3>
            <form id="formUpdateCustomerTrip${index}" class="form" onsubmit="storeUpdateCustomerTrip(event, ${index})">
            <div class="column one">
                <div>
                    <input type="hidden" name="tripId" id="tripId${index}">
                </div>
                <div class="field">
                    <label for="departureDateTrip${index}">Departure Date:</label>
                    <input type="date" id="departureDateTrip${index}" name="departureDate" required>
                </div>
                <div class="field">
                    <label for="numberOfWeeksTrip${index}">Number Of Weeks:</label>
                    <input type="number" id="numberOfWeeksTrip${index}" name="numberOfWeeks" placeholder="Duration in weeks" onchange="adjustTripPrice(${index})" required>
                </div>
                <div class="field">
                    <label>Total Price(SEK): </label>
                    <label id="totalPriceSEK${index}"></label></div>
                <div class="field">
                    <label>Total Price(PLN): </label>
                    <label id="totalPricePLN${index}"></label> </div>
                <div class="field">
                    <label>Destination Id: </label>
                    <label id="destinationId${index}"> </label>
                </div>
                <div class="field">
                    <label>Destination HotellName: </label>
                    <label id="destinationHotellName${index}"> </label>
                </div>
                <div class="field">
                    <label>Destination PricePerWeek(SEK): </label>
                    <label id="destinationPricePerWeek${index}"> </label>
                </div>
                <div class="field">
                    <label>Destination City: </label>
                    <label id="destinationCity${index}"> </label>
                </div>
                <div class="field">
                    <label>Destination Country: </label>
                    <label id="destinationCountry${index}"> </label>
                </div>
            </div>
            <div class="editTripBtnList"> 
            <input type="submit" id="storeCustomerTripBtn${index}" value="Store updates before saving" class="save saveBackground">
            <input type="button" id="removeCustomerTripBtn${index}" value="Remove Trip" class="save negButton" onclick="deleteCustomerTrip(${index}, ${customerId})">
            </div>
            </form>
        </div>    
            `;
    });

    tripList.reverse().forEach(trip => {
        let index = trip.tripId;
        const tripForm = document.getElementById('formUpdateCustomerTrip' + index);
        const inputField1 = tripForm.querySelector(`[name="tripId"]`);
        const inputField2 = tripForm.querySelector(`[name="departureDate"]`);
        const inputField3 = tripForm.querySelector(`[name="numberOfWeeks"]`);
        const inputField4 = tripForm.querySelector(`[id="${'totalPriceSEK' + index}"]`);
        const inputField5 = tripForm.querySelector(`[id="${'totalPricePLN' + index}"]`);
        const inputField6 = tripForm.querySelector(`[id="${'destinationId' + index}"]`);
        const inputField7 = tripForm.querySelector(`[id="${'destinationHotellName' + index}"]`);
        const inputField8 = tripForm.querySelector(`[id="${'destinationPricePerWeek' + index}"]`);
        const inputField9 = tripForm.querySelector(`[id="${'destinationCity' + index}"]`);
        const inputField10 = tripForm.querySelector(`[id="${'destinationCountry' + index}"]`);
        inputField1.value = trip['tripId'];
        inputField2.value = trip['departureDate'];
        inputField3.value = trip['numberOfWeeks'];
        inputField4.innerHTML = trip['totalPriceSEK'].toFixed(2);
        inputField5.innerHTML = trip['totalPricePLN'].toFixed(2);
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
    let usernameInUse;

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
            active: Number(document.getElementById("activeUpdate").value)
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
    let customerTripBtn = document.querySelector("#storeCustomerTripBtn" + tripId);
    customerTripBtn.style.backgroundColor = '#009d00';

    let updatedTrip = {
        tripId: document.getElementById(`tripId${tripId}`).value,
        departureDate: document.getElementById(`departureDateTrip${tripId}`).value,
        numberOfWeeks: document.getElementById(`numberOfWeeksTrip${tripId}`).value,
        totalPriceSEK: document.getElementById(`totalPriceSEK${tripId}`).innerHTML,
        totalPricePLN: document.getElementById(`totalPricePLN${tripId}`).innerHTML
    };
    updatedTrip.destination = {
        destinationId: document.getElementById(`destinationId${tripId}`).innerHTML,
        hotellName: document.getElementById(`destinationHotellName${tripId}`).innerHTML,
        pricePerWeek: document.getElementById(`destinationPricePerWeek${tripId}`).innerHTML,
        city: document.getElementById(`destinationCity${tripId}`).innerHTML,
        country: document.getElementById(`destinationCountry${tripId}`).innerHTML,
    };

    updatedCustomerTrips.forEach(trip => {
        if (trip.tripId === tripId) {
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

async function saveUpdatedCustomer(adminBoolean) {
    if (adminBoolean) {
        let saveBtn = document.querySelector("#saveAll");
        saveBtn.style.backgroundColor = '#009d00';
    }

    let formData = updatedCustomer;
    formData.address = updatedCustomerAddress;
    formData.trips = updatedCustomerTrips;

    const url = 'http://localhost:8585/api/v1/customers/' + updatedCustomer.customerId;
    await fetchDataPut(url, base64credentials, formData);
    if (adminBoolean) {
        successBox('Customer updated!')
        loadAdminContent('customer');
    } else {
        successBox('Trip updated!')
        displayUserPage(updatedCustomer.customerId)
    }
}

async function deleteCustomer(customerId) {

    const url = 'http://localhost:8585/api/v1/customers/' + customerId;
    const response = await fetchDataGet(url, base64credentials);
    let data = await response.json();

    if (data.userName !== loggedInUsername) {
        await fetchDataDelete(url, base64credentials);
        // Update table after deletion.
        loadAdminContent('customer');
        successBox('Customer deleted!')
    } else {
        messageBox("Logged in as \"" + loggedInUsername + "\". Login with different user before deleting user!")
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
            tripTableBody.innerHTML += `
                    <tr>
                        <td>${trip.tripId}</td>
                        <td>${trip.departureDate}</td>
                        <td>${trip.numberOfWeeks}</td>
                        <td>${trip.totalPriceSEK.toFixed(2)}</td>
                        <td>${trip.totalPricePLN.toFixed(2)}</td>
                        <td>-</td>
                        <td>${trip.destination.id}</td>
                        <td>${trip.destination.hotellName}</td>
                        <td>${trip.destination.pricePerWeek}</td>
                        <td>${trip.destination.country}</td>
                        <td>${trip.destination.city}</td>
                        <td>${customer.customerId}</td>
                        <td class="editButtons">
                            <button onclick="loadAdminContent('updateCustomers', ${customer.customerId})" class="stdButton">Find Customer</button>
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
        <form id="formSaveCustomerTrip" class="form" onsubmit="saveNewCustomerTrip(event, ${customerId})">
        <div class="column one">
            <div class="field">
                <label for="departureDateTrip">Departure Date:</label>
                <input type="date" id="departureDateTrip" name="departureDateTrip" required>
            </div>
            <div class="field">
                <label for="dest">Select Destination: </label>
                <select id="dest" class="destinationChoice" required>
                    <option value="" disabled selected hidden>-- Destination --</option>
                </select> 
            </div>
            <div class="field">
                <label for="numberOfWeeksTrip">Number Of Weeks:</label>
                <input type="number" id="numberOfWeeksTrip" name="numberOfWeeksTrip" placeholder="Duration in weeks" min="1"  required>
            </div>
            <div class="field">
                <label id="totPriceSEK"></label><br>
                <label id="totPricePLN"></label>
            </div>
        </div>
        <div class="editTripBtnList"> 
        <input type="submit" id="storeCustomerTripBtn" value="Save Trip" class="save saveBackground">
        <input type="button" value="Return" class="save negButton" id="returnBtn" onclick="loadAdminContent('updateCustomers', ${customerId})">
        </div>
        </form>
    </div>    
        `;
    loadDestinationsToTripForm();
    let noOfWeeks = document.querySelector('#numberOfWeeksTrip');
    noOfWeeks.addEventListener('click', function () {
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

async function deleteCustomerTrip(tripId, customerId) {
    const url = 'http://localhost:8585/api/v1/trips/' + tripId;
    await fetchDataDelete(url, base64credentials);
    successBox('Trip deleted!')
    loadAdminContent('updateCustomers', customerId);
}


// *************** TRIP STUFF END **********************

// *************** DESTINATION STUFF START **********************

function displayDestinations(mainDiv) {
    mainDiv.innerHTML =
                `
                <h2>Destinations</h2>
                <button onclick="loadAdminContent('addDestination')"  class="stdButton posButton" id="addDestinationBtn">Add Destination</button>
                <table id="destinationTable" class="table-sortable">
                    <thead>
                        <tr> 
                            <th>Destination id</th>
                            <th>Hotell</th>
                            <th>Price Per Week (SEK)</th>
                            <th>City</th> 
                            <th>Country</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="destinationTableBody">
                         <!-- Content will be loaded dynamically here -->
                    </tbody>
                </table>
                `;
}

async function fetchDestinations() {
    activateSortingForTables();
    const destinationTableBody = document.getElementById('destinationTableBody');

    const url = 'http://localhost:8585/api/v1/trips';
    const response = await fetchDataGet(url, base64credentials);
    let data = await response.json();

    data.forEach(destination => {
        destinationTableBody.innerHTML += `
                    <tr>
                        <td>${destination.id}</td>
                        <td>${destination.hotellName}</td>
                        <td>${destination.pricePerWeek}</td>
                        <td>${destination.city}</td>
                        <td>${destination.country}</td>
                        <td class="editButtons" id="actionBtns">
                            <button onclick="displayUpdateDestination(${destination.id})" class="stdButton">Update</button>
                            <button onclick="deleteDestinations(${destination.id})" class="stdButton negButton">Remove</button>
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
                    <input type="button" value="Return" class="save negButton" id="returnDestinationBtn" onclick="loadAdminContent('destination')">
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
    successBox('Destination updated!');
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
    successBox('Destination saved!')
    loadAdminContent('destination');
}

async function deleteDestinations(destinationId) {
    const url = 'http://localhost:8585/api/v1/destination/' + destinationId;
    let message = await fetchDataDelete(url, base64credentials);

    if (message.length > 60) {
        confirm(message);
    }
    successBox('Destination deleted!');
    loadAdminContent('destination');
}

// *************** DESTINATION STUFF END **********************

// *************** ADMIN PAGE STUFF END **********************


// *************** USER PAGE STUFF START **********************

function displayUserPage(customerId) {
    appContainer.innerHTML = `
        <section id="start">
        <h2>Welcome ${loggedInUsername} to Wigell travels customer page</h2>
        <p>What do you want to do today? Book a vacation or look at your previus activities?</p>
        <div class="editButtons">
            <button class="save posButton" onclick="loadUserContent('listDestinations', ${customerId})">List available trips</button>
            <button class="save stdButton" onclick="loadUserContent('myTrips', ${customerId})">Inspect my trips</button>
            <button class="save stdButton" onclick="loadUserContent('activeTrip', ${customerId})">Inspect my active trip</button>
            <button class="save stdButton" onclick="loadUserContent('customerService', ${customerId})">Contact customerservice</button>
            <button onclick="logout()" class="save negButton">Logout</button>
        </div>
        </section>
        <section id="userContent">
            <!-- Content will be loaded dynamically here -->
        </section>
    `;
}

async function loadUserContent(topic, customerId) {
    let mainDiv = document.querySelector('#userContent');

    switch (topic) {
        case 'listDestinations':
            displayDestinationsForUser(mainDiv, customerId);
            break;
        case 'activeTrip':
            displayActiveTrip(mainDiv, updatedCustomer)
            break;
        case 'myTrips':
            displayMyTrips(mainDiv, updatedCustomer);
            break;
        case 'customerService':
            displayCustomerService(mainDiv);
            break;
        default:
            mainDiv.innerHTML = `
            < h2 > Page not found < /h2> 
            `;
            break;
    }
}

function displayDestinationsForUser(mainDiv, customerId) {
    mainDiv.innerHTML =
        `
        <h2>Destinations</h2>
        <table id="destinationUserTable" class="table-sortable">
            <thead>
                <tr> 
                    <th>Hotell</th>
                    <th>Price Per Week (SEK)</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="destinationTableBody">
                 <!-- Content will be loaded dynamically here -->
            </tbody>
        </table>
       `;
    fetchDestinationsForUsers(customerId);
}

async function fetchDestinationsForUsers(customerId) {
    activateSortingForTables();
    const destinationTableBody = document.getElementById('destinationTableBody');

    const url = 'http://localhost:8585/api/v1/trips';
    const response2 = await fetchDataGet(url, base64credentials);
    let destinations = await response2.json();

    destinations.forEach(destination => {
        destinationTableBody.innerHTML +=
            `
            <tr>
                <td>${destination.hotellName}</td>
                <td>${destination.pricePerWeek}</td>
                <td>${destination.city}</td>
                <td>${destination.country}</td>
                <td class="editButtons" id="actionBtns">
                    <button onclick="displayAddTripToUser(${customerId}, ${destination.id})" class="save posButton">Book trip</button>
                </td>
            </tr>
           `;
    });
    sortTableByColumn(document.getElementById('destinationUserTable'), 0, true);
}

function displayMyTrips(mainDiv, customer) {
    mainDiv.innerHTML =
        `
        <h2>Booked Trips</h2>
        <table id="myTripsTable" class="table-sortable">
            <thead>
                <tr>
                    <th>Departure Date</th>
                    <th>Number Of Weeks</th>
                    <th>Total Price(SEK)</th>
                    <th>Total Price(PLN)</th>
                    <th></th>
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
    fetchMyTrips(customer.customerId, mainDiv);
}

async function fetchMyTrips(customerId) {
    activateSortingForTables();
    const tripTableBody = document.getElementById('tripTableBody');

    const url = 'http://localhost:8585/api/v1/customers/' + customerId;
    console.log(url)
    const response = await fetchDataGet(url, base64credentials);
    let customer = await response.json();

    console.log(customer)
    let activeId = customer.trips.slice(-1)
    console.log(activeId)
    let id = activeId[0].tripId;
    console.log(id)
    customer.trips.forEach(trip => {
        if (trip.tripId === id) {
            tripTableBody.innerHTML +=
                `
                <tr>
                    <td>${trip.departureDate}</td>
                    <td>${trip.numberOfWeeks}</td>
                    <td>${trip.totalPriceSEK.toFixed(2)}</td>
                    <td>${trip.totalPricePLN.toFixed(2)}</td>
                    <td>-</td>
                    <td>${trip.destination.hotellName}</td>
                     <td>${trip.destination.pricePerWeek}</td>
                    <td>${trip.destination.country}</td>
                    <td>${trip.destination.city}</td>
                    <td class="editButtons">
                        <button onclick="loadUserContent('activeTrip', ${customerId})" class="stdButton">Edit</button>
                    </td>
                </tr>
                `;
        } else {
            tripTableBody.innerHTML +=
                `
                <tr>
                    <td>${trip.departureDate}</td>
                    <td>${trip.numberOfWeeks}</td>
                    <td>${trip.totalPriceSEK.toFixed(2)}</td>
                    <td>${trip.totalPricePLN.toFixed(2)}</td>
                    <td>-</td>
                    <td>${trip.destination.hotellName}</td>
                     <td>${trip.destination.pricePerWeek}</td>
                    <td>${trip.destination.country}</td>
                    <td>${trip.destination.city}</td>
                    <td></td>
                </tr>
                `;
        }
    });
    sortTableByColumn(document.getElementById('myTripsTable'), 9, false);
}

async function displayAddTripToUser(customerId, destinationId) {
    let mainDiv = document.querySelector('#userContent');

    mainDiv.innerHTML =
        `
        <div class="container">
            <form id="formSaveCustomerTrip" class="form" onsubmit="saveNewCustomerTrip(event, ${customerId}, ${destinationId})">
            <div class="column one">
                <div class="field">
                    <label for="departureDateTrip">Departure Date:</label>
                    <input type="date" id="departureDateTrip" name="departureDateTrip" required>
                </div>
                <div class="field">
                    <label for="numberOfWeeksTrip">Number Of Weeks:</label>
                    <input type="number" id="numberOfWeeksTrip" name="numberOfWeeksTrip" placeholder="Duration in weeks" min="1" required>
                </div>
                <div class="field">
                    <label>HotellName: </label>
                    <label id="destinationHotellName"> </label>
                </div>
                <div class="field">
                    <label>PricePerWeek(SEK): </label>
                    <label id="destinationPricePerWeek"> </label>
                </div>
                <div class="field">
                    <label>City: </label>
                    <label id="destinationCity"> </label>
                </div>
                <div class="field">
                    <label>Country: </label>
                    <label id="destinationCountry"> </label>
                </div>
                <div class="field">
                    <label id="totPriceSEK"></label><br>
                    <label id="totPricePLN"></label>
                </div>
            </div>
            <div class="editTripBtnList"> 
            <input type="submit" id="storeCustomerTripBtn" value="Save Trip" class="save saveBackground">
            <input type="button" value="Return" class="save negButton" id="returnBtn" onclick="loadUserContent('listDestinations', ${customerId})">
            </div>
            </form>
        </div>    
        `;

    const url = 'http://localhost:8585/api/v1/destination/' + destinationId;
    const response = await fetchDataGet(url, base64credentials);
    let destination = await response.json();

    const tripForm = document.getElementById('formSaveCustomerTrip');
    const inputField1 = tripForm.querySelector(`[id="destinationHotellName"]`);
    const inputField2 = tripForm.querySelector(`[id="destinationPricePerWeek"]`);
    const inputField3 = tripForm.querySelector(`[id="destinationCity"]`);
    const inputField4 = tripForm.querySelector(`[id="destinationCountry"]`);
    inputField1.innerHTML = destination.hotellName;
    inputField2.innerHTML = destination.pricePerWeek;
    inputField3.innerHTML = destination.city;
    inputField4.innerHTML = destination.country;

    let noOfWeeks = document.querySelector('#numberOfWeeksTrip');
    noOfWeeks.addEventListener('click', function () {
        checkPriceForUser();
    });
}

//function saveActiveUserTrip set as attribute in form by function displayActiveTrip.
function saveActiveUserTrip(event, tripId) {
    storeUpdateCustomerTrip(event, tripId)
    saveUpdatedCustomer(false)
}

function displayActiveTrip(mainDiv, customer) {
    console.log(customer.trips)
    let activeList = customer.trips.slice(-1);
    console.log(activeList)
    let tripId = activeList[0].tripId;

    mainDiv.innerHTML = ` `;
    creatCustomerTripsUpdateFormAndFillThem(mainDiv, activeList, customer.customerId);

    //Edit existing form
    let title = document.querySelector('#updateHeader');
    title.innerText = 'Update most recently booked trip'
    let tripForm = document.querySelector('#formUpdateCustomerTrip' + tripId);
    tripForm.setAttribute('onsubmit', 'saveActiveUserTrip(event, ' + tripId + ')');
    let saveBtn = document.querySelector('#storeCustomerTripBtn' + tripId);
    saveBtn.value = 'Save updated trip'
    saveBtn.classList.remove('saveBackground');
    saveBtn.classList.add('posButton');
    let unwantedBtn = document.querySelector('#removeCustomerTripBtn' + tripId);
    unwantedBtn.parentNode.removeChild(unwantedBtn);
}

function displayCustomerService(mainDiv) {
    mainDiv.innerHTML = `<a id="link" href="https://www.youtube.com/watch?v=eBGIQ7ZuuiU" target="TARGET_NEW_WINDOW"></a>`;
    document.querySelector('#link').click();
}

// *************** USER PAGE STUFF END **********************


// *************** OTHER STUFF START **********************

function sortTableByColumn(table, column, asc = true) {
    const dirModifier = asc ? 1 : -1;
    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll("tr"));

    // Sort each row.
    const sortedRows = rows.sort((a, b) => {
        const aColText = a.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
        const bColText = b.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
        // return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
        // Check if the column text is a number
        const isNumber = !isNaN(parseFloat(aColText)) && isFinite(aColText);

        if (isNumber) {
            // If it's a number, convert to numbers and compare
            return (parseFloat(aColText) - parseFloat(bColText)) * dirModifier;
        } else {
            // If it's not a number, compare as strings
            return aColText.localeCompare(bColText) * dirModifier;
        }
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
    let pricePerWeek = document.getElementById(`destinationPricePerWeek${tripId}`).innerHTML
    let total = pricePerWeek * weeks;
    let totalPLN = await fetchCurrency(total, 'PLN');
    document.getElementById(`totalPriceSEK${tripId}`).innerHTML = total.toFixed(2);
    document.getElementById(`totalPricePLN${tripId}`).innerHTML = totalPLN.toFixed(2);
}

async function checkPrice() {

    let weeks = document.querySelector(`#numberOfWeeksTrip`).value
    let selectedDestinationId = document.querySelector('#dest').value;

    const url = 'http://localhost:8585/api/v1/destination/' + selectedDestinationId;
    const response = await fetchDataGet(url, base64credentials);
    let destination = await response.json();

    let pricePerWeek = destination.pricePerWeek;
    let totalSEK = pricePerWeek * weeks;
    let totalPLN = await fetchCurrency(totalSEK, 'PLN');
    document.querySelector(`#totPriceSEK`).innerHTML = 'Total price(SEK): ' + totalSEK.toFixed(2);
    document.querySelector(`#totPricePLN`).innerHTML = 'Total price(PLN): ' + totalPLN.toFixed(2);
}

async function checkPriceForUser() {
    let weeks = document.querySelector(`#numberOfWeeksTrip`).value;
    let pricePerWeek = document.querySelector(`#destinationPricePerWeek`).innerHTML;
    let totalSEK = pricePerWeek * weeks;
    let totalPLN = await fetchCurrency(totalSEK, 'PLN')
    document.querySelector(`#totPriceSEK`).innerHTML = 'Total price(SEK): ' + totalSEK.toFixed(2);
    document.querySelector(`#totPricePLN`).innerHTML = 'Total price(PLN): ' + totalPLN.toFixed(2);
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

function inspectCustomerFormInput(event, autoSave, username, password) {
    event.preventDefault()
    let boolUsername = CheckLetters(username);
    let boolPassword = CheckLetters(password);

    if (autoSave && boolUsername && boolPassword) {
        saveNewCustomer(event);
    }
    if (boolUsername && boolPassword) {
        storeUpdateCustomer(event);
    }
}

function CheckLetters(inputText) {
    let letters = /^[A-Za-z0-9]+$/;
    if (inputText.value.match(letters)) {
        return true;
    } else {
        alert('Please input alphabet and numeric characters only in UserName and Password');
        return false;
    }
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
        return await response.json();
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
        return await response.json();
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

function messageBox(message) {
    let boxes = document.querySelector('#messageBoxes');

    boxes.innerHTML = `
    <div id="messageDiv" class="message">
        <div class="alert-box warning"><span>Message: </span>${message}</div>
    </div>
    `;

    setTimeout(function () {
        let box = document.querySelector('#messageDiv');
        box.classList.add('message-hide')
        boxes.innerHTML = ``;
    }, 4000);
}

function successBox(message) {
    let boxes = document.querySelector('#messageBoxes');

    boxes.innerHTML = `
    <div id="messageDiv" class="message">
        <div class="alert-box success"><span>Success: </span>${message}</div>
    </div>
    `;

    setTimeout(function () {
        let box = document.querySelector('#messageDiv');
        box.classList.add('message-hide')
        boxes.innerHTML = ``;
    }, 4000);
}

function errorBox(message) {
    let boxes = document.querySelector('#messageBoxes');

    boxes.innerHTML = `
    <div id="messageDiv" class="message">
        <div class="alert-box error"><span>Error: </span>${message}</div>
    </div>
    `;

    setTimeout(function () {
        let box = document.querySelector('#messageDiv');
        box.classList.add('message-hide')
        boxes.innerHTML = ``;
    }, 4000);
}


// *************** OTHER STUFF END **********************