function displayCustomerDashboard() {
    appContainer.innerHTML = `
      <section>
        <h2>Welcome "${username}" to Customer Dashboard</h2>
          <h1>Välkommen till Reseportalen</h1>

    <h2>Resor</h2>
    <table>
        <thead>
            <tr>
                <th>Namn på hotell</th>
                <th>Destination</th>
                <th>Pris per vecka (SEK)</th>
            </tr>
        </thead>
        <tbody>
            <!-- Här kan du lägga till rader för varje resa -->
            <tr>
                <td>Hotell A</td>
                <td>Stockholm, Sverige</td>
                <td>5000</td>
            </tr>
            <tr>
                <td>Hotell B</td>
                <td>Warszawa, Polen</td>
                <td>4500</td>
            </tr>
            <!-- ... -->
        </tbody>
    </table>

    <h2>Kunder</h2>
    <table>
        <thead>
            <tr>
                <th>Kund ID</th>
                <th>Användarnamn</th>
                <th>Namn</th>
                <th>Adress</th>
            </tr>
        </thead>
        <tbody>
            <!-- Här kan du lägga till rader för varje kund -->
            <tr>
                <td>1</td>
                <td>john_doe</td>
                <td>John Doe</td>
                <td>123 Main St, City</td>
            </tr>
            <!-- ... -->
        </tbody>
    </table>

    <h2>Bokningar</h2>
    <table>
        <thead>
            <tr>
                <th>Avresedatum</th>
                <th>Destination</th>
                <th>Namn på hotell</th>
                <th>Totalpris (SEK)</th>
            </tr>
        </thead>
        <tbody>
            <!-- Här kan du lägga till rader för varje bokning -->
            <tr>
                <td>2023-01-15</td>
                <td>Stockholm, Sverige</td>
                <td>Hotell A</td>
                <td>5000</td>
            </tr>
            <!-- ... -->
        </tbody>
    </table>
      </section>
    `;
}

