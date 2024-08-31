let currentPage = 0;
const recordsPerPage = 10;
let allData = [];
let loading = false;
let sortColumn = ''; // Track the current sort column
let sortOrder = '';  // Track the current sort order

// Function to fetch JSON data
async function fetchData() {
    try {
        const response = await fetch('colleges_data.json');
        const data = await response.json();
        allData = data;
        loadTableData();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
// Function to filter table based on search input
function searchTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const filteredData = allData.filter(record => record.college.toLowerCase().includes(input));
    
    // Clear the table and load filtered data
    const tableBody = document.querySelector('#collegeTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows
    
    filteredData.forEach(record => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${record.cd_rank}</td>
            <td>${record.college}</td>
            <td>${record.course_fees}</td>
            <td>${record.placement_package}</td>
            <td>${record.user_reviews}/10</td> <!-- Display reviews as out of 10 -->
            <td>${record.rankings}</td>
        `;
        
        tableBody.appendChild(row);
    });

    // Reset pagination if needed
    currentPage = 0;
}


// Function to load data into the table
function loadTableData() {
    const tableBody = document.querySelector('#collegeTable tbody');
    const start = currentPage * recordsPerPage;
    const end = start + recordsPerPage;
    const recordsToDisplay = allData.slice(start, end);

    tableBody.innerHTML = ''; // Clear existing rows

    recordsToDisplay.forEach(record => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${record.cd_rank}</td>
            <td>${record.college}</td>
            <td>${record.course_fees}</td>
            <td>${record.placement_package}</td>
            <td>${record.user_reviews}/10</td> <!-- Display reviews as out of 10 -->
            <td>${record.rankings}</td>
        `;
        
        tableBody.appendChild(row);
    });

    currentPage++;
    loading = false;
    document.getElementById('loading').style.display = 'none';
}

// Function to handle infinite scroll
function handleScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.offsetHeight;

    if (scrollPosition >= documentHeight - 100 && !loading) { // Trigger load more when 100px from bottom
        loading = true;
        document.getElementById('loading').style.display = 'block';
        loadTableData();
    }
}

function sortTable(column, order) {
    // Columns that can be sorted
    const sortableColumns = ['cd_rank', 'course_fees', 'user_reviews', 'rankings'];

    // Check if the column to be sorted is valid
    if (!sortableColumns.includes(column)) {
        console.warn('Sorting not supported for this column:', column);
        return;
    }

    // Convert specific columns to numbers for sorting
    allData.forEach(record => {
        if (column === 'course_fees') {
            // Temporarily store numeric value for sorting
            record._course_fees = parseFloat(record.course_fees.replace(/[^0-9.]/g, ''));
        } else if (column === 'user_reviews') {
            record._user_reviews = parseFloat(record.user_reviews);
        } else if (column === 'rankings') {
            record._rankings = parseFloat(record.rankings);
        } else if (column === 'cd_rank') {
            record._cd_rank = parseFloat(record.cd_rank);
        }
    });

    // Perform sorting based on the numeric value
    allData.sort((a, b) => {
        let valA = a[`_${column}`];
        let valB = b[`_${column}`];

        if (order === 'asc') {
            return valA > valB ? 1 : (valA < valB ? -1 : 0);
        } else {
            return valA < valB ? 1 : (valA > valB ? -1 : 0);
        }
    });

    // Restore original format for display
    allData.forEach(record => {
        if (column === 'course_fees') {
            record.course_fees = record._course_fees.toLocaleString(); // Format with commas
        }
        // Restore other values if needed, e.g., user_reviews, rankings, cd_rank
        // But for simplicity, these are not being formatted back
    });

    // Clean up temporary properties
    allData.forEach(record => {
        delete record._course_fees;
        delete record._user_reviews;
        delete record._rankings;
        delete record._cd_rank;
    });

    // Clear and repopulate the table
    document.querySelector('#collegeTable tbody').innerHTML = '';
    currentPage = 0; // Reset pagination
    loadTableData();
}


// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    window.addEventListener('scroll', handleScroll);
});
