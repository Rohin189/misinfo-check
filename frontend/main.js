document.addEventListener("DOMContentLoaded", () => {
    // Get references to DOM elements
    const checkBtn = document.getElementById("checkBtn");
    const newsText = document.getElementById("newsText");
    const resultDiv = document.getElementById("result");
    const verdictText = document.getElementById("verdictText");

    // Function to handle the API call and UI updates
    const checkMisinformation = async () => {
        const text = newsText.value.trim();
        if (!text) {
            alert("Please enter some text to check.");
            return;
        }

        // --- UI Updates for Loading State ---
        checkBtn.disabled = true;
        checkBtn.textContent = "Checking...";
        resultDiv.classList.add("hidden");

        try {
            const response = await fetch("http://localhost:5000/api/check/guest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                // Handle server errors (e.g., 500 Internal Server Error)
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                // Update UI with the structured response
                displayResults(data);
            } else {
                // Handle application-specific errors returned from the API
                alert(`Error: ${data.error || "An unknown error occurred."}`);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert("Failed to connect to the server. Please check the console for more details.");
        } finally {
            // --- Reset UI after completion ---
            checkBtn.disabled = false;
            checkBtn.textContent = "Check";
        }
    };

    // Function to display results and apply verdict-specific styling
    const displayResults = (data) => {
        // Use innerHTML to render the <br> tag correctly
      verdictText.innerHTML = `
  <strong>Verdict:</strong> ${data.verdict}<br>
  <strong>Confidence:</strong> ${(data.confidence).toFixed(1)}%<br>
  <strong>Explanation:</strong> ${data.explanation || "N/A"}
`;

        // Reset previous verdict classes
        resultDiv.classList.remove("verdict-True", "verdict-False", "verdict-Misleading", "hidden");

        // Add the new class based on the verdict for styling
        const verdictClass = data.verdict.replace(/\s+/g, '-');
        resultDiv.classList.add(`verdict-${verdictClass}`);
    };

    // Attach the event listener to the button
    checkBtn.addEventListener("click", checkMisinformation);
});
