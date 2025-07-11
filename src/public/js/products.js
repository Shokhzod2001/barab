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
      productName: userCell.querySelector(".user-name").textContent.trim(),
      productCategory: contactCell.textContent.trim(),
      productStatus: statusSelect.value,
      element: row, // Keep reference to the row element
    };
  });

  // Initialize existing jQuery status change handler
  $(".member-status").on("change", function (event) {
    const id = event.target.id;
    const productStatus = $(this).val();

    // Change color immediately
    $(this).removeClass("status-PROCESS status-PAUSE status-DELETE");
    $(this).addClass(`status-${productStatus}`);

    // Update database
    axios
      .post(`/admin/product/${id}`, {
        _id: id,
        productStatus: productStatus,
      })
      .then((response) => {
        console.log("response:", response);
        const result = response.data;

        if (result.data) {
          console.log("Product updated!");
          $(".member-status").blur();

          // Update local users array
          const userIndex = users.findIndex((user) => user._id === id);
          if (userIndex !== -1) {
            users[userIndex].productStatus = productStatus;
          }
        } else {
          alert("Product update failed!");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Product update failed!");
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
      user.productName.toLowerCase().includes(searchTerm) ||
      user.productCategory.toLowerCase().includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        matchesStatus = user.productStatus === "PROCESS";
      } else if (statusFilter === "inactive") {
        matchesStatus = user.productStatus === "PAUSE";
      } else if (statusFilter === "blocked") {
        matchesStatus = user.productStatus === "DELETE";
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

// Modal toggle functions
document.getElementById("openFormBtn").addEventListener("click", () => {
  document.getElementById("productFormModal").classList.remove("hidden");
});

document.getElementById("closeFormBtn").addEventListener("click", closeModal);

function closeModal() {
  document.getElementById("productFormModal").classList.add("hidden");
}

// Product type toggle with color change
function setProductType(type) {
  const regularBtn = document.getElementById("regularTypeBtn");
  const comboBtn = document.getElementById("comboTypeBtn");
  const categorySelect = document.querySelector('[name="productCategory"]');
  const mainPriceInput = document.querySelector('[name="productPrice"]');
  const comboPriceInput = document.querySelector('[name="comboPrice"]');

  // Update button styles
  if (type === "regular") {
    regularBtn.classList.remove("btn-secondary");
    regularBtn.classList.add("btn-primary");
    comboBtn.classList.remove("btn-primary");
    comboBtn.classList.add("btn-secondary");

    // Reset category to default (BURGERS)
    categorySelect.value = "BURGERS";

    // Enable main price, disable combo price
    mainPriceInput.disabled = false;
    mainPriceInput.required = true;
    comboPriceInput.disabled = true;
    comboPriceInput.required = false;
  } else {
    comboBtn.classList.remove("btn-secondary");
    comboBtn.classList.add("btn-primary");
    regularBtn.classList.remove("btn-primary");
    regularBtn.classList.add("btn-secondary");

    // Set category to COMBO
    categorySelect.value = "COMBO";

    // Disable main price, enable combo price
    mainPriceInput.disabled = true;
    mainPriceInput.required = false;
    comboPriceInput.disabled = false;
    comboPriceInput.required = true;

    // Auto-copy combo price to main price (for backend consistency)
    comboPriceInput.addEventListener("input", () => {
      mainPriceInput.value = comboPriceInput.value;
    });
  }

  // Update hidden field
  document.getElementById("productType").value = type;

  // Toggle combo section visibility
  document
    .getElementById("comboSection")
    .classList.toggle("hidden", type !== "combo");
}

// Initialize button states on page load
document.addEventListener("DOMContentLoaded", function () {
  setProductType("regular"); // Set default to regular
});

// Time selection toggle
function toggleTime(button) {
  button.classList.toggle("active");
  button.classList.toggle("inactive");
  const checkbox = button.nextElementSibling;
  checkbox.checked = !checkbox.checked;
}

// Image upload handling
document
  .getElementById("imageUploadInput")
  .addEventListener("change", function (e) {
    if (this.files.length > 5) {
      alert("Maximum 5 images allowed");
      this.value = ""; // Clear selection
      return;
    }

    // Show previews
    const previews = document.getElementById("imagePreviews");
    previews.innerHTML = "";

    Array.from(this.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const preview = document.createElement("div");
        preview.className = "image-preview";
        preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        previews.appendChild(preview);
      };
      reader.readAsDataURL(file);
    });
  });

// Category change handler for size/volume
document
  .querySelector('[name="productCategory"]')
  .addEventListener("change", function () {
    const isBeverage = this.value === "BEVERAGES";
    document.getElementById("product-collection").style.display = isBeverage
      ? "none"
      : "block";
    document.getElementById("product-volume").style.display = isBeverage
      ? "block"
      : "none";
  });
