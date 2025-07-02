console.log("Users frontend javascript file");

lucide.createIcons();

// Sample users data
let users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@email.com",
    phone: "01234567890",
    status: "active",
    joinDate: "2024-01-15",
    orders: 25,
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
    orders: 12,
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
    orders: 38,
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
    orders: 5,
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
    orders: 18,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
];

// Get status color classes
function getStatusColor(status) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-yellow-100 text-yellow-800";
    case "blocked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Handle status change
function handleStatusChange(userId, newStatus) {
  if (
    confirm(
      `Are you sure you want to change this user's status to ${newStatus}?`
    )
  ) {
    users = users.map((user) =>
      user.id === userId ? { ...user, status: newStatus } : user
    );
    renderUsers();
  }
}

// Filter users
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

// Render users table
function renderUsers() {
  const filteredUsers = filterUsers();
  const tbody = document.getElementById("usersTableBody");
  const totalUsers = document.getElementById("totalUsers");

  totalUsers.textContent = filteredUsers.length;

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                            <div class="flex flex-col items-center">
                                <i data-lucide="users" class="w-12 h-12 text-gray-300 mb-2"></i>
                                <p>No users found</p>
                            </div>
                        </td>
                    </tr>
                `;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = filteredUsers
    .map(
      (user) => `
                <tr class="hover:bg-gray-50 hover-scale">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <img 
                                    src="${user.avatar}" 
                                    alt="${user.name}"
                                    class="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                    onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      user.name
                                    )}&background=f97316&color=fff&size=40'"
                                />
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${
                                  user.name
                                }</div>
                                <div class="text-sm text-gray-500">ID: ${
                                  user.id
                                }</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${user.email}</div>
                        <div class="text-sm text-gray-500">${user.phone}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <select
                            onchange="handleStatusChange(${
                              user.id
                            }, this.value)"
                            class="status-dropdown px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-orange-500 ${getStatusColor(
                              user.status
                            )}"
                        >
                            <option value="active" ${
                              user.status === "active" ? "selected" : ""
                            }>Active</option>
                            <option value="inactive" ${
                              user.status === "inactive" ? "selected" : ""
                            }>Inactive</option>
                            <option value="blocked" ${
                              user.status === "blocked" ? "selected" : ""
                            }>Blocked</option>
                        </select>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${user.joinDate}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            ${user.orders} orders
                        </span>
                    </td>
                </tr>
            `
    )
    .join("");
}

// Handle logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    alert("Logging out...");
    // Add logout logic here
  }
}

// Event listeners
document.getElementById("searchInput").addEventListener("input", renderUsers);
document.getElementById("statusFilter").addEventListener("change", renderUsers);

// Initial render
renderUsers();
