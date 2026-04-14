const BACKEND_URL = "https://math-ai-backend-4soe.onrender.com";

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
    `Hi! We'll work on <b>${subject}</b> step by step. What problem would you like help with?`,
    "bot"
  );
};

window.sendMessage = async function () {
  const input = document.getElementById("user-input");
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  try {
    const res = await fetch("YOUR_BACKEND_URL/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userText,
        history: chatHistory
      })
    });

    const data = await res.json();

    addMessage(data.reply, "bot");

    chatHistory.push(
      { role: "user", parts: [{ text: userText }] },
      { role: "model", parts: [{ text: data.reply }] }
    );

  } catch (err) {
    addMessage("Error: " + err.message, "bot");
  }
};

window.resetChat = function () {
  document.getElementById("chatbox").innerHTML = "";
  chatHistory = [];
};

window.fullReset = function () {
  location.reload();
};