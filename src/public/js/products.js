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
const productPriceInput = document.querySelector('input[name="productPrice"]');
const comboPriceInput = document.getElementById("comboPriceInput");
const comboPriceSummary = document.getElementById("comboPriceSummary");
const comboItemsTotal = document.getElementById("comboItemsTotal");

// Store available products for combos
let availableProducts = [];
let comboItems = [];

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

    // Reset combo items when switching to regular
    comboItemsContainer.innerHTML = "";
    comboItems = [];
  } else {
    regularTypeBtn.classList.remove("btn-primary");
    regularTypeBtn.classList.add("btn-secondary");
    comboTypeBtn.classList.remove("btn-secondary");
    comboTypeBtn.classList.add("btn-primary");
    comboSection.classList.remove("hidden");

    // Load products when switching to combo
    fetchAvailableProducts();
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

// Fetch available products for combo items
async function fetchAvailableProducts() {
  try {
    // In a real app, replace this with your actual API call
    // const response = await fetch('/api/products/available');
    // availableProducts = await response.json();

    // Mock data for demonstration
    availableProducts = [
      { _id: "prod1", productName: "Big Burger", productPrice: 12 },
      { _id: "prod2", productName: "Cheese Burger", productPrice: 10 },
      { _id: "prod3", productName: "Chicken Burger", productPrice: 11 },
      { _id: "prod4", productName: "French Fries", productPrice: 5 },
      { _id: "prod5", productName: "Soda", productPrice: 3 },
    ];
  } catch (error) {
    console.error("Error fetching products:", error);
    availableProducts = [];
  }
}

// Add product selection to combo
async function addComboItem() {
  if (availableProducts.length === 0) {
    await fetchAvailableProducts();
  }

  const comboItemId = Date.now();
  const comboItem = document.createElement("div");
  comboItem.className = "combo-product-item";
  comboItem.dataset.id = comboItemId;

  // Create product options HTML
  const productOptions = availableProducts
    .map(
      (product) =>
        `<option value="${product._id}" data-price="${product.productPrice}">${product.productName} ($${product.productPrice})</option>`
    )
    .join("");

  comboItem.innerHTML = `
                <div class="combo-product-header">
                    <h4 class="text-sm font-medium">Combo Product</h4>
                    <button type="button" class="text-red-500 hover:text-red-700 remove-combo-item-btn">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-2">
                    <div class="form-group">
                        <label class="form-label">Product*</label>
                        <select class="form-input combo-product-select" required>
                            <option value="">Select a product</option>
                            ${productOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Quantity*</label>
                        <input type="number" class="form-input combo-product-qty" value="1" min="1" required>
                    </div>
                </div>
            `;

  comboItemsContainer.appendChild(comboItem);

  // Add event listeners
  const removeBtn = comboItem.querySelector(".remove-combo-item-btn");
  removeBtn.addEventListener("click", () => {
    comboItem.remove();
    comboItems = comboItems.filter((item) => item.id !== comboItemId);
    updateComboSummary();
  });

  const productSelect = comboItem.querySelector(".combo-product-select");
  const qtyInput = comboItem.querySelector(".combo-product-qty");

  productSelect.addEventListener("change", () => {
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const productId = productSelect.value;
    const price = parseFloat(selectedOption.dataset.price);
    const quantity = parseInt(qtyInput.value) || 1;

    // Update or add combo item
    const existingItemIndex = comboItems.findIndex(
      (item) => item.id === comboItemId
    );
    if (existingItemIndex >= 0) {
      comboItems[existingItemIndex] = {
        id: comboItemId,
        productId,
        price,
        quantity,
      };
    } else {
      comboItems.push({
        id: comboItemId,
        productId,
        price,
        quantity,
      });
    }

    updateComboSummary();
  });

  qtyInput.addEventListener("change", () => {
    const quantity = parseInt(qtyInput.value) || 1;
    const existingItemIndex = comboItems.findIndex(
      (item) => item.id === comboItemId
    );

    if (existingItemIndex >= 0 && productSelect.value) {
      comboItems[existingItemIndex].quantity = quantity;
      updateComboSummary();
    }
  });

  // Refresh Lucide icons
  lucide.createIcons();
}

// Update combo summary and total price
function updateComboSummary() {
  const total = comboItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  comboItemsTotal.textContent = `$${total.toFixed(2)}`;
  comboPriceInput.value = total.toFixed(2);
  productPriceInput.value = total.toFixed(2);
}

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
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect form data
  const formData = new FormData(productForm);
  const productData = {
    productStatus: formData.get("productStatus"),
    productCategory: formData.get("productCategory"),
    productName: formData.get("productName"),
    productPrice: parseFloat(formData.get("productPrice")),
    productDesc: formData.get("productDesc"),
    productSize: formData.get("productSize"),
    productVolume: formData.get("productVolume"),
    productSpice: formData.get("productSpice"),
    preparationTime: parseInt(formData.get("preparationTime")) || 15,
    calories: parseInt(formData.get("calories")) || 0,
    productLeftCount: parseInt(formData.get("productLeftCount")) || 999,
    tags: formData.get("tags")
      ? formData
          .get("tags")
          .split(",")
          .map((tag) => tag.trim())
      : [],
    isPopular: formData.get("isPopular") === "on",
    isNewItem: formData.get("isNewItem") === "on",
  };

  // Handle available times
  const selectedTimes = [];
  document.querySelectorAll(".time-btn.active").forEach((btn) => {
    selectedTimes.push(btn.textContent);
  });
  productData.productTime =
    selectedTimes.length > 0 ? selectedTimes : ["ALL_DAY"];

  // Handle combo if it's a combo product
  if (comboTypeBtn.classList.contains("btn-primary")) {
    productData.combos = [
      {
        comboName: formData.get("comboName"),
        comboPrice: parseFloat(formData.get("comboPrice")),
        comboDrink: formData.get("comboDrink"),
        comboSide: formData.get("comboSide"),
        comboItems: comboItems.map((item) => item.productId),
      },
    ];
  }

  // In a real app, you would send to your API
  console.log("Product data to submit:", productData);

  // Here you would typically:
  // 1. Send to your backend API
  // 2. Handle response
  // 3. Update UI or redirect

  // Demo success message
  alert(`Product ${productData.productName} created successfully!`);
  closeModal();

  // Reset form
  productForm.reset();
  comboItemsContainer.innerHTML = "";
  comboItems = [];
  comboItemsTotal.textContent = "$0.00";
});

// Initialize combo functionality
addComboBtn.addEventListener("click", addComboItem);
