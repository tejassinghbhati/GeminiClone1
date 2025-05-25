const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");

let userMessage = null;

// API configuration
const API_KEY = "AIzaSyC1Wm0818qs_8KFXRanko4NEP4-u76MC6U";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const loadLocalstorageData = () => {
  const savedChats = localStorage.getItem("saveChats");
  const isLightMode = localStorage.getItem("themeColor") === "light_mode";

  //Apply the stored theme
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  chatList.innerHTML = savedChats || "";
  chatList.scrollTo(0, chatList.scrollHeight); //Scroll to the bottom
};

loadLocalstorageData();

//Create a new message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

//Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(" ");
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    //Append each word to the text element with a space
    textElement.innerHTML +=
      (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");

    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("savedChats", chatList.innerHTML); //Save chats to the local storage
      chatList.scrollTo(0, chatList.scrollHeight); //Scroll to the bottom
    }
  }, 75);
};

//Fetch response from the API based on user message
const generateAPIresponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text"); //Get text element

  // Send a POST request to the API with the user's message
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      }),
    });

    const data = await response.json();

    //Get the API response text and remove asterisks from it
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    );
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    console.log(error);
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};

//Showing a loading animation while waiting for API response
const showLoadingAnimation = () => {
  const html = `<div class="message-content">
          <img
            src="gemini_icon-logo_brandlogos.net_bqzeu-512x512.png"
            alt="Gemini Image"
            class="avatar"
          />
          <p class="text">
          </p>
          <div class="loading-indicator">
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
          </div>
        </div>
        <span onclick = "copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatList.appendChild(incomingMessageDiv);

  chatList.scrollTo(0, chatList.scrollHeight); //Scroll to the bottom
  generateAPIresponse(incomingMessageDiv);
};

// copy message text to the clipboard
const copyMessage = (copyIcon) => {
  const messageText = copyIcon.parentElement.querySelector(".text").innerText;

  navigator.clipboard.writeText(messageText);
  copyIcon.innerText = "done"; //Show tick icon
  setTimeout(() => (copyIcon.innerText = "content_copy"), 1000); //Revert icon after 1 second
};

//Handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim();
  if (!userMessage) return; //Exit if there is no message

  console.log(userMessage);

  const html = `<div class="message outgoing">
        <div class="message-content">
          <img src="user image.jpg" alt="User Image" class="avatar" />
          <p class="text">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Praesentium, distinctio!
          </p>
        </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerHTML = userMessage;
  chatList.appendChild(outgoingMessageDiv);

  typingForm.reset(); //Clear Input Field
  chatList.scrollTo(0, chatList.scrollHeight); //Scroll to the bottom
  setTimeout(showLoadingAnimation, 500); // Show loading Animation after the delay
};

toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

typingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  handleOutgoingChat();
});
