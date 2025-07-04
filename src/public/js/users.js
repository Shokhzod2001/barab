// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Filter users based on search and status
  function filterUsers() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;

    return users.filter((user) => {
      const matchesSearch =
        user.memberNick.toLowerCase().includes(searchTerm) ||
        user.memberPhone.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || user.memberStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // Handle search input
  function handleSearch() {
    renderUsers(filterUsers());
  }

  $(function () {
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
          } else {
            alert("User update failed!");
          }
        })
        .catch((err) => {
          console.log(err);
          alert("User update failed!");
        });
    });
  });

  // Initialize Lucide icons (if needed)
  lucide.createIcons();
});
