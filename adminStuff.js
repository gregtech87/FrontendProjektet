



function addCustomer() {

}
function updateCustomer(customerId) {

}



function addDestination() {

}

function updateDestination(destinationId) {

}

async function fetchTrips() {
    const tripTableBody = document.getElementById('tripTableBody');

    const url = 'http://localhost:8585/api/v1/alltrips';
    const base64 = btoa(`${username}:${password}`);
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