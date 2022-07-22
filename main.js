// const url = "https://my.trivoh.com";
// const token = "546|VNH2RFEu7FEauRbn43X8U88vXVe80r9Uql63fQPr";

// const url = "http://localhost:3030";
const url = "https://trivoh-api.azurewebsites.net";
const urlObj = new URL(url);
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjU4LCJlbWFpbCI6ImFkZHltYWlsdGVzdEBnbWFpbC5jb20iLCJpYXQiOjE2NTg1MzA0MTksImV4cCI6MTY1OTEzNTIxOX0.o7MfVagkT68ymABbKTtlsGu_l7hAYBbDIASV4_c8zok";
let param = new URLSearchParams(location.search);
let cid = param.get("cid");

function connectWebSocket() {
  const wsProtocol = urlObj.protocol.includes("s") ? "wss://" : "ws://";
  let wsurl = `${wsProtocol}${urlObj.hostname}`;
  const ws = new WebSocket(wsurl, token);
  window.ws = ws;
  ws.onmessage = (resp) => {
    const response = JSON.parse(resp.data);
    if (response.meta == "message") {
      if (response.message.user_id == window.uid?.user?.id) {
        chatMessages(response, true);
        document.getElementById("chat-message-input").value = "";
        getAllUserConversations();
      } else {
        chatMessages(response);
      }
    }
  };

  // web socket log error
  ws.onerror = (err) => {
    console.log(err);
  };

  window.onbeforeunload = () => {
    ws.close();
  };

  //reconnect 5 seconds web socket is closed
  ws.onclose = () => {
    setTimeout(() => {
      connectWebSocket();
    }, 5000);
  };
}

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
    .get(`${url}/api/chat/conversation/view/${cid || id}`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then(({ data }) => {
      // console.log(data.data);
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

  let tbsent = {
    message: message, // Message text to be sent to other user
    meta: "message", // Will be "message" for messaging or "call" for call or empty for others
    room: cid, // Conversation id
  };
  ws.send(JSON.stringify(tbsent));
  // axios
  //   .post(`${url}/api/chat/conversation/send/${cid}`, dform, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //       // "multipart/form-data; boundary=----WebKitFormBoundaryB0I4rlXFLIHmQLOf",
  //     },
  //   })
  //   .then(({ data }) => {
  //     chatMessages(data.data, true);
  //     document.getElementById("chat-message-input").value = "";
  //     getAllUserConversations();
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     console.log(err.message);
  //   });
});

function getAllUserConversations() {
  axios
    .get(`${url}/api/chat/conversations`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then(({ data }) => {
      console.log(data);
      data.data.map((v, i) => chatListEl(v, "chatlist", i));
      data.data.map((v, i) => chatListEl(v, "mobile-chatlist", i));
    })
    .catch((error) => console.error(error));
}

function getAllUserContacts() {
  axios
    .get(`${url}/api/chat/contacts`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then(({ data }) => {
      // console.log(data.data);
      data.data.map((v, i) => contactListEl(v, "contact-list", i));
      // data.data.map((v, i) => contactListEl(v, "mobi-contact-list", i));
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
      <div style="color: white" class="p-2 m-1 px-3 bg-trivoh rounded-pill">${
        dt.message.body
      }</div>
      <p style="font-size: x-small;">${new Date(
        dt.updated_at
      ).toLocaleTimeString()} ${new Date(
      dt.updated_at
    ).toLocaleDateString()}</p>
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
      onError="this.onerror=null;this.src='${url}/files/users/default.png';"
      alt="user"
      style="width: 1.2rem; height: 1.2rem; border-radius: 100%"
    />
    <div style="background-color: white" class="p-2 px-3 m-1 rounded-pill">${
      dt.message.body
    }</div>
      <p style="font-size: x-small;">${new Date(
        dt.updated_at
      ).toLocaleDateString()} ${new Date(
      dt.updated_at
    ).toLocaleTimeString()}</p>
    </div>
  `;
    div.innerHTML = element;
    return div;
  };

  if (message.from_id == message.user_id || i) {
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
      onError="this.onerror=null;this.src='${url}/files/users/default.png';"
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
    onError="this.onerror=null;this.src='${url}/files/users/default.png';"
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
    axios
      .get(`${url}/api/chat/contact/${v.contact_user_id}`, {
        headers: { authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        let dt = data.data;
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
        onError="this.onerror=null;this.src='${url}/files/users/default.png';"
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
}

function getUser() {
  let data = axios
    .get(`${url}/api/auth/user`, {
      headers: { authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);
  return data;
}

(async () => {
  window.uid = await getUser();
  connectWebSocket();
})();
