const token = ""; //The token gotten from login
let param = new URLSearchParams(location.search);
let cid = param.get("cid");
// import Echo from "laravel-echo";
// import Pusher from "pusher-js";

// window.Pusher = Pusher;

// window.Echo = new Echo({
//   broadcaster: "pusher",
//   key: "chat",
//   wsHost: "198.244.143.6",
//   wsPort: 6001,
//   disableStats: true,
//   forceTLS: false,
//   encrypted: true,
// });

// window.Echo = new Echo({
//   broadcaster: "pusher",
//   key: "trivoh",
//   cluster: "1198.244.143.6:6001/app",
//   forceTLS: false,
// });

// window.addEventListener("DOMContentLoaded", (event) => {
//   console.log("DOM fully loaded and parsed");
//   Echo.channel(`conversation.${cid}`).listen("Chat", (e) => {
//     console.log(e);
//   });
// });

const form = document.querySelector("form#cbox");

document.getElementById("m-chat").addEventListener("click", (e) => {
  document.getElementById("mobile-chatlist").classList.remove("d-none");
});

// setInterval(() => {
getConversation();
getAllUserConversations();
getAllUserContacts();
// }, 5000);/

function getConversation(id) {
  if (cid == null && id == null) return;
  if (window.screen.width <= 768) {
    document.getElementById("mobile-chatlist").classList.add("d-none");
  }
  axios
    .get(`https://my.trivoh.com/api/chat/conversation/view/${cid || id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then(({ data }) => {
      // console.log(data.data);,.
      let messages = data.data.messages || [];
      let chatCover = document.getElementById("chat-cover");

      if (messages) {
        chatCover.innerHTML = "";
      }

      chatHeader(data.data.conversation);
      messages.map((ms, i) => chatMessages(ms, i));
      document.getElementById("cbox").classList.remove("d-none");
      document.getElementById("dbox").classList.remove("d-none");
    })
    .catch((error) => {
      document.getElementById("cbox").classList.add("d-none");
      document.getElementById("dbox").classList.add("d-none");
      console.error(error);
    });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = document.getElementById("chat-message-input").value;
  let dform = { message };
  // const formData = new FormData(form);
  // for (var [key, value] of formData.entries()) {
  //   console.log(key, value);
  //   formData.append(key, value);
  // }
  // let response = await fetch(`https://my.trivoh.com/api/chat/conversation/send/${cid}`, {
  //   // headers: {
  //   //   "Content-Type": "multipart/form-data",
  //   // },
  //   method: "POST",
  //   body: formData,
  // });
  // let result = await response.json();
  // console.log(result);
  // alert(result.message);
  axios
    .post(`https://my.trivoh.com/api/chat/conversation/send/${cid}`, dform, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // "multipart/form-data; boundary=----WebKitFormBoundaryB0I4rlXFLIHmQLOf",
      },
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
      console.log(err.message);
    });
});

function getAllUserConversations() {
  axios
    .get("https://my.trivoh.com/api/chat/conversations", {
      headers: { authorization: `Bearer ${token}` },
    })
    .then(({ data }) => {
      // console.log(data);
      data.data.map((v, i) => chatListEl(v, "chatlist", i));
      data.data.map((v, i) => chatListEl(v, "mobile-chatlist", i));
    })
    .catch((error) => console.error(error));
}

function getAllUserContacts() {
  axios
    .get("https://my.trivoh.com/api/chat/contacts", {
      headers: { authorization: `Bearer ${token}` },
    })
    .then(({ data }) => {
      console.log(data.data);
      data.data.map((v, i) => contactListEl(v, "contact-list", i));
      data.data.map((v, i) => contactListEl(v, "mobi-contact-list", i));
    })
    .catch((error) => console.error(error));
}

function chatEv() {
  const chatHead = document.getElementsByClassName("chat-head");
  for (let i = 0; i < chatHead.length; i++) {
    chatHead[i].addEventListener("click", (e) => {
      document.getElementById("mobile-chatlist").classList.add("d-none");
    });
  }
}

function contactEv() {
  const chatHead = document.getElementsByClassName("contact-item");
  for (let i = 0; i < chatHead.length; i++) {
    chatHead[i].addEventListener("click", (e) => {
      document.getElementById("mobi-contact-list").style.display =
        "none !important";
    });
  }
}

function chatMessages(message, i) {
  let chatCover = document.getElementById("chat-cover");
  const sender = (dt) => {
    let div = document.createElement("div");
    div.classList = "d-flex justify-content-end";
    let element = `
    <div class="d-flex flex-column">
      <div style="color: white" class="p-2 m-1 px-3 bg-trivoh rounded-pill">${dt.message.body}</div>
      <p style="font-size: x-small;">${dt.message.created_at}</p>
      </div>`;
    div.innerHTML = element;
    return div;
  };

  const receiver = (dt) => {
    let div = document.createElement("div");
    div.classList = "d-flex align-items-center";
    let element = `
    <div class="d-flex flex-column">
    <img
      src=${dt.message.sender.avatar}
      alt="user"
      style="width: 1.2rem; height: 1.2rem; border-radius: 100%"
    />
    <div style="background-color: white" class="p-2 px-3 m-1 rounded-pill">${dt.message.body}</div>
      <p style="font-size: x-small;">${dt.message.created_at}</p>
    </div>
  `;
    div.innerHTML = element;
    return div;
  };

  if (message.from_id == message.user_id) {
    chatCover.append(sender(message));
  } else {
    chatCover.append(receiver(message));
  }
}

function chatHeader(conv) {
  let chatHeader = `
  <div class="p-2 d-flex justify-content-between">
  <div class="" style="width: 3.7rem;  border-radius: 100%; overflow: hidden">
    <img
      src="${conv.image_url}"
      alt="user profile"
      style="width: 100%; height: 2.7rem; object-fit: cover;"
    />
    </div>
    <div
      class="d-flex lh-1 flex-column align-items-start justify-content-around px-2"
      style="width: 100%"
    >
      <span style="font-size: 14px;width: 15rem;text-overflow: ellipsis;overflow: hidden;">${
        conv.name
      }</span>
      <span style="font-size: 11px">${
        conv.user_online_status ? "online" : "offline"
      }</span>
    </div>
  </div>
  `;
  document.getElementById("dbox").innerHTML = chatHeader;
}

function chatListEl(v, id, i) {
  let div = document.createElement("div");
  div.setAttribute("role", "button");
  div.className = "chat-head p-2 d-flex justify-content-between border-top";
  div.onclick = () => {
    // console.log(v);
    cid = v.id;
    getConversation(v.id);
    history.pushState(null, "", `?cid=${v.id}`);
    // location.replace(`?cid=${v.id}`);
    // $("body").load(`?cid=${v.id}`);
  };

  if (i == 0) {
    document.getElementById(id).innerHTML = "";
  }
  let chatList = `
  <div style="width: 4.7rem; border-radius: 100%; overflow: hidden">
  <img
    src="${v.image_url}"
    alt="user profile"
    style="width: 100%; height: 2.7rem"
  />
  </div>
  <div
    class="d-flex lh-1 flex-column align-items-start justify-content-around px-2"
    style="width: 100%"
  >
    <span style="font-size: 14px;text-overflow: ellipsis;max-width: 7rem;overflow: hidden;">${
      v.name
    }</span>
    <span style="overflow: hidden;font-size: 11px;text-overflow: ellipsis;width: 6rem;">${
      v.last_message
    }</span>
  </div>
  <div class="d-flex lh-1 flex-column justify-content-between">
    <span style="font-size: 12px">${new Date(
      v.updated_at
    ).toLocaleDateString()}</span>
    <span style="font-size: 11px" class="pt-2">${new Date(
      v.updated_at
    ).toLocaleTimeString()}</span>
  </div>`;
  div.innerHTML = chatList;
  document.getElementById(id).appendChild(div);
  chatEv();
}

function contactListEl(v, id, i) {
  let div = document.createElement("div");
  div.setAttribute("role", "button");
  div.className =
    "contact-item d-flex px-1 flex-column justify-content-center align-items-center";
  div.onclick = () => {
    console.log(v);
    axios
      .get(`https://my.trivoh.com/api/chat/contact/${v.contact_user_id}`, {
        headers: { authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        let dt = data.data;
        console.log(dt.conversation.id);
        cid = dt.conversation.id;
        getConversation(dt.conversation.id);
        history.pushState(null, "", `?cid=${dt.conversation.id}`);
      })
      .catch((error) => console.error(error));
  };

  if (i == 0) {
    document.getElementById(id).innerHTML = "";
  }
  let contactList = `
    <div  style="width: 2.7rem; overflow: hidden; position: relative">
      <img
        src="${v.avatar_url}"
        alt="user profile"
        style="width: 2.7rem; height: 2.7rem; border-radius: 100%"
      />
      <div
        style="
          width: 7px;
          height: 7px;
          border-radius: 100%;
          background: ${v.online_status === 1 ? "green" : "#999"};
          position: absolute;
          bottom: 1px;
          left: 70%;
        "
      ></div>
    </div>
    <span
      style="
        font-size: 12px;
        text-overflow: ellipsis;
        max-width: 2.7rem;
        overflow: hidden;
        ">${v.name}</span>`;
  div.innerHTML = contactList;
  document.getElementById(id).appendChild(div);
  contactEv();
}
