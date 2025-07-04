// Get users data from the server-rendered table
let users = [];

// Extract users data when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Extract users from existing table
  const tableRows = document.querySelectorAll("#usersTableBody tr");
  users = Array.from(tableRows).map((row, index) => {
    const userCell = row.querySelector(".user-cell");
    const contactCell = row.querySelector(".contact-cell");
    const statusSelect = row.querySelector(".member-status");

    return {
      _id: statusSelect.id,
      memberNick: userCell.querySelector(".user-name").textContent.trim(),
      memberPhone: contactCell.textContent.trim(),
      memberStatus: statusSelect.value,
      element: row, // Keep reference to the row element
    };
  });

  // Initialize existing jQuery status change handler
  $(".member-status").on("change", function (event) {
    const id = event.target.id;
    const memberStatus = $(this).val();

    // Change color immediately
    $(this).removeClass("status-ACTIVE status-BLOCK status-DELETE");
    $(this).addClass(`status-${memberStatus}`);

    // Update database
    axios
      .post("/admin/user/edit", {
        _id: id,
        memberStatus: memberStatus,
      })
      .then((response) => {
        console.log("response:", response);
        const result = response.data;

        if (result.data) {
          console.log("User updated!");
          $(".member-status").blur();

          // Update local users array
          const userIndex = users.findIndex((user) => user._id === id);
          if (userIndex !== -1) {
            users[userIndex].memberStatus = memberStatus;
          }
        } else {
          alert("User update failed!");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("User update failed!");
      });
  });

  // Initialize Lucide icons
  lucide.createIcons();
});

// Filter users based on search and status (MOVED OUTSIDE DOMContentLoaded)
function filterUsers() {
  const searchTerm = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const statusFilter = document.getElementById("statusFilter").value;

  return users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.memberNick.toLowerCase().includes(searchTerm) ||
      user.memberPhone.toLowerCase().includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        matchesStatus = user.memberStatus === "ACTIVE";
      } else if (statusFilter === "inactive") {
        matchesStatus = user.memberStatus === "BLOCK";
      } else if (statusFilter === "blocked") {
        matchesStatus = user.memberStatus === "DELETE";
      }
    }

    return matchesSearch && matchesStatus;
  });
}

// Handle search input (MOVED OUTSIDE DOMContentLoaded)
function handleSearch() {
  const filteredUsers = filterUsers();
  showFilteredUsers(filteredUsers);
}

// Handle status filter (MOVED OUTSIDE DOMContentLoaded)
function handleStatusFilter() {
  const filteredUsers = filterUsers();
  showFilteredUsers(filteredUsers);
}

// Show/hide table rows based on filter
function showFilteredUsers(filteredUsers) {
  const filteredIds = filteredUsers.map((user) => user._id);

  // Show/hide rows based on filter
  users.forEach((user) => {
    if (filteredIds.includes(user._id)) {
      user.element.style.display = "";
    } else {
      user.element.style.display = "none";
    }
  });

  // Show "no results" message if no users match
  const tableBody = document.getElementById("usersTableBody");
  let noResultsRow = document.getElementById("noResultsRow");

  if (filteredUsers.length === 0) {
    if (!noResultsRow) {
      noResultsRow = document.createElement("tr");
      noResultsRow.id = "noResultsRow";
      noResultsRow.innerHTML = `
        <td colspan="4" style="text-align: center; padding: 2rem; color: #666;">
          No users found matching your criteria
        </td>
      `;
      tableBody.appendChild(noResultsRow);
    }
    noResultsRow.style.display = "";
  } else {
    if (noResultsRow) {
      noResultsRow.style.display = "none";
    }
  }
}
