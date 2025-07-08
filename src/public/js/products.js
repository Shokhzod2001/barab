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

lucide.createIcons();

// Show Add Chef Form
function showAddChefForm() {
  document.getElementById("addChefModal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

// Hide Add Chef Form
function hideAddChefForm() {
  document.getElementById("addChefModal").style.display = "none";
  document.body.style.overflow = "auto";
  resetForm();
}

// Reset Form
function resetForm() {
  document.getElementById("addChefForm").reset();
  document.getElementById("imagePreview").style.display = "none";
  document.getElementById("imagePreview").innerHTML = "";
  document.getElementById("memberTypeHidden").value = "USER";

  // Reset role badge and container
  const badge = document.getElementById("roleBadge");
  const container = document.querySelector(".chef-role-toggle");
  badge.textContent = "USER";
  badge.className = "role-badge";
  container.classList.remove("active");
}

// Image Preview
document.getElementById("memberImage").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const preview = document.getElementById("imagePreview");
      preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// Handle memberType checkbox
document.getElementById("memberType").addEventListener("change", function (e) {
  const isChef = this.checked;
  const badge = document.getElementById("roleBadge");
  const container = this.closest(".chef-role-toggle");

  document.getElementById("memberTypeHidden").value = isChef ? "CHEF" : "USER";

  // Update badge
  badge.textContent = isChef ? "CHEF" : "USER";
  badge.className = isChef ? "role-badge chef" : "role-badge";

  // Update container styling
  if (isChef) {
    container.classList.add("active");
  } else {
    container.classList.remove("active");
  }
});

// Form Submission
document.getElementById("addChefForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  // Explicitly set memberType based on checkbox
  formData.set(
    "memberType",
    document.getElementById("memberType").checked ? "CHEF" : "USER"
  );

  // Demo: Show form data in console (replace with actual API call)
  console.log("Form Data:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  // Simulate API call
  setTimeout(() => {
    alert("Chef added successfully! (Demo mode - check console for form data)");
    hideAddChefForm();

    // In a real application, you would make an actual API call like this:
    /*
                fetch('/admin/chef/create', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Chef added successfully!');
                        hideAddChefForm();
                        window.location.reload();
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while adding the chef.');
                });
                */
  }, 1000);
});

// Close modal when clicking outside
document
  .querySelector(".modal-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      hideAddChefForm();
    }
  });

// Handle escape key
document.addEventListener("keydown", function (e) {
  if (
    e.key === "Escape" &&
    document.getElementById("addChefModal").style.display === "flex"
  ) {
    hideAddChefForm();
  }
});
