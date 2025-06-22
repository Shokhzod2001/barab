console.log("Login frontend javascript file");

function validateSignupForm() {
  const memberNick = $(".member-nick").val(),
    memberPassword = $(".member-password").val();

  if (memberNick === "" || memberPassword === "") {
    alert("Please insert all required inputs");
    return false;
  }
}
