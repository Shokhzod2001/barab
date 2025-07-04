// Sample data for users
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@email.com",
    phone: "01234567890",
    status: "active",
    joinDate: "2024-01-15",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@email.com",
    phone: "01234567891",
    status: "inactive",
    joinDate: "2024-02-20",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@email.com",
    phone: "01234567892",
    status: "active",
    joinDate: "2024-03-10",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@email.com",
    phone: "01234567893",
    status: "blocked",
    joinDate: "2024-01-25",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david@email.com",
    phone: "01234567894",
    status: "active",
    joinDate: "2024-04-05",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
];

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  renderUsers();

  // Initialize Lucide icons (if needed)
  lucide.createIcons();
});

// Render users table
function renderUsers(filteredUsers = users) {
  const tableBody = document.getElementById("usersTableBody");
  tableBody.innerHTML = "";

  filteredUsers.forEach((user) => {
    const row = document.createElement("tr");

    // Determine status class
    let statusClass = "";
    if (user.status === "active") statusClass = "status-active";
    else if (user.status === "inactive") statusClass = "status-inactive";
    else if (user.status === "blocked") statusClass = "status-blocked";

    row.innerHTML = `
          <td>
            <div class="user-cell">
              <img 
                src="${user.avatar}" 
                alt="${user.name}"
                class="user-avatar"
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=3b82f6&color=fff&size=48'"
              />
              <div class="status-dot"></div>
              <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-id">ID: #${user.id
                  .toString()
                  .padStart(3, "0")}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="contact-cell">
              <div class="contact-item email">
                <i data-lucide="mail"></i>
                ${user.email}
              </div>
              <div class="contact-item phone">
                <i data-lucide="phone"></i>
                ${user.phone}
              </div>
            </div>
          </td>
          <td>
            <select
              value="${user.status}"
              onchange="handleUserStatusChange(${user.id}, this.value)"
              class="status-select ${statusClass}"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </td>
          <td>
            <div class="date-cell">
              <i data-lucide="clock"></i>
              ${user.joinDate}
            </div>
          </td>
        `;

    tableBody.appendChild(row);
  });

  // Refresh Lucide icons
  lucide.createIcons();
}

// Handle user status change
function handleUserStatusChange(userId, newStatus) {
  if (
    confirm(
      `Are you sure you want to change this user's status to ${newStatus}?`
    )
  ) {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].status = newStatus;
      renderUsers(filterUsers());
    }
  }
}

// Filter users based on search and status
function filterUsers() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;

  return users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.phone.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}

// Handle search input
function handleSearch() {
  renderUsers(filterUsers());
}

// Handle status filter change
function handleStatusFilter() {
  renderUsers(filterUsers());
}

// Initial render
renderUsers();
