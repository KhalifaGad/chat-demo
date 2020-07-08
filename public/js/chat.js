let socket = io();
let params;

function scrollToBottom() {
  let messages = document.querySelector("#messages").lastElementChild;
  messages.scrollIntoView();
}

socket.on("connect", function () {
  let searchQuery = window.location.search.substring(1);
  params = JSON.parse(
    '{"' +
      decodeURI(searchQuery)
        .replace(/&/g, '","')
        .replace(/\+/g, " ")
        .replace(/=/g, '":"') +
      '"}'
  );
  params = Object.values(params);
  socket.emit("join", params, function (err) {
    if (err) {
      alert(err);
      window.location.href = "/";
    } else {
      console.log("No Error");
    }
  });
});

socket.on("disconnect", function () {
  console.log("disconnected from server.");
});

socket.on("updateUsersList", function (users) {
  let ol = document.createElement("ol");

  users.forEach(function (user) {
    let li = document.createElement("li");
    li.innerHTML = user;
    ol.appendChild(li);
  });

  let usersList = document.querySelector("#users");
  usersList.innerHTML = "";
  usersList.appendChild(ol);
});

socket.on("newMessage", function (message) {
  const formattedTime = moment(message.createdAt).format("LT");
  const template = document.querySelector("#message-template").innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formattedTime,
  });

  const div = document.createElement("div");
  div.innerHTML = html;

  document.querySelector("#messages").appendChild(div);
  scrollToBottom();
});

socket.on("newLocationMessage", function (message) {
  const formattedTime = moment(message.createdAt).format("LT");
  console.log("newLocationMessage", message);

  const template = document.querySelector("#location-message-template")
    .innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime,
  });

  const div = document.createElement("div");
  div.innerHTML = html;

  document.querySelector("#messages").appendChild(div);
  scrollToBottom();
});

socket.on("image-uploaded", function (message) {
  alert(message.name);
  var img = document.createElement("img");
  console.log(img)
  img.setAttribute("src", message.name);
  img.setAttribute("height", "100px");
  document.getElementById("messages").appendChild(img);
});

document.querySelector("#submit-btn").addEventListener("click", function (e) {
  e.preventDefault();
  socket.emit(
    "createMessage",
    {
      text: document.querySelector('input[name="message"]').value,
      userId: params[0],
    },
    function () {
      document.querySelector('input[name="message"]').value = "";
    }
  );
});

document.querySelector("#my-file").addEventListener("change", function (e) {
  e.preventDefault();
  let file = document.querySelector("#my-file");
  if (!file.files.length) {
    return;
  }

  let firstFile = file.files[0],
    reader = new FileReader();

  reader.onloadend = function () {
    alert(firstFile.name);
    socket.emit("upload-image", {
      name: firstFile.name,
      data: reader.result,
    });
  };

  reader.readAsArrayBuffer(firstFile);
});

document
  .querySelector("#send-location")
  .addEventListener("click", function (e) {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser.");
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        socket.emit("createLocationMessage", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      function () {
        alert("Unable to fetch location.");
      }
    );
  });
