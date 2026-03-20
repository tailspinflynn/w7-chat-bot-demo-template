"use strict";

console.log("Loading app.js");

const output = document.getElementById("output");
const inputArea = document.getElementById("inputArea");
const prompt = document.getElementById("prompt");
const chatHeader = document.getElementById("chatHeader");
const chatWindow = document.getElementById("chatWindow");
const workersURL =
  "https://api.cloudflare.com/client/v4/accounts/449ef439dd95c2dff1dc8801a4850f2b/ai/run/@cf/meta/llama-3-8b-instruct";
const corsURL = "https://corsproxy.io/?url=";
const url = corsURL + workersURL;

// "wakes up" the proxy key server before a text entry is made to speed up the initial response time
async function wakeUp() {
  try {
    fetch("https://proxy-key-0udy.onrender.com");
  } catch (error) {
    console.log("Didn't wake up");
  }
}

async function getKey() {
  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    };
    const res = await fetch(
      "https://proxy-key-0udy.onrender.com/get-key",
      options,
    );
    if (!res.ok) {
      throw new Error("bad");
    }

    const { key } = await res.json();
    console.log(key);
    return key;
  } catch (error) {
    console.log("Didn't get the key");
  }
}

async function promptToAPI(url, options) {
  try {
    const res = await fetch(url, options);
    console.log(res);
    if (!res.ok) {
      throw new Error("didn't get data");
    }
    const { result } = await res.json();
    return result;
  } catch (error) {
    console.log(error);
  }
}

function render(response, isBot) {
  const p = document.createElement("p");
  if (isBot) {
    p.className =
      "max-w-[75%] mr-auto rounded-lg bg-gray-200 px-3 py-2 text-black";
  } else {
    p.className =
      "max-w-[75%] ml-auto rounded-la bg-blue-600 px-3 py-2 text-white";
  }
  p.textContent = response;
  output.appendChild(p);
}

async function main() {
  render("Loading...", true);
  await wakeUp();
  output.textContent = "";
  render("How can I help you?", true);

  const messages = [
    {
      role: "system",
      content:
        "You are a sales rep trying to make sales on Clarinets, Saxophones, Drums, Guitars, Trumpets, trombones, and french horns. You do not go off topic, you only reply with the products or info about what a product is. Never respond with more than 30 words and never respond with a list of products.",
    },
  ];
  try {
    inputArea.addEventListener("submit", async (e) => {
      e.preventDefault();
      const key = await getKey();
      const workersEndpoint = url;
      messages.push({ role: "user", content: prompt.value });
      console.log(messages);
      const promptBody = {
        messages,
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(promptBody),
      };

      const { response } = await promptToAPI(url, options);
      //   const response = "response"
      messages.push({ role: "assistant", content: response });
      render(prompt.value, false);
      render(response, true);
    });

    //   collapsible chat bot box
    let isOpen = true;
    chatHeader.addEventListener("click", () => {
      isOpen = !isOpen;
      if (isOpen) {
        chatWindow.classList.remove("max-h-[50px]");
        chatWindow.classList.add("max-h-[425px]");
      } else {
        chatWindow.classList.remove("max-h-[425px]");
        chatWindow.classList.add("max-h-[50px]");
      }
    });
  } catch (error) {
    console.log(error);
  }
}

main();
