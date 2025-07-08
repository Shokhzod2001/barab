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

// Initialize Lucide icons
lucide.createIcons();

// DOM elements
const openFormBtn = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const productFormModal = document.getElementById("productFormModal");
const productForm = document.getElementById("productForm");
const regularTypeBtn = document.getElementById("regularTypeBtn");
const comboTypeBtn = document.getElementById("comboTypeBtn");
const comboSection = document.getElementById("comboSection");
const addComboBtn = document.getElementById("addComboBtn");
const comboItemsContainer = document.getElementById("comboItemsContainer");
const uploadImageBtn = document.getElementById("uploadImageBtn");
const imageUploadInput = document.getElementById("imageUploadInput");
const timeButtons = document.querySelectorAll(".time-btn");

// Open modal
openFormBtn.addEventListener("click", () => {
  productFormModal.classList.remove("hidden");
});

// Close modal
function closeModal() {
  productFormModal.classList.add("hidden");
}

closeFormBtn.addEventListener("click", closeModal);
cancelFormBtn.addEventListener("click", closeModal);

// Toggle product type
function setProductType(type) {
  if (type === "regular") {
    regularTypeBtn.classList.remove("btn-secondary");
    regularTypeBtn.classList.add("btn-primary");
    comboTypeBtn.classList.remove("btn-primary");
    comboTypeBtn.classList.add("btn-secondary");
    comboSection.classList.add("hidden");
  } else {
    regularTypeBtn.classList.remove("btn-primary");
    regularTypeBtn.classList.add("btn-secondary");
    comboTypeBtn.classList.remove("btn-secondary");
    comboTypeBtn.classList.add("btn-primary");
    comboSection.classList.remove("hidden");
  }
}

regularTypeBtn.addEventListener("click", () => setProductType("regular"));
comboTypeBtn.addEventListener("click", () => setProductType("combo"));

// Time selection
timeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("active");
    button.classList.toggle("inactive");
  });
});

// Add combo item
function addComboItem() {
  const comboId = Date.now();
  const comboItem = document.createElement("div");
  comboItem.className = "combo-item";
  comboItem.innerHTML = `
                <div class="combo-header">
                    <h4 class="combo-title">Combo Item</h4>
                    <button type="button" class="text-red-500 hover:text-red-700 remove-combo-btn">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Combo Name*</label>
                        <input type="text" name="comboName" class="form-input" placeholder="Combo name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Combo Price*</label>
                        <input type="number" name="comboPrice" class="form-input" placeholder="0.00" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Combo Drink</label>
                        <input type="text" name="comboDrink" class="form-input" placeholder="Drink included">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Combo Side</label>
                        <input type="text" name="comboSide" class="form-input" placeholder="Side included">
                    </div>
                </div>
            `;
  comboItemsContainer.appendChild(comboItem);

  // Add event listener to remove button
  const removeBtn = comboItem.querySelector(".remove-combo-btn");
  removeBtn.addEventListener("click", () => {
    comboItem.remove();
  });

  // Refresh Lucide icons
  lucide.createIcons();
}

addComboBtn.addEventListener("click", addComboItem);

// Image upload
uploadImageBtn.addEventListener("click", () => {
  imageUploadInput.click();
});

imageUploadInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 5) {
    alert("Maximum 5 images allowed");
    return;
  }

  files.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`File ${file.name} is too large (max 5MB)`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imagePreview = document.createElement("div");
      imagePreview.className = "image-preview group";
      imagePreview.innerHTML = `
                        <img src="${event.target.result}" alt="Product preview">
                        <button type="button" class="image-remove-btn">
                            <i data-lucide="x" class="w-3 h-3"></i>
                        </button>
                    `;
      uploadImageBtn.before(imagePreview);

      // Add event listener to remove button
      const removeBtn = imagePreview.querySelector(".image-remove-btn");
      removeBtn.addEventListener("click", () => {
        imagePreview.remove();
      });

      // Refresh Lucide icons
      lucide.createIcons();
    };
    reader.readAsDataURL(file);
  });
});

// Form submission
productForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Product created successfully! (This is a demo)");
  closeModal();
});
