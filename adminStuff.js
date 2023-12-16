
function updateCustomer(id) {


    const jsonData = {
        // Paste your JSON data here
        "customerId": 1,
        "userName": "tyra",
        "password": "{noop}tyra",
        "authority": "ROLE_USER",
        "active": 1,
        "firstName": "Tyra",
        "lastName": "Persson",
        "email": "Tyra@cat.se)",
        "phone": 15555666,
        "dateOfBirth": "5/4-2008",
        "address": {
            "id": 1,
            "street": "Haspelvägen 3",
            "postalCode": 87445,
            "city": "Växsjö"
        },
        "trips": [
            {
                "tripId": 1,
                "departureDate": "date1",
                "numberOfWeeks": 1,
                "totalPriceSEK": 1225.5,
                "totalPricePLN": 470.0,
                "destination": {
                    "id": 1,
                    "hotellName": "The Continental",
                    "pricePerWeek": 1225.5,
                    "city": "Bryssel",
                    "country": "Tyskland"
                }
            },
            {
                "tripId": 2,
                "departureDate": "date2",
                "numberOfWeeks": 2,
                "totalPriceSEK": 12889.6,
                "totalPricePLN": 4947.0,
                "destination": {
                    "id": 2,
                    "hotellName": "Clarion",
                    "pricePerWeek": 6444.8,
                    "city": "Sundsvall",
                    "country": "Sverige"
                }
            }
        ]
    };

    const form = document.getElementById('form');

    // Autofill the form with JSON data
    for (const key in jsonData) {
        const inputField = form.querySelector(`[name="${key}"]`);
        if (inputField) {
            inputField.value = jsonData[key];
        }
    }

}

async function saveNewCustomer(event) {
    // Prevent the default form submission
    event.preventDefault();

    let formUsername = document.getElementById("Username").value;
    let usernameInUse = false;
    const url = 'http://localhost:8585/api/v1/customers';
    const base64 = btoa(`${loggedInUsername}:${loggedInPassword}`);

    await fetchDataGet(url, base64)
        .then(response => response.json())
        .then(data => {
                data.forEach(customer => {
                    if (customer.userName === formUsername) {
                        confirm("Username already in use!");
                        usernameInUse = true;
                    }
                })
            }
        );

    if (!usernameInUse){

    let role = document.getElementById("authority").value;
    let fullRole;
    role = role.toUpperCase();
    if (role === 'USER' || role === 'ADMIN') {
        fullRole = 'ROLE_' + role;
    } else {
        confirm('Can only assign roles: user or admin!')
    }

    let password = document.getElementById("Password").value;
    password = '{noop}' + password;
    console.log(password)

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
        street: document.getElementById("street").value,
        city: document.getElementById("city").value,
        address,
        trips
    };

    // You can now do something with the formData, like sending it to a server
    // For example, you can use fetch() to send a POST request to a server endpoint
    console.log(JSON.stringify(formData));

    fetchDataPost(url,base64, formData);
    }
}






function addDestination() {

}

function updateDestination(destinationId) {

}


async function fetchTrips() {
    activateSortingForTables();
    const tripTableBody = document.getElementById('tripTableBody');

    const url = 'http://localhost:8585/api/v1/alltrips';
    const base64 = btoa(`${loggedInUsername}:${loggedInPassword}`);
    const response = await fetchDataGet(url, base64);
    let data = await response.json();

    data.forEach(trip => {
        tripTableBody.innerHTML += `
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
                        <td class="editButtons">
<!--                            <button onclick="updateDestination(${trip.id})" class="stdbutton">Update</button>-->
<!--                            <button onclick="deleteDestinations(${trip.id})" class="stdbutton negbutton">Remove</button>-->
                        </td>
                    </tr>
                `;
    });
}


function sortTableByColumn(table, column, asc = true) {
    const dirModifier = asc ? 1 : -1;
    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll("tr"));

    // Sort each row.
    const sortedRows = rows.sort((a, b) => {
        const aColText = a.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
        const bColText = b.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
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
}

function activateSortingForTables() {
    document.querySelectorAll(".table-sortable th").forEach(headerCell => {
        headerCell.addEventListener("click", () => {
            tableElement = headerCell.parentElement.parentElement.parentElement;
            headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
            currentIsAscending = headerCell.classList.contains("th-sort-asc");
            sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
        });
    });

}