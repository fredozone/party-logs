const newPartyForm = document.querySelector("#new-party-form");
const partyContainer = document.querySelector("#party-container");

const PARTIES_API_URL =
  "http://fsa-async-await.herokuapp.com/api/workshop/parties";
const GUESTS_API_URL =
  "http://fsa-async-await.herokuapp.com/api/workshop/guests";
const RSVPS_API_URL = "http://fsa-async-await.herokuapp.com/api/workshop/rsvps";
const GIFTS_API_URL = "http://fsa-async-await.herokuapp.com/api/workshop/gifts";

// get all parties
const getAllParties = async () => {
  try {
    const response = await fetch(PARTIES_API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch parties");
    }
    const parties = await response.json();
    return parties;
  } catch (error) {
    console.error(error);
    return []; // Return an empty array if there's an error
  }
};

// get single party by id
const getPartyById = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch party");
    }
    const party = await response.json();
    return party;
  } catch (error) {
    console.error(error);
    return null; // Return null if there's an error
  }
};

// delete party
const deleteParty = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      console.log("Party deleted successfully");
    } else {
      throw new Error("Failed to delete party");
    }
  } catch (error) {
    console.error(error);
  }
};

// render a single party by id
const renderSinglePartyById = async (id, container, detailsButton) => {
  try {
    // fetch party details from server
    const party = await getPartyById(id);
    if (!party) {
      throw new Error("Failed to fetch party details");
    }

    // GET - /api/workshop/guests/party/:partyId - get guests by party id
    const guestsResponse = await fetch(`${GUESTS_API_URL}/party/${id}`);
    if (!guestsResponse.ok) {
      throw new Error("Failed to fetch guests");
    }
    const guests = await guestsResponse.json();

    // GET - /api/workshop/rsvps/party/:partyId - get RSVPs by partyId
    const rsvpsResponse = await fetch(`${RSVPS_API_URL}/party/${id}`);
    if (!rsvpsResponse.ok) {
      throw new Error("Failed to fetch RSVPs");
    }
    const rsvps = await rsvpsResponse.json();

    // create new HTML element to display party details
    const partyDetailsElement = document.createElement("div");
    partyDetailsElement.classList.add("party-details-content");
    partyDetailsElement.innerHTML = `
      <h3>Party Details:</h3>
      <p><strong>Name:</strong> ${party.name}</p>
      <p><strong>Description:</strong> ${party.description}</p>
      <p><strong>Date:</strong> ${party.date}</p>
      <p><strong>Time:</strong> ${party.time}</p>
      <p><strong>Location:</strong> ${party.location}</p>
      <h3>Guests:</h3>
      <ul>
        ${guests
          .map(
            (guest, index) => `
              <li>
                <div>${guest.name}</div>
                <div>${rsvps[index].status}</div>
              </li>
            `
          )
          .join("")}
      </ul>
      <button class="close-button">Close</button>
    `;

    container.appendChild(partyDetailsElement);

    // add event listener to close button
    const closeButton = partyDetailsElement.querySelector(".close-button");
    closeButton.addEventListener("click", () => {
      partyDetailsElement.remove();
      detailsButton.style.visibility = "visible";
    });

    detailsButton.style.visibility = "hidden";
  } catch (error) {
    console.error(error);
  }
};

// render all parties
const renderParties = async () => {
  try {
    const parties = await getAllParties();
    if (!parties) {
      throw new Error("Failed to fetch parties");
    }

    partyContainer.innerHTML = "";
    if (parties.length === 0) {
      partyContainer.innerHTML = "<p>No parties available</p>";
      return;
    }

    parties.forEach((party) => {
      const partyElement = document.createElement("div");
      partyElement.classList.add("party");
      partyElement.innerHTML = `
        <h2>${party.name}</h2>
        <p>${party.description}</p>
        <p>${party.date}</p>
        <p>${party.time}</p>
        <p>${party.location}</p>
        <button class="details-button" data-id="${party.id}">See Details</button>
        <div class="party-details" data-id="${party.id}"></div>
        <button class="delete-button" data-id="${party.id}"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg></button>
      `;
      partyContainer.appendChild(partyElement);

      // see details
      const detailsButton = partyElement.querySelector(".details-button");
      detailsButton.addEventListener("click", async (event) => {
        const partyId = event.target.dataset.id;
        const partyDetailsContainer =
          partyElement.querySelector(".party-details");
        partyDetailsContainer.innerHTML = ""; // Clear previous details if any
        await renderSinglePartyById(
          partyId,
          partyDetailsContainer,
          detailsButton
        );
      });

      // delete party
      const deleteButton = partyElement.querySelector(".delete-button");
      deleteButton.addEventListener("click", async (event) => {
        const partyId = event.currentTarget.getAttribute("data-id");
        try {
          await deleteParty(partyId);
          await renderParties();
        } catch (error) {
          console.error(error);
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
};

// init function
const init = async () => {
  await renderParties();
};

init();
