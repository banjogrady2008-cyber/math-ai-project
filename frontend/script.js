const BACKEND_URL = "http://localhost:3000";

let chatHistory = [];

function addMessage(text, sender) {
  const chatbox = document.getElementById("chatbox");
  const message = document.createElement("div");
  message.className = `message ${sender}`;
  message.innerHTML = text;
  chatbox.appendChild(message);

  if (window.MathJax) {
    MathJax.typesetPromise([message]);
  }

  chatbox.scrollTop = chatbox.scrollHeight;
}

window.startTutor = function () {
  const grade = document.getElementById("grade").value;
  const subject = document.getElementById("subject").value.trim();
  const comfort = document.getElementById("comfort").value;

  if (!grade || !subject || comfort === "") {
    alert("Please fill out all fields.");
    return;
  }

  document.getElementById("setup-box").style.display = "none";
  document.getElementById("chatbox").style.display = "flex";
  document.getElementById("input-area").style.display = "flex";
  document.getElementById("side-controls").style.display = "flex";

  chatHistory = [];
  chatHistory.push({
    role: "user",
    parts: [{
      text: `Student profile:
Grade: ${grade}
Subject: ${subject}
Comfort level: ${comfort}`
    }]
  });

  addMessage(
    `Hi! We'll work on <b>${subject}</b> step by step.<br>What problem would you like help with?`,
    "bot"
  );
};

window.sendMessage = async function () {
  const input = document.getElementById("user-input");
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  chatHistory.push({
    role: "user",
    parts: [{ text: userText }]
  });

  try {
    const response = await fetch(BACKEND_URL + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ chatHistory })
    });

    const data = await response.json();

    if (data.error) {
      addMessage(data.error, "bot");
      return;
    }

    addMessage(data.text, "bot");

    chatHistory.push({
      role: "model",
      parts: [{ text: data.text }]
    });

  } catch (error) {
    addMessage("Connection error", "bot");
  }
};

window.resetChat = function () {
  document.getElementById("chatbox").innerHTML = "";
  chatHistory = [];
};

window.fullReset = function () {
  location.reload();
};