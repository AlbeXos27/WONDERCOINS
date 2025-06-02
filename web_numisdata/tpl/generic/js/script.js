document.addEventListener('DOMContentLoaded', function() {
    loadCSV();
});

function loadCSV() {
    fetch('tpl/generic/js/archivo.csv')  // Ajusta esta ruta según la ubicación de tu archivo CSV
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n');
            const table = document.createElement('table');

            rows.forEach((row, rowIndex) => {
                const tr = document.createElement('tr');
                const cells = row.split(',');
                cells.forEach((cell, cellIndex) => {
                    if (cellIndex === 0) {
                        // Primer elemento de cada fila como <h1>
                        const th = document.createElement('th');
                        th.innerHTML = `<h2>${cell}</h2>`;
                        tr.appendChild(th);
                    } else {
                        const td = document.createElement('td');
                        td.textContent = cell;
                        tr.appendChild(td);
                    }
                });
                table.appendChild(tr);
            });

            const csvData = document.getElementById('csvData');
            csvData.innerHTML = '';
            csvData.appendChild(table);
        })
        .catch(error => console.error('Error al cargar el archivo CSV:', error));
}
